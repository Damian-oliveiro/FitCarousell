import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('App crash:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#fff', background: '#0a0a0f', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#f87171' }}>Something went wrong</h1>
          <pre style={{ marginTop: 16, color: '#a8a8b8', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message}
          </pre>
          <pre style={{ marginTop: 8, color: '#6b6b80', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
