import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import RatingDisplay from './RatingDisplay'
import './ListingCard.css'

export default function ListingCard({ listing, isSpotlighted = false }) {
  const navigate = useNavigate()
  const [sellerRating, setSellerRating] = useState({ average: 0, count: 0 })

  useEffect(() => {
    if (listing.seller_id) {
      supabase
        .from('seller_ratings')
        .select('score')
        .eq('seller_id', listing.seller_id)
        .then(({ data }) => {
          if (data && data.length > 0) {
            const sum = data.reduce((acc, r) => acc + r.score, 0)
            const average = Math.round((sum / data.length) * 10) / 10
            setSellerRating({ average, count: data.length })
          }
        })
    }
  }, [listing.seller_id])

  const handleClick = () => {
    navigate(`/marketplace/${listing.id}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const sellerName = listing.profiles?.display_name || 'Seller'

  return (
    <div
      className={`listing-card ${isSpotlighted ? 'spotlighted' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${listing.title} - ${formatPrice(listing.price)}`}
    >
      {isSpotlighted && <span className="spotlight-badge">Spotlight</span>}
      <div className="listing-image">{listing.image}</div>
      <div className="listing-info">
        <h4 className="listing-title">{listing.title}</h4>
        <div className="listing-meta">
          <span className="condition-badge">{listing.condition}</span>
          <span className="category-badge">{listing.category}</span>
        </div>
        <div className="listing-footer">
          <span className="price">{formatPrice(listing.price)}</span>
          <span className="seller">
            {sellerName}
            {listing.profiles?.role === 'merchant' && (
              <span className="merchant-badge">PRO</span>
            )}
          </span>
        </div>
        <div className="listing-rating">
          <RatingDisplay average={sellerRating.average} count={sellerRating.count} />
        </div>
      </div>
    </div>
  )
}
