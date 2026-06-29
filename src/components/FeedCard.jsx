import React from 'react'
import './FeedCard.css'

const ACTIVITY_ICONS = {
  run: 'R',
  cycle: 'C',
  swim: 'S',
  walk: 'W',
}

function formatDuration(minutes) {
  if (!minutes) return '0m'
  const hrs = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

function formatPace(pace) {
  if (!pace || !isFinite(pace)) return '--'
  const mins = Math.floor(pace)
  const secs = Math.round((pace - mins) * 60)
  return `${mins}:${secs.toString().padStart(2, '0')} /km`
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return ''
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHrs / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHrs < 24) return `${diffHrs}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function FeedCard({ post }) {
  if (!post) return null

  const activity = post.activities || post.activity || {}
  const userProfile = post.profiles || {}
  const displayName = userProfile.display_name || 'Unknown User'
  const avatarUrl = userProfile.avatar_url
  const activityType = activity.type || activity.activity_type || 'run'
  const activityIcon = ACTIVITY_ICONS[activityType] || 'R'

  return (
    <article className="feed-card" aria-label={`Activity post by ${displayName}`}>
      <div className="feed-card__header">
        <div className="feed-card__avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`${displayName}'s avatar`} className="feed-card__avatar-img" />
          ) : (
            <div className="feed-card__avatar-placeholder" aria-label="Default avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="feed-card__user-info">
          <span className="feed-card__display-name">{displayName}</span>
          <span className="feed-card__timestamp">{formatRelativeTime(post.created_at)}</span>
        </div>
        <span className="feed-card__activity-icon" title={activityType} aria-label={`${activityType} activity`}>
          {activityIcon}
        </span>
      </div>

      <div className="feed-card__stats">
        {activity.distance != null && (
          <div className="feed-card__stat">
            <span className="feed-card__stat-value">{Number(activity.distance).toFixed(2)}</span>
            <span className="feed-card__stat-label">km</span>
          </div>
        )}
        {activity.duration != null && (
          <div className="feed-card__stat">
            <span className="feed-card__stat-value">{formatDuration(activity.duration)}</span>
            <span className="feed-card__stat-label">duration</span>
          </div>
        )}
        {activity.pace != null && (
          <div className="feed-card__stat">
            <span className="feed-card__stat-value">{formatPace(activity.pace)}</span>
            <span className="feed-card__stat-label">pace</span>
          </div>
        )}
      </div>

      {post.caption && (
        <p className="feed-card__caption">{post.caption}</p>
      )}
    </article>
  )
}
