import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import './Marketplace.css'

export default function Marketplace() {
  const { listings, createListing } = useData()
  const { isMerchant } = useAuth()

  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedListing, setSelectedListing] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Running',
    condition: 'Like New',
    image: '📦',
  })

  const categories = ['All', 'Running', 'Cycling', 'Swimming', 'Fitness', 'Electronics']
  const emojis = ['👟', '🚲', '🏊', '🧘', '⌚', '📦', '🎽', '💪']

  const filteredListings = listings.filter(l => {
    const matchCategory = filter === 'All' || l.category === filter
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.price || parseFloat(form.price) <= 0) return

    const result = await createListing({
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      condition: form.condition,
      image: form.image,
    })

    if (result) {
      setForm({ title: '', description: '', price: '', category: 'Running', condition: 'Like New', image: '📦' })
      setShowForm(false)
    }
  }

  if (selectedListing) {
    return (
      <div className="marketplace">
        <button className="btn-back" onClick={() => setSelectedListing(null)}>
          ← Back to Marketplace
        </button>
        <div className="listing-detail">
          <div className="listing-detail-image">{selectedListing.image}</div>
          <h2>{selectedListing.title}</h2>
          <div className="listing-detail-meta">
            <span className="condition-badge">{selectedListing.condition}</span>
            <span className="category-badge">{selectedListing.category}</span>
          </div>
          <p className="listing-detail-price">${selectedListing.price}</p>
          <p className="listing-detail-desc">{selectedListing.description}</p>
          <div className="listing-detail-seller">
            <span>
              Sold by <strong>{selectedListing.profiles?.display_name || selectedListing.seller || 'Seller'}</strong>
              {selectedListing.profiles?.role === 'merchant' && <span className="merchant-badge">🏪</span>}
            </span>
          </div>
          <button className="btn-primary">Contact Seller</button>
        </div>
      </div>
    )
  }

  return (
    <div className="marketplace">
      <div className="marketplace-header">
        <h2>Marketplace</h2>
        {isMerchant && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Create Listing'}
          </button>
        )}
      </div>

      {showForm && isMerchant && (
        <form className="listing-form" onSubmit={handleSubmit}>
          <h3>List an Item for Sale</h3>
          <div className="form-grid">
            <label>
              Title
              <input
                type="text"
                maxLength={100}
                placeholder="Product name"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label>
              Price ($)
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 50"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>
            <label>
              Category
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="Running">Running</option>
                <option value="Cycling">Cycling</option>
                <option value="Swimming">Swimming</option>
                <option value="Fitness">Fitness</option>
                <option value="Electronics">Electronics</option>
              </select>
            </label>
            <label>
              Condition
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                <option value="Brand New">Brand New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </label>
            <label>
              Icon
              <select value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}>
                {emojis.map((emoji) => (
                  <option key={emoji} value={emoji}>{emoji}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Description
            <textarea
              maxLength={500}
              rows={3}
              placeholder="Describe your item..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <button type="submit" className="btn-primary">Publish Listing</button>
        </form>
      )}

      <div className="marketplace-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search listings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="listings-grid">
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            className="listing-card"
            onClick={() => setSelectedListing(listing)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedListing(listing)}
          >
            <div className="listing-image">{listing.image}</div>
            <div className="listing-info">
              <h4>{listing.title}</h4>
              <div className="listing-meta">
                <span className="condition-badge">{listing.condition}</span>
                <span className="category-badge">{listing.category}</span>
              </div>
              <div className="listing-footer">
                <span className="price">${listing.price}</span>
                <span className="seller">
                  {listing.profiles?.display_name || listing.seller || 'Seller'}
                  {listing.profiles?.role === 'merchant' && <span className="merchant-badge">🏪</span>}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filteredListings.length === 0 && (
          <div className="empty-state">
            <p>No listings found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
