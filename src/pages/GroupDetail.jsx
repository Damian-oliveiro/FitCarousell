import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { generateMockGroups } from '../utils/mockData'
import RouteMap from '../components/RouteMap'
import './GroupDetail.css'

const MOCK_MEMBERS = [
  'Alex Chen', 'Jordan Kim', 'Sam Patel', 'Casey Nguyen', 'Taylor Tanaka',
  'Morgan Garcia', 'Riley Lee', 'Quinn Singh', 'Avery Williams', 'Blake Brown',
  'Drew Johnson', 'Sage Miller', 'Kai Davis', 'Reese Wilson', 'Charlie Moore',
]

const MUTUAL_FRIENDS = ['Jordan Kim', 'Sam Patel', 'Riley Lee']

const PAST_ACTIVITIES = [
  { title: 'Saturday Group Run', distance: '5.2 km', participants: 18, date: '2 days ago' },
  { title: 'Hill Repeats Session', distance: '3.8 km', participants: 12, date: '5 days ago' },
  { title: 'Long Run Sunday', distance: '12.1 km', participants: 24, date: '1 week ago' },
  { title: 'Interval Training', distance: '4.5 km', participants: 15, date: '1 week ago' },
  { title: 'Recovery Jog', distance: '3.0 km', participants: 9, date: '2 weeks ago' },
]

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1461897104016-0b3b00b1ea56?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
]

const AFFILIATES = [
  { name: 'Nike Run Club', type: 'Brand Partner' },
  { name: 'Garmin Sports', type: 'Tech Partner' },
  { name: 'GU Energy', type: 'Nutrition Partner' },
]

export default function GroupDetail() {
  const { id } = useParams()
  const [group, setGroup] = useState(null)
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Find the group from mock data
    const allGroups = generateMockGroups(12)
    const found = allGroups.find(g => g.id === id)
    if (found) {
      setGroup(found)
    } else {
      // If not found by ID (mock IDs are random), just show the first one
      setGroup(allGroups[0])
    }
    setLoading(false)
  }, [id])

  const handleJoin = () => {
    setIsMember(true)
    if (group) setGroup({ ...group, member_count: (group.member_count || 0) + 1 })
  }

  const handleLeave = () => {
    setIsMember(false)
    if (group) setGroup({ ...group, member_count: Math.max(0, (group.member_count || 0) - 1) })
  }

  if (loading) {
    return (
      <div className="group-detail">
        <div className="group-detail-loading">
          <div className="loading-spinner" />
          <p>Loading group...</p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="group-detail">
        <Link to="/groups" className="group-back-link">Back to Groups</Link>
        <div className="group-detail-error"><p>Group not found</p></div>
      </div>
    )
  }

  return (
    <div className="group-detail">
      <Link to="/groups" className="group-back-link">Back to Groups</Link>

      {/* Cover Image */}
      {group.cover_image && (
        <div className="gd-cover">
          <img src={group.cover_image} alt={group.name} />
        </div>
      )}

      {/* Header */}
      <div className="gd-header">
        <h2>{group.name}</h2>
        <p className="gd-description">{group.description}</p>
        <div className="gd-meta">
          <span className="gd-member-count">{group.member_count} members</span>
          {isMember ? (
            <button className="btn-secondary btn-sm" onClick={handleLeave}>Leave</button>
          ) : (
            <button className="btn-primary btn-sm" onClick={handleJoin}>Join Group</button>
          )}
        </div>
      </div>

      {/* Mutual Friends */}
      <div className="gd-section">
        <h3>Mutual Friends</h3>
        <div className="gd-mutual-friends">
          {MUTUAL_FRIENDS.map(name => (
            <div key={name} className="gd-friend-chip">
              <div className="gd-friend-avatar">{name[0]}</div>
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Members */}
      <div className="gd-section">
        <h3>Members ({MOCK_MEMBERS.length})</h3>
        <div className="gd-members-grid">
          {MOCK_MEMBERS.slice(0, 8).map(name => (
            <div key={name} className="gd-member-item">
              <div className="gd-member-avatar">{name[0]}</div>
              <span className="gd-member-name">{name}</span>
            </div>
          ))}
          {MOCK_MEMBERS.length > 8 && (
            <div className="gd-member-item gd-member-more">
              <div className="gd-member-avatar">+{MOCK_MEMBERS.length - 8}</div>
              <span className="gd-member-name">more</span>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Event */}
      {group.upcoming_event && (
        <div className="gd-section">
          <h3>Upcoming Event</h3>
          <div className="gd-event-card">
            <h4>{group.upcoming_event.title}</h4>
            <p className="gd-event-desc">{group.upcoming_event.description}</p>
            <div className="gd-event-meta">
              <span>{group.upcoming_event.date} at {group.upcoming_event.time}</span>
              <span>{group.upcoming_event.location}</span>
            </div>
            <div className="gd-event-tags">
              <span className={`event-price-tag ${group.upcoming_event.price === 0 ? 'free' : 'paid'}`}>
                {group.upcoming_event.priceLabel}
              </span>
              {group.upcoming_event.prize && (
                <span className="event-prize-tag">{group.upcoming_event.prize}</span>
              )}
              <span className="event-spots">{group.upcoming_event.spotsLeft} spots left</span>
            </div>
            <span className="gd-event-organizer">By {group.upcoming_event.organizer}</span>
            <button className="btn-primary btn-sm gd-event-join">
              {group.upcoming_event.price > 0 ? `Join - ${group.upcoming_event.priceLabel}` : 'Join Event'}
            </button>
          </div>
        </div>
      )}

      {/* Past Activities */}
      <div className="gd-section">
        <h3>Past Activities</h3>
        <div className="gd-activities-list">
          {PAST_ACTIVITIES.map((activity, i) => (
            <div key={i} className="gd-activity-item">
              <div className="gd-activity-map">
                <RouteMap seed={i * 17 + 3} height={80} />
              </div>
              <div className="gd-activity-info">
                <span className="gd-activity-title">{activity.title}</span>
                <span className="gd-activity-stats">{activity.distance} · {activity.participants} runners</span>
                <span className="gd-activity-date">{activity.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div className="gd-section">
        <h3>Photos</h3>
        <div className="gd-gallery">
          {GALLERY_IMAGES.map((img, i) => (
            <img key={i} src={img} alt={`Group photo ${i + 1}`} className="gd-gallery-img" />
          ))}
        </div>
      </div>

      {/* Affiliates */}
      <div className="gd-section">
        <h3>Affiliates & Partners</h3>
        <div className="gd-affiliates">
          {AFFILIATES.map(aff => (
            <div key={aff.name} className="gd-affiliate-item">
              <div className="gd-affiliate-logo">{aff.name[0]}</div>
              <div className="gd-affiliate-info">
                <span className="gd-affiliate-name">{aff.name}</span>
                <span className="gd-affiliate-type">{aff.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
