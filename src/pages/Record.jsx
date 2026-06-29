import React, { useState, useEffect, useRef } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useGPS } from '../hooks/useGPS'
import ActivityMap from '../components/ActivityMap'
import './Record.css'

const typeIcons = { Run: '🏃', Cycle: '🚴', Swim: '🏊', Walk: '🚶' }
const typeColors = { Run: '#fc4c02', Cycle: '#2196f3', Swim: '#00bcd4', Walk: '#4caf50' }

const SESSION_STORAGE_KEY = 'fitcarousell_active_session'

export default function Record() {
  const { addActivity, shareToFeed } = useData()
  const { profile } = useAuth()
  const gps = useGPS()

  // Tracker state
  const [trackerState, setTrackerState] = useState('idle')
  const [selectedType, setSelectedType] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startedAt, setStartedAt] = useState(null)
  const timerRef = useRef(null)

  // Completion
  const [manualDistance, setManualDistance] = useState('')
  const [distanceError, setDistanceError] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [savedActivity, setSavedActivity] = useState(null)
  const [shareCaption, setShareCaption] = useState('')
  const [showSharePrompt, setShowSharePrompt] = useState(false)

  // Recovery
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

  // Timer
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

  // Persist session
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

  const handleSelectType = (type) => {
    setSelectedType(type)
    setElapsedTime(0)
    setStartedAt(Date.now())
    setTrackerState('running')
    gps.startTracking()
  }

  const handlePause = () => {
    setTrackerState('paused')
    gps.pauseTracking()
  }

  const handleResume = () => {
    setTrackerState('running')
    gps.resumeTracking()
  }

  const handleStop = () => {
    setTrackerState('stopped')
    gps.stopTracking()
    localStorage.removeItem(SESSION_STORAGE_KEY)
  }

  const handleSave = async () => {
    let distance = gps.totalDistance

    if (distance < 0.01) {
      const dist = parseFloat(manualDistance)
      if (!manualDistance || isNaN(dist) || dist <= 0 || dist > 9999.99) {
        setDistanceError('Enter a valid distance between 0.01 and 9999.99 km')
        return
      }
      distance = dist
    }

    setDistanceError('')
    const durationMinutes = Math.max(1, Math.round(elapsedTime / 60))
    const pace = durationMinutes / distance

    const activity = {
      type: selectedType,
      distance: parseFloat(distance.toFixed(2)),
      duration: durationMinutes,
      pace: parseFloat(pace.toFixed(2)),
      date: new Date().toISOString().split('T')[0],
    }

    const saved = await addActivity(activity)
    if (saved) {
      setSavedActivity(saved)
      setShowSummary(true)
    }
  }

  const handleShare = async () => {
    if (savedActivity) {
      await shareToFeed(savedActivity.id, shareCaption)
    }
    resetTracker()
  }

  const resetTracker = () => {
    setTrackerState('idle')
    setSelectedType(null)
    setElapsedTime(0)
    setStartedAt(null)
    setManualDistance('')
    setDistanceError('')
    setShowSummary(false)
    setSavedActivity(null)
    setShareCaption('')
    setShowSharePrompt(false)
    gps.resetTracking()
  }

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

  return (
    <div className="record-page">
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

      {/* Idle — select activity type */}
      {trackerState === 'idle' && (
        <div className="record-idle">
          <h2>Start Recording</h2>
          <p className="record-subtitle">Choose your activity type</p>
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
        </div>
      )}

      {/* Active — recording or paused */}
      {(trackerState === 'running' || trackerState === 'paused') && (
        <div className="record-active">
          <div className="record-type" style={{ color: typeColors[selectedType] }}>
            {typeIcons[selectedType]} {selectedType}
          </div>
          <div className="record-timer">{formatTime(elapsedTime)}</div>

          {/* Live GPS Stats */}
          <div className="record-gps-stats">
            <div className="gps-stat">
              <span className="gps-stat-value">{gps.totalDistance.toFixed(2)}</span>
              <span className="gps-stat-label">km</span>
            </div>
            <div className="gps-stat">
              <span className="gps-stat-value">
                {gps.totalDistance > 0 ? ((elapsedTime / 60) / gps.totalDistance).toFixed(1) : '0.0'}
              </span>
              <span className="gps-stat-label">min/km</span>
            </div>
            <div className="gps-stat">
              <span className="gps-stat-value">{gps.currentSpeed.toFixed(1)}</span>
              <span className="gps-stat-label">km/h</span>
            </div>
          </div>

          {/* GPS accuracy */}
          {gps.gpsAccuracy && (
            <div className={`gps-accuracy ${gps.gpsAccuracy < 10 ? 'good' : gps.gpsAccuracy < 25 ? 'fair' : 'poor'}`}>
              📡 GPS: ±{Math.round(gps.gpsAccuracy)}m
            </div>
          )}

          {/* GPS Error */}
          {gps.gpsError && (
            <div className="gps-error">⚠️ {gps.gpsError}</div>
          )}

          {/* Live Map */}
          {gps.currentPosition && (
            <ActivityMap
              routePoints={gps.routePoints}
              currentPosition={gps.currentPosition}
              activityType={selectedType}
              isLive={true}
            />
          )}

          <div className="record-status">
            {trackerState === 'paused' && <span className="status-paused">PAUSED</span>}
            {trackerState === 'running' && <span className="status-recording">● RECORDING</span>}
          </div>

          <div className="record-controls">
            {trackerState === 'running' ? (
              <button className="btn-pause" onClick={handlePause}>⏸ Pause</button>
            ) : (
              <button className="btn-resume" onClick={handleResume}>▶ Resume</button>
            )}
            <button className="btn-stop" onClick={handleStop}>⏹ Stop</button>
          </div>
        </div>
      )}

      {/* Stopped — save activity */}
      {trackerState === 'stopped' && !showSummary && (
        <div className="record-complete">
          <h3>Activity Complete!</h3>
          <p className="complete-info">
            {typeIcons[selectedType]} {selectedType} — {formatTime(elapsedTime)}
          </p>

          {gps.totalDistance >= 0.01 ? (
            <div className="gps-distance-result">
              <div className="gps-distance-value">{gps.totalDistance.toFixed(2)} km</div>
              <div className="gps-distance-label">Distance tracked by GPS</div>
            </div>
          ) : (
            <label className="distance-input">
              Distance (km)
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="9999.99"
                value={manualDistance}
                onChange={(e) => setManualDistance(e.target.value)}
                placeholder="GPS didn't detect movement — enter distance"
              />
              {distanceError && <span className="field-error">{distanceError}</span>}
            </label>
          )}

          {/* Route map */}
          {gps.routePoints.length > 1 && (
            <ActivityMap
              routePoints={gps.routePoints}
              currentPosition={null}
              activityType={selectedType}
              isLive={false}
            />
          )}

          <div className="complete-actions">
            <button className="btn-primary" onClick={handleSave}>Save Activity</button>
            <button className="btn-cancel" onClick={resetTracker}>Discard</button>
          </div>
        </div>
      )}

      {/* Summary */}
      {showSummary && !showSharePrompt && (
        <div className="record-summary">
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
          <button className="btn-secondary" onClick={resetTracker}>Done</button>
        </div>
      )}

      {/* Share */}
      {showSharePrompt && (
        <div className="record-share">
          <h3>Share Activity</h3>
          <textarea
            placeholder="Add a caption (optional)..."
            value={shareCaption}
            onChange={(e) => setShareCaption(e.target.value)}
            maxLength={300}
            rows={3}
          />
          <div className="share-actions">
            <button className="btn-primary" onClick={handleShare}>Share</button>
            <button className="btn-secondary" onClick={resetTracker}>Skip</button>
          </div>
        </div>
      )}
    </div>
  )
}
