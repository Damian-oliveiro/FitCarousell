import React from 'react'
import './Record.css'

const ACTIVITIES = [
  { id: 'run', label: 'Run', color: '#8b5cf6', icon: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="5" r="2"/>
      <path d="M4 21l2.5-6L9 14l2-3-2-2.5"/>
      <path d="M9 14l4 2 2-5"/>
      <path d="M13 21l-2-5"/>
    </svg>
  )},
  { id: 'cycle', label: 'Cycle', color: '#60a5fa', icon: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17.5" r="3.5"/>
      <circle cx="18.5" cy="17.5" r="3.5"/>
      <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor"/>
      <path d="M12 17.5V14l-3-3 4-3 2 3h3"/>
    </svg>
  )},
  { id: 'swim', label: 'Swim', color: '#22d3ee', icon: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20c2-1 4 0 6-1s4-2 6-1 4 0 6-1"/>
      <path d="M2 16c2-1 4 0 6-1s4-2 6-1 4 0 6-1"/>
      <circle cx="9" cy="8" r="2"/>
      <path d="M11 8l3 3-2 2"/>
    </svg>
  )},
  { id: 'walk', label: 'Walk', color: '#34d399', icon: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2"/>
      <path d="M13 21l-1.5-5-2.5 3"/>
      <path d="M10 14l1.5-2.5 2.5 1 2.5-3"/>
      <path d="M11 21l.5-3"/>
    </svg>
  )},
  { id: 'hike', label: 'Hike', color: '#f59e0b', icon: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3l3 7h5l-4 4 2 7-6-4-6 4 2-7-4-4h5l3-7z"/>
    </svg>
  )},
  { id: 'log', label: 'Log Activity', color: '#a78bfa', icon: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14"/>
      <path d="M5 12h14"/>
    </svg>
  )},
]

export default function Record() {
  return (
    <div className="record-page">
      <h2>Start Recording</h2>
      <p className="record-subtitle">Choose your activity type</p>

      <div className="activity-grid">
        {ACTIVITIES.map(activity => (
          <button
            key={activity.id}
            className="activity-card"
            style={{ '--activity-color': activity.color }}
          >
            <div className="activity-card-icon">
              {activity.icon}
            </div>
            <span className="activity-card-label">{activity.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
