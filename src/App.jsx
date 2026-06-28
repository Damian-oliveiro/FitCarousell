import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Activities from './pages/Activities'
import Community from './pages/Community'
import Events from './pages/Events'
import Marketplace from './pages/Marketplace'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AuthRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/activities" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <DataProvider>
            <Layout />
          </DataProvider>
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/activities" replace />} />
        <Route path="activities" element={<Activities />} />
        <Route path="community" element={<Community />} />
        <Route path="events" element={<Events />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/activities" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
