import React, { useState, useEffect, useRef } from 'react'
import ActivityMap from '../components/ActivityMap'
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

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Record() {
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [recording, setRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [distance, setDistance] = useState(0)
  const [locationError, setLocationError] = useState(null)
  const [positions, setPositions] = useState([])
  const timerRef = useRef(null)
  const watchRef = useRef(null)

  // Timer
  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [recording])

  const handleSelectActivity = (activity) => {
    if (activity.id === 'log') {
      alert('Manual log coming soon. Use one of the activity types to start GPS recording.')
      return
    }
    setSelectedActivity(activity)
    setDuration(0)
    setDistance(0)
    setPositions([])
    setLocationError(null)
  }

  const handleStart = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setRecording(true)
    setLocationError(null)

    watchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        
        // Filter out inaccurate readings (>30m accuracy is GPS noise)
        if (accuracy > 30) return

        const newPoint = { lat: latitude, lng: longitude, timestamp: Date.now() }

        setPositions(prev => {
          // Skip if too close to last point (GPS jitter filter)
          if (prev.length > 0) {
            const last = prev[prev.length - 1]
            const d = getDistanceKm(last.lat, last.lng, latitude, longitude)
            // Skip if less than 3 meters moved (noise) or impossibly fast (>50km/h for running)
            if (d < 0.003) return prev
            const timeDiff = (newPoint.timestamp - last.timestamp) / 1000 / 3600 // hours
            if (timeDiff > 0 && d / timeDiff > 50) return prev // too fast, skip
            setDistance(prevDist => prevDist + d)
          }
          return [...prev, newPoint]
        })
      },
      (error) => {
        setLocationError(`Location error: ${error.message}`)
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    )
  }

  const handleStop = () => {
    setRecording(false)
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current)
      watchRef.current = null
    }
  }

  const handleBack = () => {
    handleStop()
    setSelectedActivity(null)
    setDuration(0)
    setDistance(0)
    setPositions([])
  }

  // Haversine distance
  function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const pace = distance > 0 ? (duration / 60) / distance : 0
  // Estimated metrics
  const estSteps = distance > 0 ? Math.round(distance * 1300) : null // ~1300 steps/km avg
  const estCalories = distance > 0 ? Math.round(distance * 62) : null // ~62 cal/km for 70kg person
  const [heartRate, setHeartRate] = useState(null)
  const [cadence, setCadence] = useState(null)
  const [deviceConnected, setDeviceConnected] = useState(false)

  // Try Web Bluetooth heart rate (works on Android Chrome, some desktop)
  const connectDevice = async () => {
    try {
      if (!navigator.bluetooth) {
        alert('Bluetooth not supported on this browser. Connect via Garmin/Strava integration instead.')
        return
      }
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['heart_rate'],
      })
      const server = await device.gatt.connect()
      const service = await server.getPrimaryService('heart_rate')
      const characteristic = await service.getCharacteristic('heart_rate_measurement')
      setDeviceConnected(true)

      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target.value
        const hr = value.getUint8(1)
        setHeartRate(hr)
      })
      await characteristic.startNotifications()
    } catch (err) {
      console.log('Bluetooth connect failed:', err.message)
      // Silently fail — just show -- for HR
    }
  }

  // Activity selected — show recording screen
  if (selectedActivity) {
    return (
      <div className="record-page">
        <button className="record-back-btn" onClick={handleBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back
        </button>

        <div className="recording-view" style={{ '--activity-color': selectedActivity.color }}>
          <div className="recording-activity-label">
            <span className="recording-icon">{selectedActivity.icon}</span>
            <h3>{selectedActivity.label}</h3>
          </div>

          {/* Live Map */}
          <div className="recording-map">
            <ActivityMap
              routePoints={positions}
              currentPosition={positions.length > 0 ? positions[positions.length - 1] : null}
              activityType={selectedActivity.label}
              isLive={recording}
            />
          </div>

          <div className="recording-stats">
            <div className="recording-stat main-stat">
              <span className="recording-stat-value">{distance.toFixed(2)}</span>
              <span className="recording-stat-label">km</span>
            </div>
            <div className="recording-stat">
              <span className="recording-stat-value">{formatDuration(duration)}</span>
              <span className="recording-stat-label">Duration</span>
            </div>
            <div className="recording-stat">
              <span className="recording-stat-value">{pace > 0 ? pace.toFixed(1) : '--'}</span>
              <span className="recording-stat-label">min/km</span>
            </div>
          </div>

          <div className="recording-stats secondary-stats">
            <div className="recording-stat">
              <span className="recording-stat-value">{heartRate || '--'}</span>
              <span className="recording-stat-label">BPM</span>
            </div>
            <div className="recording-stat">
              <span className="recording-stat-value">{estSteps || '--'}</span>
              <span className="recording-stat-label">Steps</span>
            </div>
            <div className="recording-stat">
              <span className="recording-stat-value">{estCalories || '--'}</span>
              <span className="recording-stat-label">kcal</span>
            </div>
            <div className="recording-stat">
              <span className="recording-stat-value">{cadence || '--'}</span>
              <span className="recording-stat-label">Cadence</span>
            </div>
          </div>

          {!deviceConnected && (
            <button className="connect-device-btn" onClick={connectDevice}>
              Connect Heart Rate Monitor
            </button>
          )}
          {deviceConnected && (
            <span className="device-connected-badge">Device connected</span>
          )}

          {locationError && (
            <div className="recording-error">
              <p>{locationError}</p>
            </div>
          )}

          <div className="recording-controls">
            {!recording ? (
              <button className="record-start-btn" onClick={handleStart}>
                Start
              </button>
            ) : (
              <button className="record-stop-btn" onClick={handleStop}>
                Stop
              </button>
            )}
          </div>

          {!recording && duration > 0 && (
            <div className="recording-summary">
              <p>Activity recorded. {positions.length} GPS points captured.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Activity selection screen
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
            onClick={() => handleSelectActivity(activity)}
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
