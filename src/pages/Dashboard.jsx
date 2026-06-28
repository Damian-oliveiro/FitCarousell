import React from 'react'
import { useData } from '../context/DataContext'
import './Dashboard.css'

const typeIcons = { Run: '🏃', Cycle: '🚴', Swim: '🏊', Walk: '🚶' }

export default function Dashboard() {
  const { activities, events, listings } = useData()

  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0)
  const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0)
  const totalActivities = activities.length

  return (
    <div className="dashboard">
      <h2>Welcome back! 👋</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon">📏</div>
          <div className="value">{totalDistance.toFixed(1)} km</div>
          <div className="label">Total Distance</div>
        </div>
        <div className="stat-card">
          <div className="icon">⏱️</div>
          <div className="value">{totalDuration} min</div>
          <div className="label">Total Duration</div>
        </div>
        <div className="stat-card">
          <div className="icon">🔥</div>
          <div className="value">{totalActivities}</div>
          <div className="label">Activities Logged</div>
        </div>
        <div className="stat-card">
          <div className="icon">🎉</div>
          <div className="value">{events.length}</div>
          <div className="label">Upcoming Events</div>
        </div>
      </div>

      <div className="recent-section">
        <h3>Recent Activities</h3>
        <div className="recent-list">
          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="recent-item">
              <div className="info">
                <span className="type-icon">{typeIcons[activity.type] || '🏅'}</span>
                <div className="details">
                  <h4>{activity.type}</h4>
                  <p>{activity.date}</p>
                </div>
              </div>
              <div className="metrics">
                <div className="distance">{activity.distance} km</div>
                <div className="duration">{activity.duration} min</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-section">
        <h3>Marketplace Highlights</h3>
        <div className="recent-list">
          {listings.slice(0, 3).map((listing) => (
            <div key={listing.id} className="recent-item">
              <div className="info">
                <span className="type-icon">{listing.image}</span>
                <div className="details">
                  <h4>{listing.title}</h4>
                  <p>{listing.condition} · {listing.seller}</p>
                </div>
              </div>
              <div className="metrics">
                <div className="distance">${listing.price}</div>
                <div className="duration">{listing.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
