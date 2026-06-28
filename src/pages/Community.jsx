import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import './Community.css'

const typeIcons = { Run: '🏃', Cycle: '🚴', Swim: '🏊', Walk: '🚶' }
const typeColors = { Run: '#fc4c02', Cycle: '#2196f3', Swim: '#00bcd4', Walk: '#4caf50' }

export default function Community() {
  const { feedPosts, fetchFeedPosts, likePost, unlikePost, addComment, fetchComments, followUser, unfollowUser, following } = useData()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [expandedComments, setExpandedComments] = useState({})
  const [commentInputs, setCommentInputs] = useState({})
  const [postComments, setPostComments] = useState({})
  const observerRef = useRef(null)
  const loadMoreRef = useRef(null)

  // Initial load
  useEffect(() => {
    loadPosts(0)
  }, [])

  const loadPosts = async (offset) => {
    setLoading(true)
    const posts = await fetchFeedPosts(offset, 20)
    if (posts.length < 20) setHasMore(false)
    setLoading(false)
  }

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadPosts(feedPosts.length)
        }
      },
      { threshold: 0.5 }
    )

    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    observerRef.current = observer

    return () => observer.disconnect()
  }, [feedPosts.length, hasMore, loading])

  const handleLike = async (post) => {
    if (post.user_liked) {
      await unlikePost(post.id)
    } else {
      await likePost(post.id)
    }
  }

  const toggleComments = async (postId) => {
    if (expandedComments[postId]) {
      setExpandedComments(prev => ({ ...prev, [postId]: false }))
    } else {
      setExpandedComments(prev => ({ ...prev, [postId]: true }))
      if (!postComments[postId]) {
        const comments = await fetchComments(postId, 0, 10)
        setPostComments(prev => ({ ...prev, [postId]: comments }))
      }
    }
  }

  const handleAddComment = async (postId) => {
    const content = commentInputs[postId]?.trim()
    if (!content) return
    const comment = await addComment(postId, content)
    if (comment) {
      setPostComments(prev => ({
        ...prev,
        [postId]: [comment, ...(prev[postId] || [])]
      }))
      setCommentInputs(prev => ({ ...prev, [postId]: '' }))
    }
  }

  const handleFollow = (userId) => {
    if (following.includes(userId)) {
      unfollowUser(userId)
    } else {
      followUser(userId)
    }
  }

  // Split feed into followed and community sections
  const followedPosts = feedPosts.filter(p => following.includes(p.user_id))
  const communityPosts = feedPosts.filter(p => !following.includes(p.user_id) && p.user_id !== user?.id)

  const renderPost = (post) => {
    const activity = post.activities
    const profile = post.profiles
    const isFollowing = following.includes(post.user_id)
    const isOwnPost = post.user_id === user?.id

    return (
      <div key={post.id} className="feed-card">
        <div className="feed-header">
          <div className="feed-user">
            <div className="feed-avatar">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" />
              ) : (
                <span className="avatar-placeholder">{profile?.display_name?.[0] || '?'}</span>
              )}
            </div>
            <div className="feed-user-info">
              <span className="feed-username">
                {profile?.display_name || 'Unknown'}
                {profile?.role === 'merchant' && <span className="merchant-badge">🏪</span>}
              </span>
              <span className="feed-date">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          {!isOwnPost && (
            <button
              className={`btn-follow ${isFollowing ? 'following' : ''}`}
              onClick={() => handleFollow(post.user_id)}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {activity && (
          <div className="feed-activity" style={{ borderLeftColor: typeColors[activity.type] }}>
            <div className="feed-activity-type">
              <span>{typeIcons[activity.type]}</span>
              <span style={{ color: typeColors[activity.type] }}>{activity.type}</span>
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
              <div className="feed-metric">
                <span className="feed-metric-value">
                  {(activity.pace || activity.duration / activity.distance).toFixed(1)} min/km
                </span>
                <span className="feed-metric-label">Pace</span>
              </div>
            </div>
          </div>
        )}

        {post.caption && <p className="feed-caption">{post.caption}</p>}

        <div className="feed-actions">
          <button
            className={`btn-like ${post.user_liked ? 'liked' : ''}`}
            onClick={() => handleLike(post)}
          >
            {post.user_liked ? '❤️' : '🤍'} {post.likes_count || 0}
          </button>
          <button
            className="btn-comment"
            onClick={() => toggleComments(post.id)}
          >
            💬 {post.comments_count || 0}
          </button>
        </div>

        {expandedComments[post.id] && (
          <div className="feed-comments">
            <div className="comment-input-row">
              <input
                type="text"
                placeholder="Add a comment..."
                maxLength={500}
                value={commentInputs[post.id] || ''}
                onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
              />
              <button onClick={() => handleAddComment(post.id)}>Post</button>
            </div>
            <div className="comments-list">
              {(postComments[post.id] || []).map(comment => (
                <div key={comment.id} className="comment-item">
                  <span className="comment-author">{comment.profiles?.display_name || 'User'}</span>
                  <span className="comment-text">{comment.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="community">
      <h2>Community</h2>

      {followedPosts.length > 0 && (
        <div className="feed-section">
          <h3 className="feed-section-title">From People You Follow</h3>
          {followedPosts.map(renderPost)}
        </div>
      )}

      <div className="feed-section">
        {followedPosts.length > 0 && <h3 className="feed-section-title">Discover</h3>}
        {communityPosts.map(renderPost)}
      </div>

      {feedPosts.length === 0 && !loading && (
        <div className="empty-state">
          <p>No posts yet. Complete an activity and share it with the community!</p>
        </div>
      )}

      {loading && (
        <div className="feed-loading">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      )}

      {hasMore && <div ref={loadMoreRef} className="load-more-trigger" />}
    </div>
  )
}
