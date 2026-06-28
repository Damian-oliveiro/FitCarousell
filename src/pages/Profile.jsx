import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import './Profile.css'

const typeColors = { Run: '#fc4c02', Cycle: '#2196f3', Swim: '#00bcd4', Walk: '#4caf50' }

function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

export default function Profile() {
  const { activities, joinedEvents, listings, following, followers, events } = useData()
  const { profile, isMerchant, updateProfile, signOut } = useAuth()

  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    display_name: profile?.display_name || '',
  })
  const [editError, setEditError] = useState('')

  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0)
  const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0)

  const activityBreakdown = activities.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + a.distance
    return acc
  }, {})

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
      setEditError('Failed to update profile')
    }
  }

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
              <span>🏋️</span>
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
                />
                {editError && <span className="field-error">{editError}</span>}
                <div className="edit-actions">
                  <button className="btn-primary btn-sm" onClick={handleSaveProfile}>Save</button>
                  <button className="btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h2>
                  {profile?.display_name || 'User'}
                  <span className={`role-badge ${profile?.role}`}>
                    {isMerchant ? '🏪 Merchant' : '👤 Individual'}
                  </span>
                </h2>
                <p className="member-since">Member since {memberSince}</p>
                <button className="btn-edit" onClick={() => {
                  setEditForm({ display_name: profile?.display_name || '' })
                  setEditing(true)
                }}>
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>

        <button className="btn-logout" onClick={signOut}>Log Out</button>
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <div className="stat-value">{totalDistance.toFixed(1)} km</div>
          <div className="stat-label">Total Distance</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">
            {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
          </div>
          <div className="stat-label">Total Time</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{activities.length}</div>
          <div className="stat-label">Activities</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{joinedEvents.length}</div>
          <div className="stat-label">Events</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{formatCount(followers.length)}</div>
          <div className="stat-label">Followers</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{formatCount(following.length)}</div>
          <div className="stat-label">Following</div>
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="profile-section">
        <h3>Activity Breakdown</h3>
        <div className="breakdown-list">
          {Object.entries(activityBreakdown).map(([type, distance]) => (
            <div key={type} className="breakdown-item">
              <span className="breakdown-type">{type}</span>
              <div className="breakdown-bar-container">
                <div
                  className="breakdown-bar"
                  style={{
                    width: `${totalDistance > 0 ? (distance / totalDistance) * 100 : 0}%`,
                    backgroundColor: typeColors[type] || '#666',
                  }}
                />
              </div>
              <span className="breakdown-value">{distance.toFixed(1)} km</span>
            </div>
          ))}
          {Object.keys(activityBreakdown).length === 0 && (
            <p className="empty-text">No activities recorded yet.</p>
          )}
        </div>
      </div>

      {/* Merchant Dashboard */}
      {isMerchant && (
        <div className="profile-section merchant-section">
          <h3>🏪 Merchant Dashboard</h3>
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
    </div>
  )
}
