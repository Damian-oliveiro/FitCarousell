import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import './CreateListingForm.css'

const CATEGORIES = ['Running', 'Cycling', 'Swimming', 'Fitness', 'Electronics']
const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair']

export default function CreateListingForm({ onClose, onSuccess }) {
  const { user, isMerchant } = useAuth()
  const { createListing } = useData()

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    image: '',
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  if (!isMerchant) return null

  function validate() {
    const newErrors = {}

    // Title validation
    if (!form.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (form.title.trim().length > 100) {
      newErrors.title = 'Title must be under 100 characters'
    }

    // Price validation
    const priceNum = parseFloat(form.price)
    if (!form.price || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'Price must be greater than zero'
    } else if (priceNum > 99999999.99) {
      newErrors.price = 'Price must be less than or equal to 99999999.99'
    }

    // Category validation
    if (!form.category || !CATEGORIES.includes(form.category)) {
      newErrors.category = 'Please select a valid category'
    }

    // Condition validation
    if (!form.condition || !CONDITIONS.includes(form.condition)) {
      newErrors.condition = 'Please select a valid condition'
    }

    // Image validation
    if (!form.image.trim()) {
      newErrors.image = 'Image URL is required'
    }

    // Description validation (optional but max 500 chars)
    if (form.description.length > 500) {
      newErrors.description = 'Description must be under 500 characters'
    }

    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const validationErrors = validate()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setSubmitting(true)

    try {
      const result = await createListing({
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category: form.category,
        condition: form.condition,
        image: form.image.trim(),
      })

      if (result) {
        if (onSuccess) onSuccess(result)
        onClose()
      }
    } catch (err) {
      setErrors({ submit: 'Failed to create listing. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    // Clear field error on change
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
    }
  }

  return (
    <div className="create-listing-form-wrapper">
      <form className="create-listing-form" onSubmit={handleSubmit} noValidate>
        <div className="create-listing-form-header">
          <h3>List an Item for Sale</h3>
          <button
            type="button"
            className="create-listing-close-btn"
            onClick={onClose}
            aria-label="Close form"
          >
            ✕
          </button>
        </div>

        {errors.submit && (
          <div className="create-listing-error-banner" role="alert">
            {errors.submit}
          </div>
        )}

        <div className="create-listing-form-grid">
          <div className="form-field">
            <label htmlFor="listing-title">Title *</label>
            <input
              id="listing-title"
              type="text"
              placeholder="Product name"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <span id="title-error" className="field-error" role="alert">
                {errors.title}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="listing-price">Price ($) *</label>
            <input
              id="listing-price"
              type="number"
              min="0.01"
              max="99999999.99"
              step="0.01"
              placeholder="e.g. 50"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              aria-invalid={!!errors.price}
              aria-describedby={errors.price ? 'price-error' : undefined}
            />
            {errors.price && (
              <span id="price-error" className="field-error" role="alert">
                {errors.price}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="listing-category">Category *</label>
            <select
              id="listing-category"
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? 'category-error' : undefined}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <span id="category-error" className="field-error" role="alert">
                {errors.category}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="listing-condition">Condition *</label>
            <select
              id="listing-condition"
              value={form.condition}
              onChange={(e) => handleChange('condition', e.target.value)}
              aria-invalid={!!errors.condition}
              aria-describedby={errors.condition ? 'condition-error' : undefined}
            >
              <option value="">Select condition</option>
              {CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </select>
            {errors.condition && (
              <span id="condition-error" className="field-error" role="alert">
                {errors.condition}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="listing-image">Image URL *</label>
            <input
              id="listing-image"
              type="text"
              placeholder="https://example.com/image.jpg"
              value={form.image}
              onChange={(e) => handleChange('image', e.target.value)}
              aria-invalid={!!errors.image}
              aria-describedby={errors.image ? 'image-error' : undefined}
            />
            {errors.image && (
              <span id="image-error" className="field-error" role="alert">
                {errors.image}
              </span>
            )}
          </div>
        </div>

        <div className="form-field form-field-full">
          <label htmlFor="listing-description">Description</label>
          <textarea
            id="listing-description"
            rows={3}
            maxLength={500}
            placeholder="Describe your item (max 500 characters)..."
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          <span className="char-count">{form.description.length}/500</span>
          {errors.description && (
            <span id="description-error" className="field-error" role="alert">
              {errors.description}
            </span>
          )}
        </div>

        <div className="create-listing-form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Publishing...' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  )
}
