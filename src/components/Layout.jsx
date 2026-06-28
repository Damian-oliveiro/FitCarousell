import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import './Layout.css'

export default function Layout() {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">🏃 AnytimeFit</h1>
          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Dashboard
            </NavLink>
            <NavLink to="/activities" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Activities
            </NavLink>
            <NavLink to="/events" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Events
            </NavLink>
            <NavLink to="/marketplace" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Marketplace
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Profile
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
