import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteAdvertisement } from './AdForm'
import './AdFeedCard.css'

/**
 * AdFeedCard — renders a single advertisement in the home feed.
 * Props:
 *   - ad: the advertisement object
 *   - isOwn: boolean, if true shows edit/delete controls
 *   - onEdit: callback when edit is clicked (receives ad)
 *   - onDelete: callback after successful delete (receives ad id)
 */
export default function AdFeedCard({ ad, isOwn = false, onEdit, onDelete }) {
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)

  if (!ad) return null

  function handleClick(e) {
    // Don't navigate if clicking on action buttons
    if (e.target.closest('.ad-feed-card__actions')) return

    if (ad.link_type === 'listing' && ad.link_id) {
      navigate(`/marketplace/${ad.link_id}`)
    } else if (ad.link_type === 'event' && ad.link_id) {
      navigate(`/groups/event/${ad.link_id}`)
    }
  }

  async function handleDelete(e) {
    e.stopPropagation()
    if (deleting) return

    setDeleting(true)
    try {
      await deleteAdvertisement(ad.id)
      onDelete?.(ad.id)
    } catch (err) {
      console.error('Failed to delete ad:', err)
    } finally {
      setDeleting(false)
    }
  }

  function handleEdit(e) {
    e.stopPropagation()
    onEdit?.(ad)
  }

  return (
    <article
      className="ad-feed-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Sponsored: ${ad.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick(e)
        }
      }}
    >
      <div className="ad-feed-card__label">Sponsored</div>
      {ad.image && (
        <div className="ad-feed-card__image-wrapper">
          <img
            src={ad.image}
            alt={ad.title || 'Advertisement'}
            className="ad-feed-card__image"
          />
        </div>
      )}
      <div className="ad-feed-card__content">
        <h3 className="ad-feed-card__title">{ad.title}</h3>
      </div>

      {isOwn && (
        <div className="ad-feed-card__actions">
          <button
            className="ad-feed-card__edit-btn"
            onClick={handleEdit}
            aria-label="Edit advertisement"
          >
            Edit
          </button>
          <button
            className="ad-feed-card__delete-btn"
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Delete advertisement"
          >
            {deleting ? '...' : 'Delete'}
          </button>
        </div>
      )}
    </article>
  )
}
