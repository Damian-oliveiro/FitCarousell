import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'individual',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validatePassword = (pw) => {
    const errors = []
    if (pw.length < 8) errors.push('at least 8 characters')
    if (!/[A-Z]/.test(pw)) errors.push('one uppercase letter')
    if (!/[a-z]/.test(pw)) errors.push('one lowercase letter')
    if (!/\d/.test(pw)) errors.push('one digit')
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.displayName.length < 2 || form.displayName.length > 50) {
      setError('Display name must be between 2 and 50 characters')
      return
    }

    const pwErrors = validatePassword(form.password)
    if (pwErrors.length > 0) {
      setError(`Password must contain: ${pwErrors.join(', ')}`)
      return
    }

    setLoading(true)
    try {
      await signUp({
        email: form.email,
        password: form.password,
        displayName: form.displayName,
        role: form.role,
      })
      navigate('/onboarding')
    } catch (err) {
      if (err.message?.includes('already registered')) {
        setError('This email is already registered')
      } else {
        setError(err.message || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">TribeFit</h1>
          <p className="auth-subtitle">Join the community</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Create Account</h2>

          {error && <div className="auth-error">{error}</div>}

          <label>
            Display Name
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder="Your name"
              minLength={2}
              maxLength={50}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@email.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min 8 chars, upper + lower + digit"
              required
            />
          </label>

          <label>
            Account Type
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="individual">Individual</option>
              <option value="merchant">Merchant</option>
            </select>
          </label>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  )
}
