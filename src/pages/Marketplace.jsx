import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
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
  const { isMerchant } = useAuth()
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
    const used = generateUsedListings(20)
    const shop = generateMerchantShopItems()
    setUsedListings(used)
    setShopData(shop)
    setLoading(false)
  }, [])

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
            setUsedListings(prev => [{ ...newListing, type: 'used', wear: 'Like New - Used once' }, ...prev])
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
        {selectedListing && <ListingDetailView listing={selectedListing} />}
      </DetailModal>
    </div>
  )
}
