import React from 'react'
import { useData } from '../context/DataContext'
import './Events.css'

export default function Events() {
  const { events, joinEvent, joinedEvents } = useData()

  return (
    <div className="events">
      <h2>Events & Challenges</h2>

      <div className="events-grid">
        {events.map((event) => {
          const isJoined = joinedEvents.includes(event.id)
          return (
            <div key={event.id} className="event-card">
              <span className={`event-type-badge ${event.type === 'Challenge' ? 'challenge' : ''}`}>
                {event.type}
              </span>
              <h3>{event.title}</h3>
              <p className="event-desc">{event.description}</p>
              <div className="event-meta">
                <span>📅 {event.date}</span>
                <span>📍 {event.location}</span>
              </div>
              <div className="event-footer">
                <span className="participants">👥 {event.participants} joined</span>
                <button
                  className={isJoined ? 'btn-joined' : 'btn-join'}
                  onClick={() => joinEvent(event.id)}
                  disabled={isJoined}
                >
                  {isJoined ? 'Joined ✓' : 'Join Event'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
