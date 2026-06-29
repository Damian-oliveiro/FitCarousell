import React from 'react'
import './MessageBubble.css'

export default function MessageBubble({ message, isOwn, onRetry }) {
  const bubbleClass = `message-bubble ${isOwn ? 'own' : 'other'}`

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={bubbleClass}>
      {!isOwn && (
        <span className="message-bubble__sender">
          {message.senderName || 'Unknown'}
        </span>
      )}
      <div className="message-bubble__content">
        {message.content}
      </div>
      <span className="message-bubble__timestamp">
        {formatTimestamp(message.created_at)}
      </span>
      {message.error && (
        <div className="message-bubble__error">
          <span className="message-bubble__error-icon">!</span>
          <span>Failed to send</span>
          <button
            className="message-bubble__retry-btn"
            onClick={() => onRetry && onRetry(message)}
            aria-label="Retry sending message"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
