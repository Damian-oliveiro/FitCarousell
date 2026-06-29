import React from 'react'
import { Outlet } from 'react-router-dom'
import FooterNav from './FooterNav'
import './Layout.css'

export default function Layout() {
  return (
    <div className="layout">
      <main className="main">
        <Outlet />
      </main>
      <FooterNav />
    </div>
  )
}
