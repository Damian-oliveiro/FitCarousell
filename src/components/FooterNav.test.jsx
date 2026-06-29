import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FooterNav, { tabs, isTabActive } from './FooterNav'

function renderWithRouter(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <FooterNav />
    </MemoryRouter>
  )
}

describe('FooterNav', () => {
  it('renders 5 navigation tabs', () => {
    renderWithRouter()
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(5)
  })

  it('renders tabs in correct order: Home, Market, Record, Groups, You', () => {
    renderWithRouter()
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveTextContent('Home')
    expect(links[1]).toHaveTextContent('Market')
    expect(links[2]).toHaveTextContent('Record')
    expect(links[3]).toHaveTextContent('Groups')
    expect(links[4]).toHaveTextContent('You')
  })

  it('renders icons for each tab', () => {
    renderWithRouter()
    // SVG icons are rendered — verify by checking SVG elements exist within links
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link.querySelector('svg')).not.toBeNull()
    })
  })

  it('marks Home tab as active on "/" route', () => {
    renderWithRouter('/')
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveClass('active')
    expect(links[1]).not.toHaveClass('active')
  })

  it('marks Market tab as active on "/marketplace" route', () => {
    renderWithRouter('/marketplace')
    const links = screen.getAllByRole('link')
    expect(links[1]).toHaveClass('active')
    expect(links[0]).not.toHaveClass('active')
  })

  it('marks Market tab as active on marketplace sub-route "/marketplace/chat/123"', () => {
    renderWithRouter('/marketplace/chat/123')
    const links = screen.getAllByRole('link')
    expect(links[1]).toHaveClass('active')
    expect(links[0]).not.toHaveClass('active')
  })

  it('marks Groups tab as active on groups sub-route "/groups/abc"', () => {
    renderWithRouter('/groups/abc')
    const links = screen.getAllByRole('link')
    expect(links[3]).toHaveClass('active')
    expect(links[0]).not.toHaveClass('active')
  })

  it('does not mark Home tab as active on other routes', () => {
    renderWithRouter('/marketplace')
    const links = screen.getAllByRole('link')
    expect(links[0]).not.toHaveClass('active')
  })

  it('has aria-label for accessibility', () => {
    renderWithRouter()
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })
})

describe('isTabActive', () => {
  it('returns true for exact match on Home tab', () => {
    expect(isTabActive('/', '/')).toBe(true)
  })

  it('returns false for Home tab when on other routes', () => {
    expect(isTabActive('/', '/marketplace')).toBe(false)
    expect(isTabActive('/', '/groups')).toBe(false)
  })

  it('returns true for marketplace sub-routes', () => {
    expect(isTabActive('/marketplace', '/marketplace')).toBe(true)
    expect(isTabActive('/marketplace', '/marketplace/123')).toBe(true)
    expect(isTabActive('/marketplace', '/marketplace/chat/456')).toBe(true)
  })

  it('returns true for groups sub-routes', () => {
    expect(isTabActive('/groups', '/groups')).toBe(true)
    expect(isTabActive('/groups', '/groups/abc-123')).toBe(true)
  })

  it('returns false when path does not match', () => {
    expect(isTabActive('/marketplace', '/groups')).toBe(false)
    expect(isTabActive('/groups', '/profile')).toBe(false)
    expect(isTabActive('/record', '/marketplace')).toBe(false)
  })
})
