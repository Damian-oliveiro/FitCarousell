import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomeFeed from './pages/HomeFeed'
import Marketplace from './pages/Marketplace'
import ListingDetail from './pages/ListingDetail'
import MarketplaceChat from './pages/MarketplaceChat'
import Record from './pages/Record'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ChatProvider } from './context/ChatContext'

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
    return <Navigate to="/" replace />
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
            <ChatProvider>
              <Layout />
            </ChatProvider>
          </DataProvider>
        </ProtectedRoute>
      }>
        <Route index element={<HomeFeed />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="marketplace/:id" element={<ListingDetail />} />
        <Route path="marketplace/chat" element={<MarketplaceChat />} />
        <Route path="marketplace/chat/:threadId" element={<MarketplaceChat />} />
        <Route path="record" element={<Record />} />
        <Route path="groups" element={<Groups />} />
        <Route path="groups/:id" element={<GroupDetail />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
