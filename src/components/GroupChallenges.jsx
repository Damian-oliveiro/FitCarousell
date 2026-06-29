import React, { useState } from 'react'
import './GroupChallenges.css'

export default function GroupChallenges({ groupId, onChallengeCreated }) {
  const [title, setTitle] = useState('')
  const [goal, setGoal] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const newErrors = {}
    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title must be under 100 characters'
    }
    if (!goal.trim()) {
      newErrors.goal = 'Goal is required'
    } else if (goal.trim().length > 300) {
      newErrors.goal = 'Goal must be under 300 characters'
    }
    if (!startDate) {
      newErrors.startDate = 'Start date is required'
    }
    if (!endDate) {
      newErrors.endDate = 'End date is required'
    }
    if (startDate && endDate && endDate <= startDate) {
      newErrors.endDate = 'End date must be after start date'
    }
    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSubmitting(true)
    const result = await onChallengeCreated(groupId, {
      title: title.trim(),
      goal: goal.trim(),
      startDate,
      endDate,
    })
    setSubmitting(false)

    if (result) {
      setTitle('')
      setGoal('')
      setStartDate('')
      setEndDate('')
      setErrors({})
    }
  }

  return (
    <form className="group-challenge-form" onSubmit={handleSubmit}>
      <h4>Create Challenge</h4>

      <div className="form-field">
        <label htmlFor="challenge-title">Title *</label>
        <input
          id="challenge-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Challenge title"
        />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="challenge-goal">Goal *</label>
        <textarea
          id="challenge-goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          maxLength={300}
          placeholder="e.g. Run 50km this month"
          rows={2}
        />
        {errors.goal && <span className="field-error">{errors.goal}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="challenge-start-date">Start Date *</label>
        <input
          id="challenge-start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        {errors.startDate && <span className="field-error">{errors.startDate}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="challenge-end-date">End Date *</label>
        <input
          id="challenge-end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        {errors.endDate && <span className="field-error">{errors.endDate}</span>}
      </div>

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Challenge'}
      </button>
    </form>
  )
}
