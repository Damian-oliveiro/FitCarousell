import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import './Marketplace.css'

export default function Marketplace() {
  const { listings, addListing } = useData()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('All')
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

  const filteredListings = filter === 'All'
    ? listings
    : listings.filter((l) => l.category === filter)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title || !form.price) return
    addListing({ ...form, price: parseFloat(form.price) })
    setForm({ title: '', description: '', price: '', category: 'Running', condition: 'Like New', image: '📦' })
    setShowForm(false)
  }

  return (
    <div className="marketplace">
      <div className="marketplace-header">
        <h2>Marketplace</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ List Item'}
        </button>
      </div>

      {showForm && (
        <form className="listing-form" onSubmit={handleSubmit}>
          <h3>List an Item for Sale</h3>
          <div className="form-row">
            <label>
              Title
              <input
                type="text"
                placeholder="e.g. Running shoes Nike Air"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label>
              Price ($)
              <input
                type="number"
                placeholder="e.g. 50"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>
          </div>
          <div className="form-row">
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
                {emojis.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Description
            <textarea
              rows={3}
              placeholder="Describe your item..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <button type="submit" className="btn-primary" style={{ marginTop: '12px' }}>
            Publish Listing
          </button>
        </form>
      )}

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

      <div className="listings-grid">
        {filteredListings.map((listing) => (
          <div key={listing.id} className="listing-card">
            <div className="listing-image">{listing.image}</div>
            <div className="listing-info">
              <h4>{listing.title}</h4>
              <p className="listing-desc">{listing.description}</p>
              <div className="listing-meta">
                <span className="condition-badge">{listing.condition}</span>
                <span className="category-badge">{listing.category}</span>
              </div>
              <div className="listing-footer">
                <span className="price">${listing.price}</span>
                <span className="seller">by {listing.seller}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
