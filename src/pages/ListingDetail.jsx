import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import OfferForm from '../components/OfferForm'
import RatingForm from '../components/RatingForm'
import RatingDisplay from '../components/RatingDisplay'
import { activateSpotlight, isSpotlightActive } from '../utils/spotlightUtils'
import './ListingDetail.css'

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [spotlight, setSpotlight] = useState(null)
  const [spotlightLoading, setSpotlightLoading] = useState(false)
  const [spotlightMessage, setSpotlightMessage] = useState(null)
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [sellerRating, setSellerRating] = useState({ average: 0, count: 0 })

  useEffect(() => {
    async function fetchListing() {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('listings')
        .select('*, profiles(id, display_name, role)')
        .eq('id', id)
        .single()

      if (fetchError || !data) {
        setError('Listing not found')
        setLoading(false)
        return
      }

      setListing(data)

      // Fetch spotlight status for this listing
      const { data: spotlightData } = await supabase
        .from('listing_spotlights')
        .select('*')
        .eq('listing_id', id)
        .maybeSingle()

      if (spotlightData && isSpotlightActive(spotlightData)) {
        setSpotlight(spotlightData)
      }

      // Fetch seller rating
      if (data.seller_id) {
        const { data: ratingData } = await supabase
          .from('seller_ratings')
          .select('score')
          .eq('seller_id', data.seller_id)

        if (ratingData && ratingData.length > 0) {
          const sum = ratingData.reduce((acc, r) => acc + r.score, 0)
          const average = Math.round((sum / ratingData.length) * 10) / 10
          setSellerRating({ average, count: ratingData.length })
        }
      }

      setLoading(false)
    }

    fetchListing()
  }, [id])

  if (loading) {
    return (
      <div className="listing-detail-page">
        <div className="listing-detail-loading">
          <div className="loading-spinner" />
          <p>Loading listing...</p>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="listing-detail-page">
        <div className="listing-detail-error">
          <h2>Listing Not Found</h2>
          <p>{error || 'This listing does not exist or has been removed.'}</p>
          <button className="btn-primary" onClick={() => navigate('/marketplace')}>
            Back to Marketplace
          </button>
        </div>
      </div>
    )
  }

  const isOwnListing = user && listing.seller_id === user.id
  const isSold = listing.status === 'sold'
  const sellerIsMerchant = listing.profiles?.role === 'merchant'
  const viewerIsMerchant = profile?.role === 'merchant'

  const handleChatWithSeller = () => {
    alert('Chat feature coming soon! You will be able to message the seller directly.')
  }

  const handleSpotlight = async () => {
    setSpotlightLoading(true)
    setSpotlightMessage(null)

    const { data, error: spotlightError } = await activateSpotlight(supabase, listing.id)

    if (spotlightError) {
      setSpotlightMessage({ type: 'error', text: spotlightError })
    } else {
      setSpotlight(data)
      setSpotlightMessage({ type: 'success', text: 'Spotlight activated for 7 days!' })
    }

    setSpotlightLoading(false)
  }

  return (
    <div className="listing-detail-page">
      <button className="btn-back" onClick={() => navigate('/marketplace')}>
        ← Back to Marketplace
      </button>

      <div className="listing-detail-card">
        <div className="listing-detail-image">{listing.image}</div>

        <div className="listing-detail-content">
          <div className="listing-detail-header">
            <h1>{listing.title}</h1>
            {spotlight && <span className="status-badge spotlight">Spotlighted</span>}
            {isSold && <span className="status-badge sold">Sold</span>}
            {!isSold && !spotlight && <span className="status-badge active">Active</span>}
          </div>

          <p className="listing-detail-price">
            ${parseFloat(listing.price).toFixed(2)}
          </p>

          <div className="listing-detail-badges">
            <span className="condition-badge">{listing.condition}</span>
            <span className="category-badge">{listing.category}</span>
          </div>

          <div className="listing-detail-description">
            <h3>Description</h3>
            <p>{listing.description || 'No description provided.'}</p>
          </div>

          <div className="listing-detail-seller">
            <h3>Seller</h3>
            <div className="seller-info">
              <span className="seller-name">
                {listing.profiles?.display_name || 'Unknown Seller'}
              </span>
              {sellerIsMerchant && (
                <span className="merchant-badge">PRO</span>
              )}
            </div>
            <div className="seller-rating-display">
              <RatingDisplay average={sellerRating.average} count={sellerRating.count} />
            </div>
          </div>

          <div className="listing-detail-actions">
            {!isOwnListing && (
              <button
                className="btn-primary"
                onClick={handleChatWithSeller}
              >
                Chat with Seller
              </button>
            )}

            {!isOwnListing && !isSold && (
              <button
                className="btn-secondary"
                onClick={() => setShowOfferForm(!showOfferForm)}
              >
                Make Offer
              </button>
            )}

            {isOwnListing && viewerIsMerchant && !spotlight && (
              <button
                className="btn-spotlight"
                onClick={handleSpotlight}
                disabled={spotlightLoading}
              >
                {spotlightLoading ? 'Activating...' : 'Spotlight'}
              </button>
            )}

            {isOwnListing && viewerIsMerchant && spotlight && (
              <button className="btn-spotlight" disabled>
                Already Spotlighted
              </button>
            )}
          </div>

          {spotlightMessage && (
            <div className={`spotlight-message spotlight-message--${spotlightMessage.type}`}>
              {spotlightMessage.text}
            </div>
          )}

          {showOfferForm && !isOwnListing && (
            <div className="listing-detail-offer">
              <OfferForm
                listingId={listing.id}
                listingPrice={parseFloat(listing.price)}
                sellerId={listing.seller_id}
                listingStatus={listing.status}
                onSuccess={() => setShowOfferForm(false)}
              />
            </div>
          )}

          {!isOwnListing && isSold && (
            <div className="listing-detail-rating">
              <RatingForm
                listingId={listing.id}
                sellerId={listing.seller_id}
                onSuccess={(newRating) => {
                  if (newRating) {
                    const newCount = sellerRating.count + 1
                    const newAverage = Math.round(
                      ((sellerRating.average * sellerRating.count + newRating.score) / newCount) * 10
                    ) / 10
                    setSellerRating({ average: newAverage, count: newCount })
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
