import React from 'react'
import { useNavigate } from 'react-router-dom'
import './ChatThreadList.css'

export default function ChatThreadList({ threads, unreadCounts, currentUserId }) {
  const navigate = useNavigate()

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    if (diffHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const getOtherPartyName = (thread) => {
    if (thread.buyer_id === currentUserId) {
      return thread.sellerName || 'Seller'
    }
    return thread.buyerName || 'Buyer'
  }

  if (!threads || threads.length === 0) {
    return (
      <div className="chat-thread-list">
        <div className="chat-thread-list__empty">
          <p>No conversations yet.</p>
          <p>Start chatting with a seller from a listing page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-thread-list">
      {threads.map((thread) => {
        const unread = unreadCounts[thread.id] || 0
        return (
          <button
            key={thread.id}
            className={`chat-thread-list__item ${unread > 0 ? 'unread' : ''}`}
            onClick={() => navigate(`/marketplace/chat/${thread.id}`)}
            aria-label={`Chat with ${getOtherPartyName(thread)}${unread > 0 ? `, ${unread} unread messages` : ''}`}
          >
            <div className="chat-thread-list__avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div className="chat-thread-list__info">
              <div className="chat-thread-list__header">
                <span className="chat-thread-list__name">
                  {getOtherPartyName(thread)}
                </span>
                <span className="chat-thread-list__time">
                  {formatTimestamp(thread.updated_at)}
                </span>
              </div>
              <div className="chat-thread-list__preview">
                {thread.lastMessage
                  ? thread.lastMessage.length > 50
                    ? thread.lastMessage.substring(0, 50) + '...'
                    : thread.lastMessage
                  : 'No messages yet'}
              </div>
            </div>
            {unread > 0 && (
              <span className="chat-thread-list__badge" aria-label={`${unread} unread`}>
                {unread}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
