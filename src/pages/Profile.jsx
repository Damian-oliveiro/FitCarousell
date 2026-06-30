import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { generateMockFeedPosts } from '../utils/mockData'
import { IconEdit, IconLogout, IconStore } from '../components/Icons'
import RouteMap from '../components/RouteMap'
import SellerRatings from '../components/SellerRatings'
import './Profile.css'

function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

export default function Profile() {
  const navigate = useNavigate()
  const { activities, joinedEvents, following, followers, listings, events } = useData()
  const { user, profile, isMerchant, updateProfile } = useAuth()

  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    display_name: profile?.display_name || '',
  })
  const [editError, setEditError] = useState('')

  // Activity statistics computed from DataContext
  const [stats, setStats] = useState({
    totalDistance: 0,
    totalDuration: 0,
    activityCount: 0,
    eventsJoinedCount: 0,
    followersCount: 0,
    followingCount: 0,
  })

  // Fetch activity stats from supabase for accuracy
  useEffect(() => {
    async function fetchStats() {
      if (!user) return

      // Fetch activity aggregates
      const { data: activityData } = await supabase
        .from('activities')
        .select('distance, duration')
        .eq('user_id', user.id)

      const totalDistance = activityData?.reduce((sum, a) => sum + (a.distance || 0), 0) || 0
      const totalDuration = activityData?.reduce((sum, a) => sum + (a.duration || 0), 0) || 0
      const activityCount = activityData?.length || 0

      // Fetch events joined count
      const { count: eventsCount } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Fetch followers count
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id)

      // Fetch following count
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id)

      setStats({
        totalDistance,
        totalDuration,
        activityCount,
        eventsJoinedCount: eventsCount || 0,
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
      })
    }

    fetchStats()
  }, [user, activities, joinedEvents, followers, following])

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown'

  const handleSaveProfile = async () => {
    const name = editForm.display_name.trim()
    if (name.length < 2 || name.length > 50) {
      setEditError('Display name must be 2-50 characters')
      return
    }
    if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
      setEditError('Only letters, numbers, and spaces allowed')
      return
    }

    try {
      await updateProfile({ display_name: name })
      setEditing(false)
      setEditError('')
    } catch (err) {
      setEditError(err?.message || 'Update failed')
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      // Sign out even if there's an error
    }
    navigate('/login')
  }

  // Format duration as hours and minutes
  const hours = Math.floor(stats.totalDuration / 60)
  const minutes = stats.totalDuration % 60

  // Merchant specific data
  const merchantEvents = isMerchant ? events.filter(e => e.merchant_id === profile?.id) : []
  const merchantListings = isMerchant ? listings.filter(l => l.seller_id === profile?.id) : []

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="avatar-section">
          <div className="avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" />
            ) : (
              <span className="avatar-placeholder-text">{profile?.display_name?.[0] || 'U'}</span>
            )}
          </div>
          <div className="profile-info">
            {editing ? (
              <div className="edit-form-inline">
                <input
                  type="text"
                  value={editForm.display_name}
                  onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                  maxLength={50}
                  placeholder="Display name"
                />
                {editError && <span className="field-error">{editError}</span>}
                <div className="edit-actions">
                  <button className="btn-primary btn-sm" onClick={handleSaveProfile}>Save</button>
                  <button className="btn-secondary btn-sm" onClick={() => { setEditing(false); setEditError('') }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h2>
                  {profile?.display_name || 'User'}
                  <span className={`role-badge ${profile?.role}`}>
                    {isMerchant ? 'Merchant' : 'Individual'}
                  </span>
                </h2>
                <p className="member-since">Member since {memberSince}</p>
                <button className="btn-edit" onClick={() => {
                  setEditForm({ display_name: profile?.display_name || '' })
                  setEditError('')
                  setEditing(true)
                }}>
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>

        <button className="btn-logout" onClick={handleLogout}>Log Out</button>
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <div className="stat-value">{stats.totalDistance.toFixed(1)} km</div>
          <div className="stat-label">Total Distance</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">
            {hours}h {minutes}m
          </div>
          <div className="stat-label">Total Time</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{stats.activityCount}</div>
          <div className="stat-label">Activities</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{stats.eventsJoinedCount}</div>
          <div className="stat-label">Events Joined</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{formatCount(stats.followersCount)}</div>
          <div className="stat-label">Followers</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{formatCount(stats.followingCount)}</div>
          <div className="stat-label">Following</div>
        </div>
      </div>

      {/* Merchant Dashboard */}
      {isMerchant && (
        <div className="profile-section merchant-section">
          <h3>Merchant Dashboard</h3>
          <div className="merchant-stats">
            <div className="merchant-stat">
              <span className="merchant-stat-value">{merchantEvents.length}</span>
              <span className="merchant-stat-label">Events Created</span>
            </div>
            <div className="merchant-stat">
              <span className="merchant-stat-value">{merchantListings.length}</span>
              <span className="merchant-stat-label">Active Listings</span>
            </div>
          </div>
        </div>
      )}

      {/* Seller Ratings */}
      {profile?.id && (
        <div className="profile-section">
          <h3>Seller Ratings</h3>
          <SellerRatings sellerId={profile.id} />
        </div>
      )}

      {/* Run History */}
      <RunHistory userName={profile?.display_name || 'You'} />
    </div>
  )
}

const typeIcons = { Run: 'R', Cycle: 'C', Swim: 'S', Walk: 'W' }
const typeColors = { Run: '#8b5cf6', Cycle: '#60a5fa', Swim: '#22d3ee', Walk: '#34d399' }

function RunHistory({ userName }) {
  const [runs] = useState(() => {
    const mockPosts = generateMockFeedPosts(10)
    // Override display names to be the current user
    return mockPosts.map(p => ({
      ...p,
      profiles: { ...p.profiles, display_name: userName },
    }))
  })

  return (
    <div className="profile-section">
      <h3>Activity History</h3>
      <div className="run-history-list">
        {runs.map(post => {
          const activity = post.activities
          return (
            <div key={post.id} className="run-history-card">
              <div className="run-history-map">
                <RouteMap seed={post.id ? post.id.charCodeAt(0) * 7 + post.id.charCodeAt(2) : i * 13} height={140} />
              </div>
              <div className="run-history-info">
                <div className="run-history-type">
                  <span className="run-history-icon" style={{ background: typeColors[activity?.type] || '#666' }}>
                    {typeIcons[activity?.type] || '?'}
                  </span>
                  <span className="run-history-type-label">{activity?.type || 'Activity'}</span>
                  <span className="run-history-date">{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <div className="run-history-metrics">
                  <div className="run-history-metric">
                    <span className="run-history-metric-value">{activity?.distance} km</span>
                    <span className="run-history-metric-label">Distance</span>
                  </div>
                  <div className="run-history-metric">
                    <span className="run-history-metric-value">{activity?.duration} min</span>
                    <span className="run-history-metric-label">Duration</span>
                  </div>
                  {activity?.distance > 0 && (
                    <div className="run-history-metric">
                      <span className="run-history-metric-value">{(activity.duration / activity.distance).toFixed(1)}</span>
                      <span className="run-history-metric-label">min/km</span>
                    </div>
                  )}
                </div>
                {post.caption && <p className="run-history-caption">{post.caption}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
