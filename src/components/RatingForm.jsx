import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { submitRating } from '../utils/ratingUtils'
import './RatingForm.css'

export default function RatingForm({ listingId, sellerId, onSuccess }) {
  const { user } = useAuth()
  const [score, setScore] = useState(0)
  const [hoverScore, setHoverScore] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setError('')
    setSubmitting(true)

    const { data, error: submitError } = await submitRating(supabase, {
      listingId,
      buyerId: user.id,
      sellerId,
      score,
      review: review.trim() || undefined,
    })

    setSubmitting(false)

    if (submitError) {
      setError(submitError)
      return
    }

    setSuccess(true)
    if (onSuccess) {
      onSuccess(data)
    }
  }

  if (success) {
    return (
      <div className="rating-form rating-success">
        <p>✓ Thank you for your rating!</p>
      </div>
    )
  }

  return (
    <form className="rating-form" onSubmit={handleSubmit}>
      <h4 className="rating-form-title">Rate this seller</h4>

      <div className="star-selector" role="group" aria-label="Rating score">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= (hoverScore || score) ? 'active' : ''}`}
            onClick={() => setScore(star)}
            onMouseEnter={() => setHoverScore(star)}
            onMouseLeave={() => setHoverScore(0)}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            aria-pressed={star <= score}
          >
            ★
          </button>
        ))}
      </div>

      <div className="review-field">
        <textarea
          className="review-input"
          placeholder="Write a review (optional)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          maxLength={500}
          rows={3}
          aria-label="Review text"
        />
        <span className="char-counter">{review.length}/500</span>
      </div>

      {error && <p className="rating-error">{error}</p>}

      <button
        type="submit"
        className="btn-primary rating-submit"
        disabled={score === 0 || submitting}
      >
        {submitting ? 'Submitting...' : 'Submit Rating'}
      </button>
    </form>
  )
}
