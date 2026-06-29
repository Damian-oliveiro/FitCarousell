import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import ChatThreadList from '../components/ChatThreadList'
import ChatThread from '../components/ChatThread'
import ChatInput from '../components/ChatInput'
import './MarketplaceChat.css'

export default function MarketplaceChat() {
  const { threadId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    threads,
    messages,
    unreadCounts,
    sendMessage,
    markAsRead,
    subscribeToThread
  } = useChat()

  const [offers, setOffers] = useState([])

  // If a threadId is provided, subscribe to that thread and mark as read
  useEffect(() => {
    if (threadId && subscribeToThread) {
      subscribeToThread(threadId)
    }
  }, [threadId, subscribeToThread])

  useEffect(() => {
    if (threadId && markAsRead) {
      markAsRead(threadId)
    }
  }, [threadId, markAsRead])

  // Fetch offers for the current thread's listing
  useEffect(() => {
    async function fetchOffers() {
      if (!threadId) return
      const currentThread = threads.find((t) => t.id === threadId)
      if (!currentThread?.listing_id) return

      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('listing_id', currentThread.listing_id)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setOffers(data)
      }
    }

    fetchOffers()
  }, [threadId, threads])

  // Get messages for current thread
  const threadMessages = threadId ? (messages[threadId] || []) : []

  // Find current thread info
  const currentThread = threads.find((t) => t.id === threadId)

  const handleSend = async (content) => {
    if (!threadId || !sendMessage) return
    await sendMessage(threadId, content)
  }

  const handleRetry = async (message) => {
    if (!threadId || !sendMessage) return
    await sendMessage(threadId, message.content)
  }

  const handleOfferAction = (action, offerId) => {
    // Update local offer state after accept/decline
    setOffers((prev) =>
      prev.map((o) => {
        if (o.id === offerId) {
          return { ...o, status: action }
        }
        // If an offer was accepted, decline all other pending offers
        if (action === 'accepted' && o.status === 'pending' && o.id !== offerId) {
          return { ...o, status: 'declined' }
        }
        return o
      })
    )
  }

  // If no threadId, show thread list
  if (!threadId) {
    return (
      <div className="marketplace-chat marketplace-chat--list">
        <div className="marketplace-chat__header">
          <button
            className="marketplace-chat__back-btn"
            onClick={() => navigate('/marketplace')}
            aria-label="Back to Marketplace"
          >
            ←
          </button>
          <div>
            <div className="marketplace-chat__title">Messages</div>
            <div className="marketplace-chat__subtitle">Your conversations</div>
          </div>
        </div>
        <div className="marketplace-chat__body">
          <ChatThreadList
            threads={threads}
            unreadCounts={unreadCounts}
            currentUserId={user?.id}
          />
        </div>
      </div>
    )
  }

  // Thread view
  const otherPartyName = currentThread
    ? currentThread.buyer_id === user?.id
      ? currentThread.sellerName || 'Seller'
      : currentThread.buyerName || 'Buyer'
    : 'Chat'

  return (
    <div className="marketplace-chat marketplace-chat--thread">
      <div className="marketplace-chat__header">
        <button
          className="marketplace-chat__back-btn"
          onClick={() => navigate('/marketplace/chat')}
          aria-label="Back to chat list"
        >
          ←
        </button>
        <div>
          <div className="marketplace-chat__title">{otherPartyName}</div>
          {currentThread?.listingTitle && (
            <div className="marketplace-chat__subtitle">
              Re: {currentThread.listingTitle}
            </div>
          )}
        </div>
      </div>
      <div className="marketplace-chat__body">
        <ChatThread
          messages={threadMessages}
          currentUserId={user?.id}
          sellerId={currentThread?.seller_id}
          offers={offers}
          onRetry={handleRetry}
          onOfferAction={handleOfferAction}
        />
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  )
}
