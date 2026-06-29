import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { computeAverageRating } from '../utils/ratingUtils'
import './SellerRatings.css'

const PAGE_SIZE = 20

export default function SellerRatings({ sellerId }) {
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState(null)

  const fetchRatings = useCallback(async (offset = 0) => {
    if (!sellerId) return

    const isInitial = offset === 0
    if (isInitial) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('seller_ratings')
      .select('*, profiles:buyer_id(display_name)')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (fetchError) {
      setError('Failed to load ratings')
      setLoading(false)
      setLoadingMore(false)
      return
    }

    if (isInitial) {
      setRatings(data || [])
    } else {
      setRatings(prev => [...prev, ...(data || [])])
    }

    setHasMore((data || []).length === PAGE_SIZE)
    setLoading(false)
    setLoadingMore(false)
  }, [sellerId])

  useEffect(() => {
    fetchRatings(0)
  }, [fetchRatings])

  const handleLoadMore = () => {
    fetchRatings(ratings.length)
  }

  const { average, count } = computeAverageRating(ratings)

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const renderStars = (score) => {
    return '★'.repeat(score) + '☆'.repeat(5 - score)
  }

  if (loading) {
    return (
      <div className="seller-ratings">
        <div className="ratings-loading">Loading ratings...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="seller-ratings">
        <p className="ratings-error">{error}</p>
      </div>
    )
  }

  return (
    <div className="seller-ratings">
      <div className="ratings-summary">
        {count > 0 ? (
          <span className="ratings-average">
            {average} ★ ({count} {count === 1 ? 'review' : 'reviews'})
          </span>
        ) : (
          <span className="no-ratings">No ratings yet</span>
        )}
      </div>

      {ratings.length > 0 && (
        <div className="ratings-list">
          {ratings.map((rating) => (
            <div key={rating.id} className="rating-item">
              <div className="rating-item-header">
                <span className="rating-stars">{renderStars(rating.score)}</span>
                <span className="rating-date">{formatDate(rating.created_at)}</span>
              </div>
              {rating.review && (
                <p className="rating-review-text">{rating.review}</p>
              )}
              <span className="rating-buyer">
                — {rating.profiles?.display_name || 'Anonymous'}
              </span>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <button
          className="btn-load-more"
          onClick={handleLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  )
}
