import React from 'react'

/**
 * Generates a procedural SVG "route map" that looks like a GPS trace on a green map.
 * Each seed produces a unique random route path.
 */

const ROUTE_PATHS = [
  // Loop route
  'M 40,150 C 60,80 120,40 180,60 C 240,80 280,140 260,180 C 240,220 180,240 120,220 C 60,200 30,180 40,150 Z',
  // Out and back
  'M 30,200 C 60,160 100,100 140,80 C 180,60 220,70 260,100 C 300,130 320,160 340,140',
  // Figure 8
  'M 180,60 C 120,80 80,120 100,160 C 120,200 160,220 180,180 C 200,140 240,120 260,160 C 280,200 240,240 180,220 C 120,200 100,160 180,60',
  // Zigzag trail
  'M 30,220 L 80,80 L 130,200 L 180,60 L 230,180 L 280,40 L 330,160',
  // Spiral
  'M 180,140 C 200,120 220,140 200,160 C 180,180 160,160 160,140 C 160,100 200,80 240,100 C 280,120 280,180 240,200 C 200,220 140,220 120,180 C 100,140 120,80 180,60',
  // Heart shape
  'M 180,220 C 140,180 60,160 60,100 C 60,60 100,40 140,60 C 160,70 180,90 180,90 C 180,90 200,70 220,60 C 260,40 300,60 300,100 C 300,160 220,180 180,220',
  // Star pattern
  'M 180,30 L 200,110 L 280,110 L 215,155 L 240,240 L 180,190 L 120,240 L 145,155 L 80,110 L 160,110 Z',
  // Clover
  'M 180,140 C 180,100 140,80 140,60 C 140,40 160,30 180,40 C 200,30 220,40 220,60 C 220,80 180,100 180,140 C 220,140 240,100 260,100 C 280,100 290,120 280,140 C 290,160 280,180 260,180 C 240,180 220,140 180,140',
  // Mountain
  'M 20,240 L 80,80 L 120,160 L 160,60 L 200,140 L 240,40 L 300,120 L 340,240',
  // River meander
  'M 20,120 C 60,80 80,160 120,120 C 160,80 180,160 220,120 C 260,80 280,160 320,120 C 340,100 350,140 340,160',
]

const MAP_COLORS = [
  { bg: '#d4e6c3', water: '#a8d4e6', road: '#e8e0d0' },
  { bg: '#c8deb5', water: '#94c8db', road: '#ddd5c4' },
  { bg: '#dcecc9', water: '#b0d8e8', road: '#f0e8da' },
]

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

export default function RouteMap({ seed = 0, height = 180, className = '' }) {
  const rand = seededRandom(seed)
  const routeIndex = Math.floor(rand() * ROUTE_PATHS.length)
  const colorIndex = Math.floor(rand() * MAP_COLORS.length)
  const colors = MAP_COLORS[colorIndex]
  const routePath = ROUTE_PATHS[routeIndex]

  // Generate random "roads" for background
  const roads = Array.from({ length: 4 }, () => {
    const x1 = rand() * 360
    const y1 = rand() * 260
    const x2 = rand() * 360
    const y2 = rand() * 260
    return `M ${x1},${y1} C ${x1 + 40},${y1 - 30} ${x2 - 40},${y2 + 30} ${x2},${y2}`
  })

  // Generate random "water" blobs
  const waterBlobs = Array.from({ length: 2 }, () => ({
    cx: 60 + rand() * 240,
    cy: 40 + rand() * 180,
    rx: 20 + rand() * 30,
    ry: 15 + rand() * 20,
  }))

  return (
    <div className={`route-map ${className}`} style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 360 260" preserveAspectRatio="xMidYMid slice">
        {/* Map background */}
        <rect width="360" height="260" fill={colors.bg} />

        {/* Water features */}
        {waterBlobs.map((blob, i) => (
          <ellipse key={i} cx={blob.cx} cy={blob.cy} rx={blob.rx} ry={blob.ry} fill={colors.water} opacity="0.7" />
        ))}

        {/* Background roads */}
        {roads.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={colors.road} strokeWidth="3" opacity="0.6" />
        ))}

        {/* Main route trace */}
        <path
          d={routePath}
          fill="none"
          stroke="#e85d04"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Start marker */}
        <circle cx={routePath.match(/M\s*([\d.]+)/)?.[1] || 30} cy={routePath.match(/M\s*[\d.]+,([\d.]+)/)?.[1] || 150} r="5" fill="#e85d04" stroke="white" strokeWidth="2" />
      </svg>
    </div>
  )
}
