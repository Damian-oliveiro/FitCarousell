import React, { useState } from 'react'
import './ChatInput.css'

const MAX_MESSAGE_LENGTH = 1000

export function validateMessage(content) {
  if (!content || content.trim().length === 0) {
    return 'Message cannot be empty'
  }
  if (content.length > MAX_MESSAGE_LENGTH) {
    return 'Message exceeds 1000 characters'
  }
  return null
}

export default function ChatInput({ onSend, disabled }) {
  const [content, setContent] = useState('')
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateMessage(content)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setSending(true)

    try {
      await onSend(content.trim())
      setContent('')
    } catch (err) {
      setError('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleChange = (e) => {
    setContent(e.target.value)
    if (error) {
      setError(null)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const charCount = content.length
  const charCountClass =
    charCount > MAX_MESSAGE_LENGTH
      ? 'error'
      : charCount > 900
        ? 'warning'
        : ''

  return (
    <div className="chat-input">
      <form className="chat-input__form" onSubmit={handleSubmit}>
        <textarea
          className="chat-input__textarea"
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled || sending}
          rows={1}
          aria-label="Message input"
        />
        <button
          type="submit"
          className="chat-input__send-btn"
          disabled={disabled || sending || content.trim().length === 0}
          aria-label="Send message"
        >
          ➤
        </button>
      </form>
      {error && <div className="chat-input__error" role="alert">{error}</div>}
      {charCount > 0 && (
        <div className={`chat-input__char-count ${charCountClass}`}>
          {charCount}/{MAX_MESSAGE_LENGTH}
        </div>
      )}
    </div>
  )
}
