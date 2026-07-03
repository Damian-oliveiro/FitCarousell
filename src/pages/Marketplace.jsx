import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useChat } from '../context/ChatContext'
import { supabase } from '../lib/supabase'
import { generateUsedListings, generateMerchantShopItems } from '../utils/mockData'
import ListingCard from '../components/ListingCard'
import CreateListingForm from '../components/CreateListingForm'
import DetailModal, { ListingDetailView } from '../components/DetailModal'
import './Marketplace.css'

const USED_CATEGORIES = ['All', 'Running', 'Cycling', 'Swimming', 'Fitness', 'Electronics']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
]

export default function Marketplace() {
  const { isMerchant, user } = useAuth()
  const { listings: realListings, fetchListings } = useData()
  const { openOrCreateThread, sendMessage, totalUnreadCount } = useChat()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('used') // 'used' | 'shop'
  const [usedListings, setUsedListings] = useState([])
  const [shopData, setShopData] = useState({ brands: [], items: [] })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('newest')
  const [shopBrand, setShopBrand] = useState('All')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedListing, setSelectedListing] = useState(null)

  useEffect(() => {
    setLoading(true)

    // Load mock data for the shop tab
    const shop = generateMerchantShopItems()
    setShopData(shop)

    // Fetch real listings from Supabase, supplement with mock data
    async function loadListings() {
      await fetchListings()
      setLoading(false)
    }
    loadListings()
  }, [])

  // Merge real Supabase listings with mock data for the "used" tab
  // Real listings appear first, then mock data fills out the page
  useEffect(() => {
    const mockUsed = generateUsedListings(50).map(item => ({ ...item, _isMock: true }))
    // Real listings from DB go first
    const realUsed = (realListings || []).map(listing => ({
      ...listing,
      type: 'used',
      wear: listing.condition || 'Good',
      seller: listing.profiles?.display_name || 'Seller',
      _isMock: false,
    }))
    setUsedListings([...realUsed, ...mockUsed])
  }, [realListings])

  // Filter and sort used listings
  const filteredUsed = usedListings
    .filter(item => {
      const matchCat = filter === 'All' || item.category === filter
      const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
    .sort((a, b) => {
      if (sort === 'price_low') return a.price - b.price
      if (sort === 'price_high') return b.price - a.price
      return new Date(b.created_at) - new Date(a.created_at)
    })

  // Filter shop items
  const filteredShop = shopData.items.filter(item => {
    const matchBrand = shopBrand === 'All' || item.brand === shopBrand
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase())
    return matchBrand && matchSearch
  })

  return (
    <div className="marketplace">
      <div className="marketplace-header">
        <h2>Marketplace</h2>
        <button
          className="btn-messages"
          onClick={() => navigate('/marketplace/chat')}
        >
          💬 Messages
          {totalUnreadCount > 0 && (
            <span className="unread-badge">{totalUnreadCount}</span>
          )}
        </button>
      </div>

      {/* Tab switcher */}
      <div className="marketplace-tabs">
        <button
          className={`marketplace-tab ${activeTab === 'used' ? 'active' : ''}`}
          onClick={() => setActiveTab('used')}
        >
          Used
        </button>
        <button
          className={`marketplace-tab ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          Shop
        </button>
      </div>

      {/* Search bar */}
      <div className="marketplace-filters">
        <input
          type="text"
          className="search-input"
          placeholder={activeTab === 'used' ? 'Search used items...' : 'Search brands...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search listings"
        />

        {/* Used filters */}
        {activeTab === 'used' && (
          <>
            <div className="filter-bar" role="group" aria-label="Category filters">
              {USED_CATEGORIES.map(cat => (
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
            <div className="sort-bar">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="sort-select"
                aria-label="Sort by"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                className="btn-primary btn-sm"
                onClick={() => setShowCreateForm(true)}
              >
                + Sell Item
              </button>
            </div>
          </>
        )}

        {/* Shop brand filters */}
        {activeTab === 'shop' && (
          <div className="filter-bar" role="group" aria-label="Brand filters">
            <button
              className={`filter-btn ${shopBrand === 'All' ? 'active' : ''}`}
              onClick={() => setShopBrand('All')}
            >
              All Brands
            </button>
            {shopData.brands.map(brand => (
              <button
                key={brand.name}
                className={`filter-btn ${shopBrand === brand.name ? 'active' : ''}`}
                onClick={() => setShopBrand(brand.name)}
              >
                {brand.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create listing form */}
      {showCreateForm && (
        <CreateListingForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={(newListing) => {
            // Real listing was saved to DB via DataContext — just refresh
            fetchListings()
            setShowCreateForm(false)
          }}
        />
      )}

      {loading && (
        <div className="marketplace-loading">
          <div className="loading-spinner" />
          <p>Loading...</p>
        </div>
      )}

      {/* Used listings grid */}
      {!loading && activeTab === 'used' && (
        <div className="listings-grid">
          {filteredUsed.map(listing => (
            <div key={listing.id} className="used-listing-card" onClick={() => setSelectedListing(listing)} style={{ cursor: 'pointer' }}>
              <ListingCard listing={listing} />
              <div className="used-listing-wear">
                <span className="wear-badge">{listing.wear}</span>
              </div>
            </div>
          ))}
          {filteredUsed.length === 0 && (
            <div className="empty-state"><p>No items found</p></div>
          )}
        </div>
      )}

      {/* Shop grid */}
      {!loading && activeTab === 'shop' && (
        <div className="shop-section">
          {(shopBrand === 'All' ? shopData.brands : shopData.brands.filter(b => b.name === shopBrand)).map(brand => {
            const brandItems = filteredShop.filter(item => item.brand === brand.name)
            if (brandItems.length === 0) return null
            return (
              <div key={brand.name} className="shop-brand-section">
                <h3 className="shop-brand-name">{brand.name}</h3>
                <div className="listings-grid">
                  {brandItems.map(item => (
                    <div key={item.id} onClick={() => setSelectedListing(item)} style={{ cursor: 'pointer' }}>
                      <ListingCard
                        listing={{
                          ...item,
                          profiles: { display_name: brand.name, role: 'merchant' },
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {filteredShop.length === 0 && (
            <div className="empty-state"><p>No products found</p></div>
          )}
        </div>
      )}

      {/* Listing Detail Modal */}
      <DetailModal isOpen={!!selectedListing} onClose={() => setSelectedListing(null)}>
        {selectedListing && (
          <ListingDetailView
            listing={selectedListing}
            onChatWithSeller={async () => {
              if (!user) {
                alert('Please log in to chat with the seller')
                return
              }
              if (selectedListing?._isMock) {
                alert('This is a demo listing. Chat is only available on real listings.')
                return
              }
              if (!selectedListing?.seller_id) {
                alert('This listing is not available for chat')
                return
              }
              if (selectedListing.seller_id === user.id) {
                alert("This is your own listing")
                return
              }
              try {
                const thread = await openOrCreateThread(selectedListing.id, selectedListing.seller_id)
                if (thread) {
                  setSelectedListing(null)
                  navigate(`/marketplace/chat/${thread.id}`)
                } else {
                  alert('Could not open chat. Please try again.')
                }
              } catch (err) {
                alert('Chat error: ' + (err.message || 'Unknown error'))
              }
            }}
            onMakeOffer={async (amount) => {
              if (!user) {
                alert('Please log in to make an offer')
                return
              }
              if (selectedListing?._isMock) {
                alert('This is a demo listing. Offers are only available on real listings.')
                return
              }
              if (!selectedListing?.seller_id) {
                alert('This listing is not available for offers')
                return
              }
              if (selectedListing.seller_id === user.id) {
                alert("This is your own listing")
                return
              }
              try {
                const thread = await openOrCreateThread(selectedListing.id, selectedListing.seller_id)
                if (thread) {
                  await sendMessage(thread.id, `Offer: $${amount.toFixed(2)} for "${selectedListing.title}"`)
                  setSelectedListing(null)
                  navigate(`/marketplace/chat/${thread.id}`)
                } else {
                  alert('Could not open chat. Please try again.')
                }
              } catch (err) {
                alert('Offer error: ' + (err.message || 'Unknown error'))
              }
            }}
          />
        )}
      </DetailModal>
    </div>
  )
}
