import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import './Activities.css'

const typeIcons = { Run: 'R', Cycle: 'C', Swim: 'S', Walk: 'W' }
const typeColors = { Run: '#fc4c02', Cycle: '#2196f3', Swim: '#00bcd4', Walk: '#4caf50' }

const SESSION_STORAGE_KEY = 'fitcarousell_active_session'

export default function Activities() {
  const { activities, addActivity, shareToFeed } = useData()
  const { profile } = useAuth()

  // Tracker state
  const [trackerState, setTrackerState] = useState('idle') // idle, selecting, running, paused, stopped
  const [selectedType, setSelectedType] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startedAt, setStartedAt] = useState(null)
  const timerRef = useRef(null)

  // Completion form
  const [distance, setDistance] = useState('')
  const [distanceError, setDistanceError] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [savedActivity, setSavedActivity] = useState(null)
  const [shareCaption, setShareCaption] = useState('')
  const [showSharePrompt, setShowSharePrompt] = useState(false)

  // Manual log form
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualForm, setManualForm] = useState({ type: 'Run', distance: '', duration: '', date: '' })
  const [manualErrors, setManualErrors] = useState({})

  // Recovery check
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false)
  const [recoveredSession, setRecoveredSession] = useState(null)

  // Check for interrupted session on mount
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY)
    if (saved) {
      try {
        const session = JSON.parse(saved)
        setRecoveredSession(session)
        setShowRecoveryPrompt(true)
      } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY)
      }
    }
  }, [])

  // Timer logic
  useEffect(() => {
    if (trackerState === 'running') {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [trackerState])

  // Persist session to localStorage
  useEffect(() => {
    if (trackerState === 'running' || trackerState === 'paused') {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        type: selectedType,
        elapsedTime,
        startedAt,
        state: trackerState,
      }))
    }
  }, [trackerState, elapsedTime, selectedType, startedAt])

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleStartActivity = () => {
    setTrackerState('selecting')
  }

  const handleSelectType = (type) => {
    setSelectedType(type)
    setElapsedTime(0)
    setStartedAt(Date.now())
    setTrackerState('running')
  }

  const handlePause = () => {
    setTrackerState('paused')
  }

  const handleResume = () => {
    setTrackerState('running')
  }

  const handleStop = () => {
    setTrackerState('stopped')
    localStorage.removeItem(SESSION_STORAGE_KEY)
  }

  const handleSubmitDistance = async () => {
    const dist = parseFloat(distance)
    if (!distance || isNaN(dist) || dist <= 0 || dist > 9999.99) {
      setDistanceError('Enter a valid distance between 0.01 and 9999.99 km')
      return
    }
    setDistanceError('')

    const pace = (elapsedTime / 60) / dist
    const activity = {
      type: selectedType,
      distance: dist,
      duration: Math.round(elapsedTime / 60),
      pace: parseFloat(pace.toFixed(2)),
      date: new Date().toISOString().split('T')[0],
    }

    const saved = await addActivity(activity)
    if (saved) {
      setSavedActivity(saved)
      setShowSummary(true)
    }
  }

  const handleShareActivity = async () => {
    if (savedActivity) {
      await shareToFeed(savedActivity.id, shareCaption)
    }
    resetTracker()
  }

  const handleSkipShare = () => {
    resetTracker()
  }

  const resetTracker = () => {
    setTrackerState('idle')
    setSelectedType(null)
    setElapsedTime(0)
    setStartedAt(null)
    setDistance('')
    setDistanceError('')
    setShowSummary(false)
    setSavedActivity(null)
    setShareCaption('')
    setShowSharePrompt(false)
  }

  // Recovery handlers
  const handleResumeRecovery = () => {
    if (recoveredSession) {
      setSelectedType(recoveredSession.type)
      setElapsedTime(recoveredSession.elapsedTime)
      setStartedAt(recoveredSession.startedAt)
      setTrackerState('paused')
    }
    setShowRecoveryPrompt(false)
  }

  const handleDiscardRecovery = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setShowRecoveryPrompt(false)
    setRecoveredSession(null)
  }

  // Manual log handlers
  const handleManualSubmit = async (e) => {
    e.preventDefault()
    const errors = {}

    if (!manualForm.type) errors.type = 'Required'
    const dist = parseFloat(manualForm.distance)
    if (!manualForm.distance || isNaN(dist) || dist < 0.1 || dist > 999.9) {
      errors.distance = 'Must be between 0.1 and 999.9 km'
    }
    const dur = parseInt(manualForm.duration)
    if (!manualForm.duration || isNaN(dur) || dur < 1 || dur > 1440) {
      errors.duration = 'Must be between 1 and 1440 minutes'
    }
    if (!manualForm.date) {
      errors.date = 'Required'
    } else if (new Date(manualForm.date) > new Date()) {
      errors.date = 'Cannot be a future date'
    }

    if (Object.keys(errors).length > 0) {
      setManualErrors(errors)
      return
    }

    setManualErrors({})
    const activity = {
      type: manualForm.type,
      distance: dist,
      duration: dur,
      date: manualForm.date,
    }
    const saved = await addActivity(activity)
    if (saved) {
      setManualForm({ type: 'Run', distance: '', duration: '', date: '' })
      setShowManualForm(false)
    }
  }

  return (
    <div className="activities">
      {/* Recovery Prompt */}
      {showRecoveryPrompt && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Session Interrupted</h3>
            <p>
              You have an unfinished <strong>{recoveredSession?.type}</strong> session
              ({formatTime(recoveredSession?.elapsedTime || 0)} elapsed).
            </p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleResumeRecovery}>Resume</button>
              <button className="btn-secondary" onClick={handleDiscardRecovery}>Discard</button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Tracker */}
      <div className="tracker-section">
        {trackerState === 'idle' && (
          <div className="tracker-idle">
            <div className="tracker-buttons">
              <button className="btn-start" onClick={handleStartActivity}>
                ▶ Start Activity
              </button>
              <button className="btn-manual" onClick={() => setShowManualForm(!showManualForm)}>
                Log Manually
              </button>
            </div>
          </div>
        )}

        {trackerState === 'selecting' && (
          <div className="tracker-select">
            <h3>Select Activity Type</h3>
            <div className="type-grid">
              {['Run', 'Cycle', 'Swim', 'Walk'].map(type => (
                <button
                  key={type}
                  className="type-btn"
                  style={{ borderColor: typeColors[type] }}
                  onClick={() => handleSelectType(type)}
                >
                  <span className="type-icon">{typeIcons[type]}</span>
                  <span className="type-label">{type}</span>
                </button>
              ))}
            </div>
            <button className="btn-cancel" onClick={() => setTrackerState('idle')}>Cancel</button>
          </div>
        )}

        {(trackerState === 'running' || trackerState === 'paused') && (
          <div className="tracker-active">
            <div className="tracker-type" style={{ color: typeColors[selectedType] }}>
              {typeIcons[selectedType]} {selectedType}
            </div>
            <div className="tracker-timer">{formatTime(elapsedTime)}</div>
            <div className="tracker-status">
              {trackerState === 'paused' && <span className="status-paused">PAUSED</span>}
              {trackerState === 'running' && <span className="status-running">RECORDING</span>}
            </div>
            <div className="tracker-controls">
              {trackerState === 'running' ? (
                <button className="btn-pause" onClick={handlePause}>⏸ Pause</button>
              ) : (
                <button className="btn-resume" onClick={handleResume}>▶ Resume</button>
              )}
              <button className="btn-stop" onClick={handleStop}>⏹ Stop</button>
            </div>
          </div>
        )}

        {trackerState === 'stopped' && !showSummary && (
          <div className="tracker-complete">
            <h3>Activity Complete!</h3>
            <p className="complete-info">
              {typeIcons[selectedType]} {selectedType} — {formatTime(elapsedTime)}
            </p>
            <label className="distance-input">
              Distance (km)
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="9999.99"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Enter distance in km"
              />
              {distanceError && <span className="field-error">{distanceError}</span>}
            </label>
            <button className="btn-primary" onClick={handleSubmitDistance}>Save Activity</button>
            <button className="btn-cancel" onClick={resetTracker}>Discard</button>
          </div>
        )}

        {showSummary && !showSharePrompt && (
          <div className="tracker-summary">
            <h3>Activity Saved ✓</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Type</span>
                <span className="summary-value">{typeIcons[savedActivity?.type]} {savedActivity?.type}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Duration</span>
                <span className="summary-value">{formatTime(elapsedTime)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Distance</span>
                <span className="summary-value">{savedActivity?.distance} km</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Pace</span>
                <span className="summary-value">{savedActivity?.pace?.toFixed(1)} min/km</span>
              </div>
            </div>
            <button className="btn-primary" onClick={() => setShowSharePrompt(true)}>
              Share to Community
            </button>
            <button className="btn-secondary" onClick={handleSkipShare}>Done</button>
          </div>
        )}

        {showSharePrompt && (
          <div className="tracker-share">
            <h3>Share Activity</h3>
            <textarea
              placeholder="Add a caption (optional)..."
              value={shareCaption}
              onChange={(e) => setShareCaption(e.target.value)}
              maxLength={300}
              rows={3}
            />
            <div className="share-actions">
              <button className="btn-primary" onClick={handleShareActivity}>Share</button>
              <button className="btn-secondary" onClick={handleSkipShare}>Skip</button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Log Form */}
      {showManualForm && trackerState === 'idle' && (
        <form className="manual-form" onSubmit={handleManualSubmit}>
          <h3>Log Activity Manually</h3>
          <div className="form-grid">
            <label className={manualErrors.type ? 'has-error' : ''}>
              Type
              <select value={manualForm.type} onChange={(e) => setManualForm({ ...manualForm, type: e.target.value })}>
                <option value="Run">Run</option>
                <option value="Cycle">Cycle</option>
                <option value="Swim">Swim</option>
                <option value="Walk">Walk</option>
              </select>
              {manualErrors.type && <span className="field-error">{manualErrors.type}</span>}
            </label>
            <label className={manualErrors.distance ? 'has-error' : ''}>
              Distance (km)
              <input
                type="number"
                step="0.1"
                value={manualForm.distance}
                onChange={(e) => setManualForm({ ...manualForm, distance: e.target.value })}
                placeholder="0.1 — 999.9"
              />
              {manualErrors.distance && <span className="field-error">{manualErrors.distance}</span>}
            </label>
            <label className={manualErrors.duration ? 'has-error' : ''}>
              Duration (min)
              <input
                type="number"
                value={manualForm.duration}
                onChange={(e) => setManualForm({ ...manualForm, duration: e.target.value })}
                placeholder="1 — 1440"
              />
              {manualErrors.duration && <span className="field-error">{manualErrors.duration}</span>}
            </label>
            <label className={manualErrors.date ? 'has-error' : ''}>
              Date
              <input
                type="date"
                value={manualForm.date}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
              />
              {manualErrors.date && <span className="field-error">{manualErrors.date}</span>}
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">Log Activity</button>
            <button type="button" className="btn-cancel" onClick={() => setShowManualForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Activity History */}
      <div className="activity-history">
        <h3>Activity History</h3>
        {activities.length === 0 ? (
          <div className="empty-state">
            <p>No activities logged yet. Start tracking or log manually!</p>
          </div>
        ) : (
          <div className="activity-list">
            {activities.map((activity) => (
              <div key={activity.id} className="activity-card">
                <div className="activity-left">
                  <span
                    className="type-badge"
                    style={{ backgroundColor: typeColors[activity.type] + '20', color: typeColors[activity.type] }}
                  >
                    {typeIcons[activity.type] || '🏅'}
                  </span>
                  <div className="activity-info">
                    <h4>{activity.type}</h4>
                    <p className="activity-date">{activity.date}</p>
                  </div>
                </div>
                <div className="activity-right">
                  <div className="metric">
                    <span className="metric-value">{activity.distance} km</span>
                    <span className="metric-label">Distance</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">{activity.duration} min</span>
                    <span className="metric-label">Duration</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">
                      {(activity.pace || activity.duration / activity.distance).toFixed(1)} min/km
                    </span>
                    <span className="metric-label">Pace</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
