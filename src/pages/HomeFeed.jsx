import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { intersperseFeedWithAds } from '../utils/feedUtils'
import { fetchActiveAds } from '../components/AdForm'
import { generateMockFeedPosts, generateMockAds, generateMockBlogPosts } from '../utils/mockData'
import AdFeedCard from '../components/AdFeedCard'
import AdForm from '../components/AdForm'
import RouteMap from '../components/RouteMap'
import DetailModal, { ActivityDetail, BlogDetail } from '../components/DetailModal'
import './HomeFeed.css'

const BATCH_SIZE = 20
const USE_MOCK_DATA = true // Set to false when Supabase is connected with real data

const typeIcons = { Run: 'R', Cycle: 'C', Swim: 'S', Walk: 'W' }
const typeColors = { Run: '#8b5cf6', Cycle: '#60a5fa', Swim: '#22d3ee', Walk: '#34d399' }

export default function HomeFeed() {
  const { user, isMerchant } = useAuth()
  const [posts, setPosts] = useState([])
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [showAdForm, setShowAdForm] = useState(false)
  const [showBlogForm, setShowBlogForm] = useState(false)
  const [editingAd, setEditingAd] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const sentinelRef = useRef(null)
  const observerRef = useRef(null)

  const fetchPosts = useCallback(async (offset = 0) => {
    if (!user) return

    if (offset === 0) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    setError(null)

    try {
      if (USE_MOCK_DATA) {
        // Use mock data for development/testing
        const allMockPosts = generateMockFeedPosts(40)
        const blogPosts = generateMockBlogPosts(8)
        // Mix blogs into activity posts
        const mixed = [...allMockPosts, ...blogPosts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        const batch = mixed.slice(offset, offset + BATCH_SIZE)
        if (batch.length < BATCH_SIZE) setHasMore(false)
        if (offset === 0) {
          setPosts(batch)
        } else {
          setPosts(prev => [...prev, ...batch])
        }
      } else {
        const { data, error: fetchError } = await supabase
          .from('feed_posts')
          .select('*, profiles(display_name, avatar_url, role), activities(*)')
          .order('created_at', { ascending: false })
          .range(offset, offset + BATCH_SIZE - 1)

        if (fetchError) throw fetchError

        const fetchedPosts = data || []
        if (fetchedPosts.length < BATCH_SIZE) setHasMore(false)
        if (offset === 0) {
          setPosts(fetchedPosts)
        } else {
          setPosts(prev => [...prev, ...fetchedPosts])
        }
      }
    } catch (err) {
      // Fallback to mock data on error
      if (offset === 0) {
        const mockPosts = generateMockFeedPosts(30)
        setPosts(mockPosts)
        setHasMore(false)
      } else {
        setError('Failed to load more posts. Please try again.')
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [user])

  // Fetch ads and validate that linked listings/events still exist
  const fetchAndValidateAds = useCallback(async () => {
    try {
      const activeAds = await fetchActiveAds()

      if (activeAds.length === 0) {
        setAds([])
        return
      }

      // Separate ads by link type for validation
      const listingAds = activeAds.filter(ad => ad.link_type === 'listing')
      const eventAds = activeAds.filter(ad => ad.link_type === 'event')

      let validListingIds = new Set()
      let validEventIds = new Set()

      // Validate listing ads — check which linked listings still exist
      if (listingAds.length > 0) {
        const listingIds = listingAds.map(ad => ad.link_id)
        const { data: existingListings } = await supabase
          .from('listings')
          .select('id')
          .in('id', listingIds)

        if (existingListings) {
          validListingIds = new Set(existingListings.map(l => l.id))
        }
      }

      // Validate event ads — check which linked events still exist
      if (eventAds.length > 0) {
        const eventIds = eventAds.map(ad => ad.link_id)
        const { data: existingEvents } = await supabase
          .from('group_events')
          .select('id')
          .in('id', eventIds)

        if (existingEvents) {
          validEventIds = new Set(existingEvents.map(e => e.id))
        }
      }

      // Filter out ads whose linked entity no longer exists
      const validAds = activeAds.filter(ad => {
        if (ad.link_type === 'listing') return validListingIds.has(ad.link_id)
        if (ad.link_type === 'event') return validEventIds.has(ad.link_id)
        return false
      })

      setAds(validAds)
    } catch (err) {
      // If ad fetching fails, just show no ads — don't break the feed
      console.error('Failed to fetch ads:', err)
      setAds([])
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchPosts(0)
    fetchAndValidateAds()
  }, [fetchPosts, fetchAndValidateAds])

  // Set up IntersectionObserver for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading && !error) {
          fetchPosts(posts.length)
        }
      },
      { threshold: 0.1 }
    )

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }

    observerRef.current = observer

    return () => observer.disconnect()
  }, [posts.length, hasMore, loadingMore, loading, error, fetchPosts])

  const handleRetry = () => {
    if (posts.length === 0) {
      fetchPosts(0)
    } else {
      fetchPosts(posts.length)
    }
  }

  const handleAdDelete = (adId) => {
    setAds(prev => prev.filter(ad => ad.id !== adId))
  }

  const handleAdEdit = (ad) => {
    setEditingAd(ad)
    setShowAdForm(true)
  }

  const handleAdFormSuccess = () => {
    setShowAdForm(false)
    setEditingAd(null)
    // Refresh ads
    fetchAndValidateAds()
  }

  // Build the mixed feed with ads interspersed
  const mixedFeed = intersperseFeedWithAds(posts, ads)

  // Empty state (only show when initial load is done, no error, and no posts)
  if (!loading && !error && posts.length === 0) {
    return (
      <div className="home-feed">
        <h2 className="home-feed-title">Home</h2>
        {isMerchant && (
          <button
            className="home-feed-create-ad-btn"
            onClick={() => { setEditingAd(null); setShowAdForm(true) }}
          >
            + Create Ad
          </button>
        )}
        <div className="home-feed-empty">
          <p>No posts yet. Complete and share an activity to get started.</p>
        </div>
        {showAdForm && (
          <AdForm
            onClose={() => { setShowAdForm(false); setEditingAd(null) }}
            onSuccess={handleAdFormSuccess}
            existingAd={editingAd}
          />
        )}
      </div>
    )
  }

  return (
    <div className="home-feed">
      <div className="home-feed-header">
        <h2 className="home-feed-title">Home</h2>
        <div className="home-feed-header-actions">
          <button
            className="btn-secondary btn-sm"
            onClick={() => setShowBlogForm(!showBlogForm)}
          >
            Write
          </button>
          {isMerchant && (
            <button
              className="home-feed-create-ad-btn"
              onClick={() => { setEditingAd(null); setShowAdForm(true) }}
            >
              + Ad
            </button>
          )}
        </div>
      </div>

      {/* Initial loading state */}
      {loading && posts.length === 0 && (
        <div className="home-feed-loading">
          <div className="home-feed-spinner" />
          <p>Loading feed...</p>
        </div>
      )}

      {/* Initial error state */}
      {error && posts.length === 0 && (
        <div className="home-feed-error">
          <span className="home-feed-error-icon">!</span>
          <p>{error}</p>
          <button className="home-feed-retry-btn" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}

      {/* Feed posts (mixed with ads) */}
      {posts.length > 0 && (
        <div className="home-feed-list">
          {mixedFeed.map((item, index) => {
            if (item._type === 'ad') {
              return (
                <AdFeedCard
                  key={`ad-${item.id}`}
                  ad={item}
                  isOwn={user && item.merchant_id === user.id}
                  onEdit={handleAdEdit}
                  onDelete={handleAdDelete}
                />
              )
            }
            if (item._type === 'blog') {
              return <BlogCard key={item.id || index} post={item} onClick={() => setSelectedPost(item)} />
            }
            return <FeedCard key={item.id || index} post={item} onClick={() => setSelectedPost(item)} />
          })}

          {/* Inline error for pagination failures */}
          {error && (
            <div className="home-feed-inline-error">
              <p>{error}</p>
              <button className="home-feed-retry-btn" onClick={handleRetry}>
                Retry
              </button>
            </div>
          )}

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="home-feed-loading-more">
              <div className="home-feed-spinner" />
            </div>
          )}

          {/* Sentinel element for IntersectionObserver */}
          {hasMore && !error && (
            <div ref={sentinelRef} className="home-feed-sentinel" />
          )}
        </div>
      )}

      {/* Ad Form Modal */}
      {showAdForm && (
        <AdForm
          onClose={() => { setShowAdForm(false); setEditingAd(null) }}
          onSuccess={handleAdFormSuccess}
          existingAd={editingAd}
        />
      )}

      {/* Write Blog Form */}
      {showBlogForm && (
        <WriteBlogForm
          onClose={() => setShowBlogForm(false)}
          onSuccess={(newBlog) => {
            setPosts(prev => [newBlog, ...prev])
            setShowBlogForm(false)
          }}
        />
      )}

      {/* Detail Modal */}
      <DetailModal isOpen={!!selectedPost} onClose={() => setSelectedPost(null)}>
        {selectedPost && selectedPost._type === 'blog' && <BlogDetail post={selectedPost} />}
        {selectedPost && !selectedPost._type && <ActivityDetail post={selectedPost} />}
      </DetailModal>
    </div>
  )
}

function FeedCard({ post, onClick }) {
  const activity = post.activities
  const profile = post.profiles

  return (
    <div className="feed-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="feed-header">
        <div className="feed-user">
          <div className="feed-avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" />
            ) : (
              <span className="avatar-placeholder">
                {profile?.display_name?.[0] || '?'}
              </span>
            )}
          </div>
          <div className="feed-user-info">
            <span className="feed-username">
              {profile?.display_name || 'Unknown'}
              {profile?.role === 'merchant' && <span className="merchant-badge">PRO</span>}
            </span>
            <span className="feed-date">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {activity && (
        <div
          className="feed-activity"
          style={{ borderLeftColor: typeColors[activity.type] || '#999' }}
        >
          <div className="feed-activity-type">
            <span className="activity-type-icon" style={{ background: typeColors[activity.type] || '#666' }}>{typeIcons[activity.type] || '?'}</span>
            <span style={{ color: typeColors[activity.type] || '#999' }}>
              {activity.type}
            </span>
          </div>
          <div className="feed-metrics">
            <div className="feed-metric">
              <span className="feed-metric-value">{activity.distance} km</span>
              <span className="feed-metric-label">Distance</span>
            </div>
            <div className="feed-metric">
              <span className="feed-metric-value">{activity.duration} min</span>
              <span className="feed-metric-label">Duration</span>
            </div>
            {activity.distance > 0 && (
              <div className="feed-metric">
                <span className="feed-metric-value">
                  {(activity.duration / activity.distance).toFixed(1)} min/km
                </span>
                <span className="feed-metric-label">Pace</span>
              </div>
            )}
          </div>
        </div>
      )}

      {post.caption && <p className="feed-caption">{post.caption}</p>}

      <div className="feed-route-image">
        <RouteMap seed={post.id ? post.id.charCodeAt(0) + post.id.charCodeAt(1) : Math.floor(Math.random() * 100)} height={180} />
      </div>

      <div className="feed-actions">
        <span className="feed-action-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          {post.likes_count || 0}
        </span>
        <span className="feed-action-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {post.comments_count || 0}
        </span>
      </div>
    </div>
  )
}

function BlogCard({ post, onClick }) {
  const profile = post.profiles
  const [expanded, setExpanded] = useState(false)
  const images = post.images || []
  const imageClass = images.length === 1 ? 'single' : images.length === 2 ? 'double' : 'triple'

  return (
    <div className="feed-card blog-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="feed-header">
        <div className="feed-user">
          <div className="feed-avatar">
            <span className="avatar-placeholder">
              {profile?.display_name?.[0] || '?'}
            </span>
          </div>
          <div className="feed-user-info">
            <span className="feed-username">
              {profile?.display_name || 'Unknown'}
              {profile?.is_influencer && <span className="influencer-badge">Creator</span>}
              <span className="blog-badge">Blog</span>
            </span>
            <span className="feed-date">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <button className="follow-btn">Follow</button>
      </div>

      <h3 className="blog-title">{post.title}</h3>
      <p className="blog-body">
        {expanded ? post.body : post.body?.substring(0, 150) + '...'}
      </p>
      {!expanded && post.body?.length > 150 && (
        <button className="blog-read-more" onClick={() => setExpanded(true)}>
          Read more
        </button>
      )}

      {images.length > 0 && (
        <div className={`blog-images ${imageClass}`}>
          {images.slice(0, 3).map((img, i) => (
            <img key={i} src={img} alt={`Blog image ${i + 1}`} />
          ))}
        </div>
      )}

      <div className="feed-actions">
        <span className="feed-action-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          {post.likes_count || 0}
        </span>
        <span className="feed-action-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {post.comments_count || 0}
        </span>
      </div>
    </div>
  )
}

function WriteBlogForm({ onClose, onSuccess }) {
  const { user, profile } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    if (!body.trim()) { setError('Write something for your blog'); return }

    const newBlog = {
      id: Math.random().toString(36).substring(2),
      _type: 'blog',
      title: title.trim(),
      body: body.trim(),
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      profiles: {
        display_name: profile?.display_name || 'You',
        avatar_url: profile?.avatar_url,
        role: profile?.role || 'individual',
      },
    }

    onSuccess(newBlog)
  }

  return (
    <div className="blog-form-overlay">
      <div className="blog-form">
        <div className="blog-form-header">
          <h3>Write a Blog Post</h3>
          <button className="blog-form-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Blog title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError('') }}
            className="blog-form-title-input"
          />
          <textarea
            placeholder="Share your thoughts, tips, or experience..."
            value={body}
            onChange={(e) => { setBody(e.target.value); setError('') }}
            rows={8}
            className="blog-form-body-input"
          />
          {error && <p className="blog-form-error">{error}</p>}
          <div className="blog-form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Publish</button>
          </div>
        </form>
      </div>
    </div>
  )
}
