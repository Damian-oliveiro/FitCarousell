import React, { useState } from 'react'
import './GroupEvents.css'

export default function GroupEvents({ groupId, onEventCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const newErrors = {}
    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title must be under 100 characters'
    }
    if (description.length > 500) {
      newErrors.description = 'Description must be under 500 characters'
    }
    if (!date) {
      newErrors.date = 'Date is required'
    }
    if (location.length > 200) {
      newErrors.location = 'Location must be under 200 characters'
    }
    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSubmitting(true)
    const result = await onEventCreated(groupId, {
      title: title.trim(),
      description: description.trim() || null,
      date,
      time: time || null,
      location: location.trim() || null,
    })
    setSubmitting(false)

    if (result) {
      setTitle('')
      setDescription('')
      setDate('')
      setTime('')
      setLocation('')
      setErrors({})
    }
  }

  return (
    <form className="group-event-form" onSubmit={handleSubmit}>
      <h4>Create Event</h4>

      <div className="form-field">
        <label htmlFor="event-title">Title *</label>
        <input
          id="event-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Event title"
        />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="event-description">Description</label>
        <textarea
          id="event-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          placeholder="Event description (optional)"
          rows={3}
        />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="event-date">Date *</label>
        <input
          id="event-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {errors.date && <span className="field-error">{errors.date}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="event-time">Time</label>
        <input
          id="event-time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="event-location">Location</label>
        <input
          id="event-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={200}
          placeholder="Event location (optional)"
        />
        {errors.location && <span className="field-error">{errors.location}</span>}
      </div>

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  )
}
