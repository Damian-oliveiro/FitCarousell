import React from 'react'
import { useData } from '../context/DataContext'
import './Profile.css'

export default function Profile() {
  const { activities, joinedEvents, listings } = useData()

  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0)
  const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0)
  const userListings = listings.filter((l) => l.seller === 'You')

  const activityBreakdown = activities.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + a.distance
    return acc
  }, {})

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="avatar">🏋️</div>
        <div className="profile-info">
          <h2>Fitness Enthusiast</h2>
          <p>Member since June 2026</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <div className="stat-value">{totalDistance.toFixed(1)} km</div>
          <div className="stat-label">Total Distance</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{totalDuration} min</div>
          <div className="stat-label">Total Time</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{activities.length}</div>
          <div className="stat-label">Activities</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{joinedEvents.length}</div>
          <div className="stat-label">Events Joined</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{userListings.length}</div>
          <div className="stat-label">Items Listed</div>
        </div>
      </div>

      <div className="profile-section">
        <h3>Activity Breakdown</h3>
        <div className="breakdown-list">
          {Object.entries(activityBreakdown).map(([type, distance]) => (
            <div key={type} className="breakdown-item">
              <span className="breakdown-type">{type}</span>
              <div className="breakdown-bar-container">
                <div
                  className="breakdown-bar"
                  style={{ width: `${(distance / totalDistance) * 100}%` }}
                />
              </div>
              <span className="breakdown-value">{distance.toFixed(1)} km</span>
            </div>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <h3>Achievements</h3>
        <div className="achievements-grid">
          <div className="achievement">
            <span className="achievement-icon">🏅</span>
            <span className="achievement-label">First Run</span>
          </div>
          <div className="achievement">
            <span className="achievement-icon">🔥</span>
            <span className="achievement-label">3-Day Streak</span>
          </div>
          <div className="achievement">
            <span className="achievement-icon">🚴</span>
            <span className="achievement-label">Century Rider</span>
          </div>
          <div className="achievement unlocked">
            <span className="achievement-icon">🎯</span>
            <span className="achievement-label">Event Joiner</span>
          </div>
        </div>
      </div>
    </div>
  )
}
