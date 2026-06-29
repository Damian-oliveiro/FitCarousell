import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import './Events.css'

export default function Events() {
  const { events, joinEvent, joinedEvents, createEvent } = useData()
  const { isMerchant, profile } = useAuth()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    max_participants: '',
    event_type: 'Run',
  })
  const [formErrors, setFormErrors] = useState({})

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    const errors = {}

    if (!form.title || form.title.length > 100) errors.title = 'Title is required (max 100 chars)'
    if (!form.description || form.description.length > 500) errors.description = 'Description required (max 500 chars)'
    if (!form.date || new Date(form.date) <= new Date()) errors.date = 'Must be a future date'
    if (!form.time) errors.time = 'Time is required'
    if (!form.location || form.location.length > 200) errors.location = 'Location required (max 200 chars)'
    const maxP = parseInt(form.max_participants)
    if (!form.max_participants || isNaN(maxP) || maxP < 2 || maxP > 1000) {
      errors.max_participants = 'Must be between 2 and 1000'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    const result = await createEvent({
      title: form.title,
      description: form.description,
      date: form.date,
      time: form.time,
      location: form.location,
      max_participants: maxP,
      event_type: form.event_type,
      participant_count: 0,
    })

    if (result) {
      setForm({ title: '', description: '', date: '', time: '', location: '', max_participants: '', event_type: 'Run' })
      setShowForm(false)
    }
  }

  const handleJoin = (event) => {
    if (joinedEvents.includes(event.id)) return
    if (event.participant_count >= event.max_participants) return
    joinEvent(event.id)
  }

  return (
    <div className="events">
      <div className="events-header">
        <h2>Events & Challenges</h2>
        {isMerchant && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Create Event'}
          </button>
        )}
      </div>

      {showForm && isMerchant && (
        <form className="event-form" onSubmit={handleCreateEvent}>
          <h3>Create New Event</h3>
          <div className="form-grid">
            <label className={formErrors.title ? 'has-error' : ''}>
              Title
              <input
                type="text"
                maxLength={100}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Event title"
              />
              {formErrors.title && <span className="field-error">{formErrors.title}</span>}
            </label>
            <label className={formErrors.event_type ? 'has-error' : ''}>
              Event Type
              <select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}>
                <option value="Run">Run</option>
                <option value="Cycle">Cycle</option>
                <option value="Swim">Swim</option>
                <option value="Walk">Walk</option>
                <option value="Challenge">Challenge</option>
              </select>
            </label>
            <label className={formErrors.date ? 'has-error' : ''}>
              Date
              <input
                type="date"
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              {formErrors.date && <span className="field-error">{formErrors.date}</span>}
            </label>
            <label className={formErrors.time ? 'has-error' : ''}>
              Time
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
              {formErrors.time && <span className="field-error">{formErrors.time}</span>}
            </label>
            <label className={formErrors.location ? 'has-error' : ''}>
              Location
              <input
                type="text"
                maxLength={200}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Event location"
              />
              {formErrors.location && <span className="field-error">{formErrors.location}</span>}
            </label>
            <label className={formErrors.max_participants ? 'has-error' : ''}>
              Max Participants
              <input
                type="number"
                min={2}
                max={1000}
                value={form.max_participants}
                onChange={(e) => setForm({ ...form, max_participants: e.target.value })}
                placeholder="2 — 1000"
              />
              {formErrors.max_participants && <span className="field-error">{formErrors.max_participants}</span>}
            </label>
          </div>
          <label className={formErrors.description ? 'has-error' : ''}>
            Description
            <textarea
              maxLength={500}
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your event..."
            />
            {formErrors.description && <span className="field-error">{formErrors.description}</span>}
          </label>
          <button type="submit" className="btn-primary">Publish Event</button>
        </form>
      )}

      <div className="events-grid">
        {events.map((event) => {
          const isJoined = joinedEvents.includes(event.id)
          const isFull = event.participant_count >= event.max_participants
          const merchantName = event.profiles?.display_name || 'Organizer'

          return (
            <div key={event.id} className="event-card">
              <div className="event-card-header">
                <span className={`event-type-badge ${event.event_type?.toLowerCase()}`}>
                  {event.event_type || event.type}
                </span>
                {event.profiles?.role === 'merchant' && (
                  <span className="merchant-badge">PRO · {merchantName}</span>
                )}
              </div>
              <h3>{event.title}</h3>
              <p className="event-desc">{event.description}</p>
              <div className="event-meta">
                <span>{event.date} {event.time && `at ${event.time}`}</span>
                <span>{event.location}</span>
              </div>
              <div className="event-footer">
                <span className="participants">
                  {event.participant_count || 0}/{event.max_participants || '∞'} joined
                </span>
                <button
                  className={isJoined ? 'btn-joined' : isFull ? 'btn-full' : 'btn-join'}
                  onClick={() => handleJoin(event)}
                  disabled={isJoined || isFull}
                >
                  {isJoined ? 'Joined ✓' : isFull ? 'Full' : 'Join Event'}
                </button>
              </div>
            </div>
          )
        })}
        {events.length === 0 && (
          <div className="empty-state">
            <p>No upcoming events. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
