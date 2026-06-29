import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import './OfferForm.css'

export default function OfferForm({ listingId, listingPrice, sellerId, listingStatus, onSuccess }) {
  const { user } = useAuth()
  const { openOrCreateThread } = useChat()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (listingStatus === 'sold') {
    return (
      <div className="offer-form">
        <p className="offer-form__unavailable">This listing is no longer available</p>
      </div>
    )
  }

  function validate(value) {
    const num = parseFloat(value)
    if (isNaN(num) || num < 0.01 || num > listingPrice) {
      return `Offer must be between $0.01 and $${parseFloat(listingPrice).toFixed(2)}`
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const validationError = validate(amount)
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)

    try {
      await submitOffer(listingId, parseFloat(amount), sellerId, user.id, openOrCreateThread)
      setAmount('')
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to submit offer')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="offer-form" onSubmit={handleSubmit}>
      <label className="offer-form__label" htmlFor="offer-amount">
        Make an Offer
      </label>
      <div className="offer-form__input-group">
        <span className="offer-form__currency">$</span>
        <input
          id="offer-amount"
          type="number"
          className="offer-form__input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`0.01 - ${parseFloat(listingPrice).toFixed(2)}`}
          min="0.01"
          max={listingPrice}
          step="0.01"
          disabled={submitting}
          aria-label="Offer amount"
        />
        <button
          type="submit"
          className="offer-form__submit btn-primary"
          disabled={submitting || !amount}
        >
          {submitting ? 'Sending...' : 'Submit Offer'}
        </button>
      </div>
      {error && <p className="offer-form__error" role="alert">{error}</p>}
    </form>
  )
}

/**
 * Submits an offer for a listing. Inserts into the offers table,
 * opens or creates a chat thread, and posts an offer-type message.
 */
export async function submitOffer(listingId, amount, sellerId, buyerId, openOrCreateThread) {
  // 1. Insert the offer into the offers table
  const { data: offer, error: offerError } = await supabase
    .from('offers')
    .insert({
      listing_id: listingId,
      buyer_id: buyerId,
      amount,
      status: 'pending',
    })
    .select()
    .single()

  if (offerError) {
    throw new Error(offerError.message || 'Failed to submit offer')
  }

  // 2. Open or create a chat thread for this listing
  const thread = await openOrCreateThread(listingId, sellerId)
  if (!thread) {
    throw new Error('Failed to open chat thread')
  }

  // 3. Insert an offer-type message in the chat thread
  const { error: msgError } = await supabase
    .from('chat_messages')
    .insert({
      thread_id: thread.id,
      sender_id: buyerId,
      content: JSON.stringify({ offerId: offer.id, amount }),
      message_type: 'offer',
    })

  if (msgError) {
    throw new Error(msgError.message || 'Failed to send offer message')
  }

  return offer
}
