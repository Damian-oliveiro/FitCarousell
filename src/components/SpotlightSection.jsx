import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { isSpotlightActive } from '../utils/spotlightUtils'
import ListingCard from './ListingCard'
import './SpotlightSection.css'

/**
 * SpotlightSection displays up to 6 spotlighted listings at the top
 * of the Marketplace page, ordered by activated_at descending.
 * Expired spotlights are filtered out client-side.
 */
export default function SpotlightSection() {
  const [spotlightedListings, setSpotlightedListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSpotlightedListings() {
      setLoading(true)

      const { data, error } = await supabase
        .from('listing_spotlights')
        .select('*, listings(*, profiles(display_name, role))')
        .order('activated_at', { ascending: false })
        .limit(10) // fetch a few extra in case some are expired

      if (error || !data) {
        setSpotlightedListings([])
        setLoading(false)
        return
      }

      // Filter out expired spotlights client-side
      const active = data
        .filter((spotlight) => isSpotlightActive(spotlight))
        .slice(0, 6) // limit to 6

      // Map to listing objects with spotlight info
      const listings = active
        .map((spotlight) => ({
          ...spotlight.listings,
          spotlight: {
            id: spotlight.id,
            activated_at: spotlight.activated_at,
            expires_at: spotlight.expires_at,
          },
        }))
        .filter((item) => item.id) // ensure listing exists

      setSpotlightedListings(listings)
      setLoading(false)
    }

    fetchSpotlightedListings()
  }, [])

  if (loading || spotlightedListings.length === 0) {
    return null
  }

  return (
    <section className="spotlight-section" aria-label="Spotlighted listings">
      <div className="spotlight-header">
        <h3>Spotlighted</h3>
      </div>
      <div className="spotlight-grid">
        {spotlightedListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} isSpotlighted />
        ))}
      </div>
    </section>
  )
}
