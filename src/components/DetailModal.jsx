import React, { useState } from 'react'
import RouteMap from './RouteMap'
import './DetailModal.css'

/**
 * Reusable full-screen detail modal for viewing posts, blogs, listings, etc.
 * Slides up from bottom on mobile for native-like feel.
 */
export default function DetailModal({ isOpen, onClose, children }) {
  if (!isOpen) return null

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        <button className="detail-modal-close" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div className="detail-modal-content">
          {children}
        </div>
      </div>
    </div>
  )
}

/** Activity Post Detail View */
export function ActivityDetail({ post, onClose }) {
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([
    { id: 1, user: 'Alex Chen', text: 'Great pace! Keep it up', time: '2h ago' },
    { id: 2, user: 'Sam Lee', text: 'Beautiful route, where is this?', time: '4h ago' },
  ])
  const activity = post.activities
  const profile = post.profiles

  const handleComment = (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setComments(prev => [{ id: Date.now(), user: 'You', text: comment.trim(), time: 'now' }, ...prev])
    setComment('')
  }

  return (
    <div className="activity-detail">
      <div className="activity-detail-header">
        <div className="activity-detail-avatar">
          {profile?.display_name?.[0] || '?'}
        </div>
        <div>
          <h3>{profile?.display_name || 'Unknown'}</h3>
          <span className="detail-date">{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
        <button className="follow-btn-detail">Follow</button>
      </div>

      <RouteMap seed={post.id ? post.id.charCodeAt(0) + post.id.charCodeAt(1) : 42} height={200} />

      {activity && (
        <div className="activity-detail-stats">
          <div className="detail-stat">
            <span className="detail-stat-value">{activity.distance} km</span>
            <span className="detail-stat-label">Distance</span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-value">{activity.duration} min</span>
            <span className="detail-stat-label">Duration</span>
          </div>
          {activity.distance > 0 && (
            <div className="detail-stat">
              <span className="detail-stat-value">{(activity.duration / activity.distance).toFixed(1)}</span>
              <span className="detail-stat-label">min/km</span>
            </div>
          )}
        </div>
      )}

      {post.caption && <p className="activity-detail-caption">{post.caption}</p>}

      <div className="detail-interactions">
        <span>{post.likes_count || 0} likes</span>
        <span>{comments.length} comments</span>
      </div>

      <div className="detail-comments">
        <form className="comment-form" onSubmit={handleComment}>
          <input
            type="text"
            placeholder="Add a comment..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button type="submit" className="comment-submit" disabled={!comment.trim()}>Post</button>
        </form>
        <div className="comments-list">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <span className="comment-user">{c.user}</span>
              <span className="comment-text">{c.text}</span>
              <span className="comment-time">{c.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Blog Post Detail View */
export function BlogDetail({ post }) {
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([
    { id: 1, user: 'Jordan Kim', text: 'This changed my training approach completely', time: '1d ago' },
    { id: 2, user: 'Casey Patel', text: 'Great article, very well researched!', time: '2d ago' },
    { id: 3, user: 'Riley Nguyen', text: 'Can you do a follow up on nutrition timing?', time: '3d ago' },
  ])
  const profile = post.profiles

  const handleComment = (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setComments(prev => [{ id: Date.now(), user: 'You', text: comment.trim(), time: 'now' }, ...prev])
    setComment('')
  }

  return (
    <div className="blog-detail">
      <div className="blog-detail-header">
        <div className="activity-detail-avatar">
          {profile?.display_name?.[0] || '?'}
        </div>
        <div>
          <h4>{profile?.display_name}</h4>
          <span className="detail-date">{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
        <button className="follow-btn-detail">Follow</button>
      </div>

      <h2 className="blog-detail-title">{post.title}</h2>
      <p className="blog-detail-body">{post.body}</p>

      {post.images && post.images.length > 0 && (
        <div className="blog-detail-images">
          {post.images.map((img, i) => (
            <img key={i} src={img} alt={`Blog image ${i + 1}`} />
          ))}
        </div>
      )}

      <div className="detail-interactions">
        <span>{post.likes_count || 0} likes</span>
        <span>{comments.length} comments</span>
      </div>

      <div className="detail-comments">
        <form className="comment-form" onSubmit={handleComment}>
          <input type="text" placeholder="Add a comment..." value={comment} onChange={e => setComment(e.target.value)} />
          <button type="submit" className="comment-submit" disabled={!comment.trim()}>Post</button>
        </form>
        <div className="comments-list">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <span className="comment-user">{c.user}</span>
              <span className="comment-text">{c.text}</span>
              <span className="comment-time">{c.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Listing Detail View */
export function ListingDetailView({ listing }) {
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([
    { id: 1, user: 'Buyer123', text: 'Is this still available?', time: '5h ago' },
    { id: 2, user: 'SportsFan', text: 'Would you accept $50?', time: '1d ago' },
  ])

  const handleComment = (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setComments(prev => [{ id: Date.now(), user: 'You', text: comment.trim(), time: 'now' }, ...prev])
    setComment('')
  }

  return (
    <div className="listing-detail-view">
      {listing.image && listing.image.startsWith('http') && (
        <img src={listing.image} alt={listing.title} className="listing-detail-img" />
      )}

      <h2 className="listing-detail-title">{listing.title}</h2>
      <p className="listing-detail-price">${parseFloat(listing.price).toFixed(2)}</p>

      <div className="listing-detail-badges">
        <span className="condition-badge">{listing.condition}</span>
        <span className="category-badge">{listing.category}</span>
      </div>

      {listing.wear && (
        <div className="listing-detail-wear">
          <h4>Condition</h4>
          <p>{listing.wear}</p>
        </div>
      )}

      <div className="listing-detail-desc">
        <h4>Description</h4>
        <p>{listing.description || 'No description provided.'}</p>
      </div>

      <div className="listing-detail-seller-info">
        <h4>Seller</h4>
        <p>{listing.profiles?.display_name || 'Unknown'} {listing.profiles?.role === 'merchant' && <span className="merchant-badge">PRO</span>}</p>
      </div>

      <div className="listing-detail-actions-row">
        <button className="btn-primary">Chat with Seller</button>
        <button className="btn-secondary">Make Offer</button>
      </div>

      <div className="detail-section">
        <h4>Reviews</h4>
        <p className="no-reviews">No reviews yet</p>
      </div>

      <div className="detail-comments">
        <h4>Questions</h4>
        <form className="comment-form" onSubmit={handleComment}>
          <input type="text" placeholder="Ask a question..." value={comment} onChange={e => setComment(e.target.value)} />
          <button type="submit" className="comment-submit" disabled={!comment.trim()}>Ask</button>
        </form>
        <div className="comments-list">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <span className="comment-user">{c.user}</span>
              <span className="comment-text">{c.text}</span>
              <span className="comment-time">{c.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
