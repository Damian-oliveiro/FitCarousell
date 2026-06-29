import React, { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import OfferMessage from './OfferMessage'
import './ChatThread.css'

export default function ChatThread({ messages, currentUserId, sellerId, offers, onRetry, onOfferAction }) {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!messages || messages.length === 0) {
    return (
      <div className="chat-thread">
        <div className="chat-thread__empty">
          <p>No messages yet. Send a message to start the conversation.</p>
        </div>
      </div>
    )
  }

  // Sort messages in chronological order (ascending)
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  )

  // Helper to find the associated offer for an offer-type message
  const getOfferForMessage = (message) => {
    if (!offers || !Array.isArray(offers)) return null
    return offers.find((o) =>
      message.content && message.content.includes(String(o.amount))
    ) || null
  }

  return (
    <div className="chat-thread">
      <div className="chat-thread__messages">
        {sortedMessages.map((message) => {
          if (message.message_type === 'offer') {
            const offer = getOfferForMessage(message)
            return (
              <div
                key={message.id}
                className={`chat-thread__offer-wrapper ${message.sender_id === currentUserId ? 'own' : 'other'}`}
              >
                <OfferMessage
                  message={message}
                  offer={offer}
                  currentUserId={currentUserId}
                  sellerId={sellerId}
                  onOfferAction={onOfferAction}
                />
              </div>
            )
          }

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === currentUserId}
              onRetry={onRetry}
            />
          )
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
