import React from 'react'
import './RatingDisplay.css'

/**
 * Small inline component for showing average rating on ListingCard and seller profile.
 * Props: average (number), count (number)
 * Shows "4.2 ★ (15)" or "No ratings yet" when count is 0.
 */
export default function RatingDisplay({ average, count }) {
  if (count === 0) {
    return <span className="rating-display no-ratings-inline">No ratings yet</span>
  }

  return (
    <span className="rating-display" aria-label={`${average} out of 5 stars, ${count} reviews`}>
      {average} ★ ({count})
    </span>
  )
}
