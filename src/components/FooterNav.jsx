import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { IconHome, IconMarket, IconScan, IconRecord, IconGroups, IconUser } from './Icons'
import './FooterNav.css'

const tabs = [
  { path: '/', label: 'Home', Icon: IconHome },
  { path: '/marketplace', label: 'Market', Icon: IconMarket },
  { path: '/scan', label: 'Scan', Icon: IconScan },
  { path: '/record', label: 'Record', Icon: IconRecord },
  { path: '/groups', label: 'Groups', Icon: IconGroups },
  { path: '/profile', label: 'You', Icon: IconUser },
]

/**
 * Determines if a tab should be marked active based on the current location.
 * For the Home tab ("/"), only exact match is active.
 * For other tabs, any sub-route under the path is considered active.
 */
function isTabActive(tabPath, currentPath) {
  if (tabPath === '/') {
    return currentPath === '/'
  }
  return currentPath === tabPath || currentPath.startsWith(tabPath + '/')
}

export default function FooterNav() {
  const location = useLocation()

  return (
    <nav className="footer-nav" aria-label="Main navigation">
      {tabs.map(tab => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={() =>
            `footer-nav-tab ${isTabActive(tab.path, location.pathname) ? 'active' : ''}`
          }
          end={tab.path === '/'}
        >
          <span className="footer-nav-icon">
            <tab.Icon size={22} />
          </span>
          <span className="footer-nav-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

// Export for testing
export { tabs, isTabActive }
