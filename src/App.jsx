import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Activities from './pages/Activities'
import Events from './pages/Events'
import Marketplace from './pages/Marketplace'
import Profile from './pages/Profile'
import { DataProvider } from './context/DataContext'

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="activities" element={<Activities />} />
            <Route path="events" element={<Events />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  )
}
