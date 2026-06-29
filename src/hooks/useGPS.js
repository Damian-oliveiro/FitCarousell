import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * Haversine formula to calculate distance between two GPS coordinates in km
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Detect if the user is on iOS (Safari or PWA)
 */
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

/**
 * Custom hook for GPS activity tracking.
 * Uses the browser Geolocation API with iOS-specific workarounds
 * for Safari's GPS throttling behavior.
 */
export function useGPS() {
  const [isTracking, setIsTracking] = useState(false)
  const [routePoints, setRoutePoints] = useState([])
  const [currentPosition, setCurrentPosition] = useState(null)
  const [totalDistance, setTotalDistance] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [gpsError, setGpsError] = useState(null)
  const [gpsAccuracy, setGpsAccuracy] = useState(null)

  const watchIdRef = useRef(null)
  const lastPositionRef = useRef(null)
  const distanceRef = useRef(0)
  const iosPollRef = useRef(null)
  const isTrackingRef = useRef(false)

  // Keep ref in sync to avoid stale closures in polling
  useEffect(() => {
    isTrackingRef.current = isTracking
  }, [isTracking])

  /**
   * Process a GPS position reading.
   * Shared between watchPosition and iOS polling fallback.
   */
  const processPosition = useCallback((position) => {
    const newPoint = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: position.timestamp,
    }

    setCurrentPosition(newPoint)
    setGpsAccuracy(position.coords.accuracy)

    // iOS reports coarser accuracy initially — accept up to 50m
    const accuracyThreshold = isIOS() ? 50 : 30
    if (position.coords.accuracy > accuracyThreshold) return

    if (lastPositionRef.current) {
      const dist = haversineDistance(
        lastPositionRef.current.lat,
        lastPositionRef.current.lng,
        newPoint.lat,
        newPoint.lng
      )

      // Minimum movement to filter GPS drift (5m iOS, 3m others)
      const minMovement = isIOS() ? 0.005 : 0.003
      // Max single jump to filter teleport glitches
      const maxJump = 0.5

      if (dist > minMovement && dist < maxJump) {
        distanceRef.current += dist
        setTotalDistance(distanceRef.current)

        const timeDiff = (newPoint.timestamp - lastPositionRef.current.timestamp) / 1000 / 3600
        if (timeDiff > 0) {
          const speed = dist / timeDiff
          setCurrentSpeed(speed < 150 ? speed : 0)
        }

        lastPositionRef.current = newPoint
        setRoutePoints((prev) => [...prev, newPoint])
      }
    } else {
      lastPositionRef.current = newPoint
      setRoutePoints([newPoint])
    }
  }, [])

  /**
   * iOS fallback polling — Safari often throttles watchPosition.
   * Polls getCurrentPosition every 3s as a workaround.
   */
  const startIOSPolling = useCallback(() => {
    if (iosPollRef.current) return

    iosPollRef.current = setInterval(() => {
      if (!isTrackingRef.current) return

      navigator.geolocation.getCurrentPosition(
        (position) => processPosition(position),
        () => {}, // silently ignore polling errors
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 2000 }
      )
    }, 3000)
  }, [processPosition])

  const stopIOSPolling = useCallback(() => {
    if (iosPollRef.current) {
      clearInterval(iosPollRef.current)
      iosPollRef.current = null
    }
  }, [])

  const getWatchOptions = () => ({
    enableHighAccuracy: true,
    timeout: isIOS() ? 30000 : 15000,
    maximumAge: isIOS() ? 3000 : 1000,
  })

  const handleGPSError = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setGpsError('Location permission denied. Enable location access in Settings > Safari > Location.')
        break
      case error.POSITION_UNAVAILABLE:
        setGpsError('Location unavailable. Check that Location Services is enabled in Settings > Privacy.')
        break
      case error.TIMEOUT:
        if (isIOS()) {
          setGpsError('Acquiring GPS signal… Move to an open area if this persists.')
        } else {
          setGpsError('Location request timed out.')
        }
        break
      default:
        setGpsError('An unknown GPS error occurred.')
    }
  }

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser')
      return false
    }

    setGpsError(null)
    setRoutePoints([])
    setTotalDistance(0)
    setCurrentSpeed(0)
    setCurrentPosition(null)
    lastPositionRef.current = null
    distanceRef.current = 0

    const options = getWatchOptions()

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
        }
        setCurrentPosition(point)
        setRoutePoints([point])
        setGpsAccuracy(position.coords.accuracy)
        lastPositionRef.current = point
      },
      (error) => handleGPSError(error),
      options
    )

    // Start continuous watch
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => processPosition(position),
      (error) => handleGPSError(error),
      options
    )

    // iOS fallback polling
    if (isIOS()) {
      startIOSPolling()
    }

    setIsTracking(true)
    return true
  }, [processPosition, startIOSPolling])

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    stopIOSPolling()
    setIsTracking(false)
    setCurrentSpeed(0)
  }, [stopIOSPolling])

  const pauseTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    stopIOSPolling()
    setIsTracking(false)
  }, [stopIOSPolling])

  const resumeTracking = useCallback(() => {
    if (!navigator.geolocation) return false

    const options = getWatchOptions()

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => processPosition(position),
      (error) => handleGPSError(error),
      options
    )

    if (isIOS()) {
      startIOSPolling()
    }

    setIsTracking(true)
    return true
  }, [processPosition, startIOSPolling])

  const resetTracking = useCallback(() => {
    stopTracking()
    setRoutePoints([])
    setTotalDistance(0)
    setCurrentSpeed(0)
    setCurrentPosition(null)
    setGpsError(null)
    setGpsAccuracy(null)
    lastPositionRef.current = null
    distanceRef.current = 0
  }, [stopTracking])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      if (iosPollRef.current) {
        clearInterval(iosPollRef.current)
      }
    }
  }, [])

  return {
    isTracking,
    routePoints,
    currentPosition,
    totalDistance,
    currentSpeed,
    gpsError,
    gpsAccuracy,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    resetTracking,
  }
}
