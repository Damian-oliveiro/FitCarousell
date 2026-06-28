import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import './Activities.css'

const typeIcons = { Run: '🏃', Cycle: '🚴', Swim: '🏊', Walk: '🚶' }

export default function Activities() {
  const { activities, addActivity } = useData()
  const [form, setForm] = useState({ type: 'Run', distance: '', duration: '', date: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.distance || !form.duration || !form.date) return
    addActivity({
      type: form.type,
      distance: parseFloat(form.distance),
      duration: parseInt(form.duration),
      date: form.date,
    })
    setForm({ type: 'Run', distance: '', duration: '', date: '' })
  }

  return (
    <div className="activities">
      <h2>Activities</h2>

      <form className="activity-form" onSubmit={handleSubmit}>
        <h3>Log New Activity</h3>
        <div className="form-row">
          <label>
            Type
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="Run">Run</option>
              <option value="Cycle">Cycle</option>
              <option value="Swim">Swim</option>
              <option value="Walk">Walk</option>
            </select>
          </label>
          <label>
            Distance (km)
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 5.0"
              value={form.distance}
              onChange={(e) => setForm({ ...form, distance: e.target.value })}
            />
          </label>
          <label>
            Duration (min)
            <input
              type="number"
              placeholder="e.g. 30"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
          </label>
          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
        </div>
        <button type="submit" className="btn-primary">Log Activity</button>
      </form>

      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-card">
            <div className="left">
              <span className="type-badge">{typeIcons[activity.type] || '🏅'}</span>
              <div className="activity-info">
                <h4>{activity.type}</h4>
                <p>{activity.date}</p>
              </div>
            </div>
            <div className="right">
              <div className="distance">{activity.distance} km</div>
              <div className="duration">{activity.duration} min</div>
              <div className="pace">
                {(activity.duration / activity.distance).toFixed(1)} min/km
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
