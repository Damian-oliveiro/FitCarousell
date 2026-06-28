import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import './Layout.css'

const navItems = [
  { path: '/activities', label: 'Activities', icon: '🏃' },
  { path: '/community', label: 'Community', icon: '👥' },
  { path: '/events', label: 'Events', icon: '🎉' },
  { path: '/marketplace', label: 'Market', icon: '🛍️' },
  { path: '/profile', label: 'Profile', icon: '👤' },
]

export default function Layout() {
  const { error } = useData()

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">🏃 FitCarousell</h1>
          <nav className="nav-desktop" aria-label="Main navigation">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {error && (
        <div className="error-toast" role="alert">
          <span>{error}</span>
        </div>
      )}

      <main className="main">
        <Outlet />
      </main>

      <nav className="nav-mobile" aria-label="Main navigation">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          >
            <span className="tab-icon">{item.icon}</span>
            <span className="tab-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
