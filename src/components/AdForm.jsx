import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './AdForm.css'

/**
 * AdForm — allows merchants to create or edit an advertisement.
 * Props:
 *   - onClose: function to close the form
 *   - onSuccess: function called after successful create/edit
 *   - existingAd: (optional) ad object for editing mode
 */
export default function AdForm({ onClose, onSuccess, existingAd = null }) {
  const { user } = useAuth()
  const [title, setTitle] = useState(existingAd?.title || '')
  const [image, setImage] = useState(existingAd?.image || '')
  const [linkType, setLinkType] = useState(existingAd?.link_type || 'listing')
  const [linkId, setLinkId] = useState(existingAd?.link_id || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = !!existingAd

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    // Validation
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (title.trim().length > 100) {
      setError('Title must be 100 characters or less')
      return
    }
    if (!image.trim()) {
      setError('Image URL is required')
      return
    }
    if (!linkId.trim()) {
      setError('Link ID is required')
      return
    }

    setLoading(true)

    try {
      if (isEditing) {
        await editAdvertisement(existingAd.id, {
          title: title.trim(),
          image: image.trim(),
          link_type: linkType,
          link_id: linkId.trim(),
        })
      } else {
        await createAdvertisement({
          merchant_id: user.id,
          title: title.trim(),
          image: image.trim(),
          link_type: linkType,
          link_id: linkId.trim(),
        })
      }
      onSuccess?.()
      onClose?.()
    } catch (err) {
      setError(err.message || 'Failed to save advertisement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ad-form-overlay">
      <div className="ad-form">
        <div className="ad-form__header">
          <h3>{isEditing ? 'Edit Advertisement' : 'Create Advertisement'}</h3>
          <button className="ad-form__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ad-form__field">
            <label htmlFor="ad-title">Title (max 100 characters)</label>
            <input
              id="ad-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Enter advertisement title"
              required
            />
            <span className="ad-form__char-count">{title.length}/100</span>
          </div>

          <div className="ad-form__field">
            <label htmlFor="ad-image">Image URL</label>
            <input
              id="ad-image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          <div className="ad-form__field">
            <label htmlFor="ad-link-type">Link Type</label>
            <select
              id="ad-link-type"
              value={linkType}
              onChange={(e) => setLinkType(e.target.value)}
            >
              <option value="listing">Listing</option>
              <option value="event">Event</option>
            </select>
          </div>

          <div className="ad-form__field">
            <label htmlFor="ad-link-id">Link ID (UUID of listing or event)</label>
            <input
              id="ad-link-id"
              type="text"
              value={linkId}
              onChange={(e) => setLinkId(e.target.value)}
              placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
              required
            />
          </div>

          {error && <p className="ad-form__error">{error}</p>}

          <div className="ad-form__actions">
            <button
              type="button"
              className="ad-form__cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ad-form__submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Ad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ===== Advertisement CRUD Functions =====

/**
 * Create a new advertisement.
 */
export async function createAdvertisement({ merchant_id, title, image, link_type, link_id }) {
  const { data, error } = await supabase
    .from('advertisements')
    .insert({
      merchant_id,
      title,
      image,
      link_type,
      link_id,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Edit an existing advertisement.
 */
export async function editAdvertisement(adId, updates) {
  const { data, error } = await supabase
    .from('advertisements')
    .update(updates)
    .eq('id', adId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete (deactivate) an advertisement by setting is_active to false.
 */
export async function deleteAdvertisement(adId) {
  const { error } = await supabase
    .from('advertisements')
    .update({ is_active: false })
    .eq('id', adId)

  if (error) throw error
}

/**
 * Fetch all active advertisements.
 */
export async function fetchActiveAds() {
  const { data, error } = await supabase
    .from('advertisements')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
