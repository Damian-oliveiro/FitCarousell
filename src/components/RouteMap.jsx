import React from 'react'
import './RouteMap.css'

/**
 * Generates a unique procedural SVG route map for each activity.
 * Uses the seed to create different road networks and route traces.
 */

function seededRandom(seed) {
  let s = Math.abs(seed) || 1
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function generateRoadNetwork(rand, count = 6) {
  return Array.from({ length: count }, () => {
    const points = []
    let x = rand() * 100 + 30
    let y = rand() * 80 + 30
    points.push(`M ${x},${y}`)
    const segs = 2 + Math.floor(rand() * 3)
    for (let i = 0; i < segs; i++) {
      const cx = x + (rand() - 0.5) * 120
      const cy = y + (rand() - 0.5) * 100
      const ex = x + (rand() - 0.5) * 200
      const ey = y + (rand() - 0.5) * 160
      points.push(`C ${cx},${cy} ${cx + 20},${ey - 10} ${ex},${ey}`)
      x = ex
      y = ey
    }
    return points.join(' ')
  })
}

function generateRoutePath(rand) {
  const segments = 4 + Math.floor(rand() * 5)
  let x = 40 + rand() * 80
  let y = 40 + rand() * 80
  const points = [`M ${x.toFixed(1)},${y.toFixed(1)}`]

  for (let i = 0; i < segments; i++) {
    const angle = rand() * Math.PI * 2
    const dist = 40 + rand() * 80
    const nx = Math.max(20, Math.min(340, x + Math.cos(angle) * dist))
    const ny = Math.max(20, Math.min(240, y + Math.sin(angle) * dist))
    const cx1 = x + (rand() - 0.5) * 60
    const cy1 = y + (rand() - 0.5) * 60
    const cx2 = nx + (rand() - 0.5) * 60
    const cy2 = ny + (rand() - 0.5) * 60
    points.push(`C ${cx1.toFixed(1)},${cy1.toFixed(1)} ${cx2.toFixed(1)},${cy2.toFixed(1)} ${nx.toFixed(1)},${ny.toFixed(1)}`)
    x = nx
    y = ny
  }

  // Sometimes close the loop
  if (rand() > 0.4) {
    const startMatch = points[0].match(/M ([\d.]+),([\d.]+)/)
    if (startMatch) {
      const sx = parseFloat(startMatch[1])
      const sy = parseFloat(startMatch[2])
      const cx1 = x + (rand() - 0.5) * 50
      const cy1 = y + (rand() - 0.5) * 50
      points.push(`C ${cx1.toFixed(1)},${cy1.toFixed(1)} ${(sx + 20).toFixed(1)},${(sy - 20).toFixed(1)} ${sx.toFixed(1)},${sy.toFixed(1)}`)
    }
  }

  return { path: points.join(' '), startX: parseFloat(points[0].match(/M ([\d.]+)/)?.[1] || 60), startY: parseFloat(points[0].match(/,([\d.]+)/)?.[1] || 120) }
}

const BG_PALETTES = [
  { bg: '#dce8cd', water: '#a3cfe0', roads: '#ede5d5' },
  { bg: '#d5e4c0', water: '#8ec5d6', roads: '#e6dcc8' },
  { bg: '#e2efd4', water: '#b5dcea', roads: '#f2eade' },
  { bg: '#cde0b8', water: '#7fbdce', roads: '#ddd4c0' },
  { bg: '#d8e9c5', water: '#94c8db', roads: '#e8dfcf' },
]

export default function RouteMap({ seed = 0, height = 180, className = '' }) {
  const rand = seededRandom(seed * 7 + 13)
  const palette = BG_PALETTES[Math.floor(rand() * BG_PALETTES.length)]
  const roads = generateRoadNetwork(rand, 5 + Math.floor(rand() * 4))
  const { path: routePath, startX, startY } = generateRoutePath(rand)

  // Water bodies
  const waterCount = 1 + Math.floor(rand() * 2)
  const waters = Array.from({ length: waterCount }, () => ({
    cx: 40 + rand() * 280,
    cy: 30 + rand() * 200,
    rx: 15 + rand() * 35,
    ry: 12 + rand() * 25,
    rotation: rand() * 40 - 20,
  }))

  // Parks/green areas
  const parkCount = Math.floor(rand() * 3)
  const parks = Array.from({ length: parkCount }, () => ({
    cx: 30 + rand() * 300,
    cy: 20 + rand() * 220,
    r: 20 + rand() * 30,
  }))

  return (
    <div className={`route-map ${className}`} style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 360 260" preserveAspectRatio="xMidYMid slice">
        <rect width="360" height="260" fill={palette.bg} />

        {/* Parks */}
        {parks.map((p, i) => (
          <circle key={`park-${i}`} cx={p.cx} cy={p.cy} r={p.r} fill={palette.bg} opacity="0.6" stroke="#b8d4a0" strokeWidth="0.5" />
        ))}

        {/* Water */}
        {waters.map((w, i) => (
          <ellipse key={`water-${i}`} cx={w.cx} cy={w.cy} rx={w.rx} ry={w.ry} fill={palette.water} opacity="0.65" transform={`rotate(${w.rotation} ${w.cx} ${w.cy})`} />
        ))}

        {/* Road network */}
        {roads.map((d, i) => (
          <path key={`road-${i}`} d={d} fill="none" stroke={palette.roads} strokeWidth={i < 2 ? 4 : 2.5} strokeLinecap="round" opacity="0.7" />
        ))}

        {/* Route trace */}
        <path
          d={routePath}
          fill="none"
          stroke="#e85d04"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="none"
        />

        {/* Start/end marker */}
        <circle cx={startX} cy={startY} r="5" fill="#e85d04" stroke="white" strokeWidth="2.5" />
      </svg>
    </div>
  )
}
