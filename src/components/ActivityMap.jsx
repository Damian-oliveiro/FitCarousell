import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './ActivityMap.css'

const typeColors = { Run: '#fc4c02', Cycle: '#2196f3', Swim: '#00bcd4', Walk: '#4caf50' }

/**
 * Component that keeps the map centered on the current position during live tracking.
 */
function MapUpdater({ currentPosition, routePoints, isLive }) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    if (isLive && currentPosition) {
      map.setView([currentPosition.lat, currentPosition.lng], map.getZoom())
    } else if (!isLive && routePoints.length > 1) {
      // Fit bounds to show full route when not live
      const bounds = routePoints.map(p => [p.lat, p.lng])
      map.fitBounds(bounds, { padding: [30, 30] })
    }
  }, [map, currentPosition, routePoints, isLive])

  return null
}

/**
 * Live activity map showing current position and route trail.
 *
 * Props:
 * - routePoints: Array of {lat, lng, timestamp}
 * - currentPosition: {lat, lng} or null
 * - activityType: 'Run' | 'Cycle' | 'Swim' | 'Walk'
 * - isLive: boolean — if true, follows current position
 */
export default function ActivityMap({ routePoints, currentPosition, activityType, isLive }) {
  const color = typeColors[activityType] || '#fc4c02'
  const positions = routePoints.map(p => [p.lat, p.lng])

  // Default center — use current position or first route point
  const center = currentPosition
    ? [currentPosition.lat, currentPosition.lng]
    : routePoints.length > 0
      ? [routePoints[0].lat, routePoints[0].lng]
      : [1.3521, 103.8198] // Singapore fallback

  return (
    <div className="activity-map-container">
      <MapContainer
        center={center}
        zoom={16}
        className="activity-map"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route polyline */}
        {positions.length > 1 && (
          <Polyline
            positions={positions}
            pathOptions={{ color, weight: 4, opacity: 0.8 }}
          />
        )}

        {/* Current position marker */}
        {currentPosition && (
          <CircleMarker
            center={[currentPosition.lat, currentPosition.lng]}
            radius={8}
            pathOptions={{
              color: 'white',
              weight: 3,
              fillColor: color,
              fillOpacity: 1,
            }}
          />
        )}

        {/* Start point marker */}
        {routePoints.length > 0 && (
          <CircleMarker
            center={[routePoints[0].lat, routePoints[0].lng]}
            radius={5}
            pathOptions={{
              color: 'white',
              weight: 2,
              fillColor: '#22c55e',
              fillOpacity: 1,
            }}
          />
        )}

        <MapUpdater
          currentPosition={currentPosition}
          routePoints={routePoints}
          isLive={isLive}
        />
      </MapContainer>
    </div>
  )
}
