import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { acceptOffer, declineOffer } from '../utils/offerUtils'
import './OfferMessage.css'

/**
 * OfferMessage renders an offer within a chat thread.
 * For the seller, it shows Accept/Decline action buttons on pending offers.
 * For the buyer, it shows the offer status.
 * For accepted/declined offers, it shows a status indicator.
 */
export default function OfferMessage({ message, offer, currentUserId, sellerId, onOfferAction }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isSeller = currentUserId === sellerId
  const isPending = offer?.status === 'pending'
  const isAccepted = offer?.status === 'accepted'
  const isDeclined = offer?.status === 'declined'

  const handleAccept = async () => {
    if (!offer?.id) return
    setLoading(true)
    setError(null)

    const result = await acceptOffer(supabase, offer.id, currentUserId)

    if (result.success) {
      if (onOfferAction) {
        onOfferAction('accepted', offer.id)
      }
    } else {
      setError(result.error || 'Failed to accept offer')
    }

    setLoading(false)
  }

  const handleDecline = async () => {
    if (!offer?.id) return
    setLoading(true)
    setError(null)

    const result = await declineOffer(supabase, offer.id, currentUserId)

    if (result.success) {
      if (onOfferAction) {
        onOfferAction('declined', offer.id)
      }
    } else {
      setError(result.error || 'Failed to decline offer')
    }

    setLoading(false)
  }

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`offer-message ${isAccepted ? 'accepted' : ''} ${isDeclined ? 'declined' : ''}`}>
      <div className="offer-message__icon">$</div>
      <div className="offer-message__content">
        <div className="offer-message__header">
          <span className="offer-message__label">Offer</span>
          <span className="offer-message__amount">
            {offer?.amount ? formatAmount(offer.amount) : message.content}
          </span>
        </div>

        {isPending && (
          <span className="offer-message__status offer-message__status--pending">
            Pending
          </span>
        )}
        {isAccepted && (
          <span className="offer-message__status offer-message__status--accepted">
            Accepted
          </span>
        )}
        {isDeclined && (
          <span className="offer-message__status offer-message__status--declined">
            Declined
          </span>
        )}

        {isSeller && isPending && (
          <div className="offer-message__actions">
            <button
              className="offer-message__accept-btn"
              onClick={handleAccept}
              disabled={loading}
              aria-label="Accept offer"
            >
              {loading ? 'Processing...' : 'Accept'}
            </button>
            <button
              className="offer-message__decline-btn"
              onClick={handleDecline}
              disabled={loading}
              aria-label="Decline offer"
            >
              {loading ? 'Processing...' : 'Decline'}
            </button>
          </div>
        )}

        {error && (
          <div className="offer-message__error">
            {error}
          </div>
        )}

        <span className="offer-message__timestamp">
          {formatTimestamp(message?.created_at || offer?.created_at)}
        </span>
      </div>
    </div>
  )
}
