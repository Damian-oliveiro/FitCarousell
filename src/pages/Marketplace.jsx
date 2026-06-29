import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { generateMockListings } from '../utils/mockData'
import ListingCard from '../components/ListingCard'
import CreateListingForm from '../components/CreateListingForm'
import SpotlightSection from '../components/SpotlightSection'
import { isSpotlightActive, sortListingsWithSpotlight } from '../utils/spotlightUtils'
import './Marketplace.css'

const CATEGORIES = ['All', 'Running', 'Cycling', 'Swimming', 'Fitness', 'Electronics']
const USE_MOCK_DATA = true // Set to false when Supabase is connected with real data

export default function Marketplace() {
  const { isMerchant } = useAuth()

  const [listings, setListings] = useState([])
  const [spotlightIds, setSpotlightIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    fetchListings()
  }, [])

  async function fetchListings() {
    setLoading(true)
    setError(null)

    if (USE_MOCK_DATA) {
      const mockListings = generateMockListings(25)
      setListings(mockListings)
      setSpotlightIds(new Set([mockListings[0]?.id, mockListings[1]?.id, mockListings[2]?.id].filter(Boolean)))
      setLoading(false)
      return
    }

    // Fetch listings and active spotlights in parallel
    const [listingsResult, spotlightsResult] = await Promise.all([
      supabase
        .from('listings')
        .select('*, profiles(display_name, role)')
        .order('created_at', { ascending: false }),
      supabase
        .from('listing_spotlights')
        .select('listing_id, expires_at'),
    ])

    if (listingsResult.error) {
      // Fallback to mock data
      const mockListings = generateMockListings(25)
      setListings(mockListings)
      setLoading(false)
      return
    }

    // Filter active spotlights client-side
    const activeSpotlightListingIds = new Set(
      (spotlightsResult.data || [])
        .filter((s) => isSpotlightActive(s))
        .map((s) => s.listing_id)
    )
    setSpotlightIds(activeSpotlightListingIds)
    setListings(listingsResult.data || [])
    setLoading(false)
  }

  const filteredListings = sortListingsWithSpotlight(
    listings.filter((listing) => {
      const matchesCategory = filter === 'All' || listing.category === filter
      const matchesSearch =
        !search || listing.title.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    }),
    [...spotlightIds]
  )

  return (
    <div className="marketplace">
      <div className="marketplace-header">
        <h2>Marketplace</h2>
        {isMerchant && (
          <button
            className="btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : '+ Create Listing'}
          </button>
        )}
      </div>

      {showCreateForm && isMerchant && (
        <CreateListingForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={(newListing) => {
            setListings((prev) => [newListing, ...prev])
          }}
        />
      )}

      <div className="marketplace-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search listings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search listings"
        />
        <div className="filter-bar" role="group" aria-label="Category filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
              aria-pressed={filter === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="marketplace-loading">
          <div className="loading-spinner" />
          <p>Loading listings...</p>
        </div>
      )}

      {error && (
        <div className="marketplace-error">
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchListings}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <SpotlightSection />
          <div className="listings-grid">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isSpotlighted={spotlightIds.has(listing.id)}
              />
            ))}
            {filteredListings.length === 0 && (
              <div className="empty-state">
                <p>No listings found</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
