import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const ChatContext = createContext()

export function ChatProvider({ children }) {
  const { user } = useAuth()
  const [threads, setThreads] = useState([])
  const [messages, setMessages] = useState({}) // { [threadId]: Message[] }
  const [unreadCounts, setUnreadCounts] = useState({}) // { [threadId]: number }
  const channelRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const reconnectAttemptRef = useRef(0)
  const lastReceivedAtRef = useRef(null)

  // Fetch user's chat threads on mount
  useEffect(() => {
    if (!user) {
      setThreads([])
      setMessages({})
      setUnreadCounts({})
      return
    }

    fetchThreads()
    subscribeToMessages()

    return () => {
      unsubscribeFromMessages()
      clearReconnectTimer()
    }
  }, [user])

  async function fetchThreads() {
    const { data, error } = await supabase
      .from('chat_threads')
      .select(`
        *,
        buyer:profiles!chat_threads_buyer_id_fkey(display_name),
        seller:profiles!chat_threads_seller_id_fkey(display_name),
        listing:listings!chat_threads_listing_id_fkey(title)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching chat threads:', error)
      return
    }

    // Enrich threads with display names and listing title
    const enrichedThreads = (data || []).map((thread) => ({
      ...thread,
      buyerName: thread.buyer?.display_name || 'Buyer',
      sellerName: thread.seller?.display_name || 'Seller',
      listingTitle: thread.listing?.title || '',
    }))

    setThreads(enrichedThreads)

    // Fetch unread counts for each thread
    if (enrichedThreads.length > 0) {
      await fetchUnreadCounts(enrichedThreads)
    }
  }

  async function fetchUnreadCounts(threadList) {
    const counts = {}
    for (const thread of threadList) {
      const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', thread.id)
        .neq('sender_id', user.id)
        .eq('read', false)

      if (!error) {
        counts[thread.id] = count || 0
      }
    }
    setUnreadCounts(counts)
  }

  function subscribeToMessages() {
    if (channelRef.current) return

    const channel = supabase
      .channel('chat_messages_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          handleNewMessage(payload.new)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          reconnectAttemptRef.current = 0
          clearReconnectTimer()
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          handleDisconnect()
        }
      })

    channelRef.current = channel
  }

  function unsubscribeFromMessages() {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }

  function clearReconnectTimer() {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }

  function handleDisconnect() {
    unsubscribeFromMessages()
    scheduleReconnect()
  }

  function scheduleReconnect() {
    clearReconnectTimer()
    const attempt = reconnectAttemptRef.current
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000)
    reconnectAttemptRef.current = attempt + 1

    reconnectTimerRef.current = setTimeout(() => {
      subscribeToMessages()
      // After reconnecting, fetch any missed messages
      fetchMissedMessages()
    }, delay)
  }

  async function fetchMissedMessages() {
    if (!lastReceivedAtRef.current) return

    // Fetch messages across all user threads since last received
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .gt('created_at', lastReceivedAtRef.current)
      .order('created_at', { ascending: true })

    if (!error && data) {
      for (const msg of data) {
        handleNewMessage(msg)
      }
    }
  }

  function handleNewMessage(message) {
    lastReceivedAtRef.current = message.created_at

    // Check if this message belongs to one of the user's threads
    const threadExists = threads.some((t) => t.id === message.thread_id)

    // Update messages state
    setMessages((prev) => {
      const threadMessages = prev[message.thread_id] || []
      // Avoid duplicates
      if (threadMessages.some((m) => m.id === message.id)) return prev
      return {
        ...prev,
        [message.thread_id]: [...threadMessages, message],
      }
    })

    // Update unread count if message is from someone else
    if (message.sender_id !== user.id) {
      setUnreadCounts((prev) => ({
        ...prev,
        [message.thread_id]: (prev[message.thread_id] || 0) + 1,
      }))
    }

    // If thread wasn't in our list, refresh threads
    if (!threadExists) {
      fetchThreads()
    }
  }

  const openOrCreateThread = useCallback(
    async (listingId, sellerId) => {
      if (!user) return null

      // Check if thread already exists for this listing + buyer
      const { data: existing, error: fetchError } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('listing_id', listingId)
        .eq('buyer_id', user.id)
        .maybeSingle()

      if (fetchError) {
        console.error('Error checking existing thread:', fetchError)
        return null
      }

      if (existing) return existing

      // Create new thread
      const { data: newThread, error: insertError } = await supabase
        .from('chat_threads')
        .insert({
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: sellerId,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating chat thread:', insertError)
        return null
      }

      // Add to local state
      setThreads((prev) => [newThread, ...prev])
      setUnreadCounts((prev) => ({ ...prev, [newThread.id]: 0 }))

      return newThread
    },
    [user]
  )

  const sendMessage = useCallback(
    async (threadId, content) => {
      if (!user) return null

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          content,
          message_type: 'text',
        })
        .select()
        .single()

      if (error) {
        console.error('Error sending message:', error)
        throw error
      }

      // Update thread's updated_at locally
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, updated_at: new Date().toISOString() } : t
        )
      )

      return data
    },
    [user]
  )

  const subscribeToThread = useCallback(
    async (threadId) => {
      // Fetch existing messages for this thread with sender names
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey(display_name)
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching thread messages:', error)
        return
      }

      const enrichedMessages = (data || []).map((m) => ({
        ...m,
        senderName: m.sender?.display_name || 'Unknown',
      }))

      setMessages((prev) => ({
        ...prev,
        [threadId]: enrichedMessages,
      }))

      // Update lastReceivedAt if messages exist
      if (data && data.length > 0) {
        const latest = data[data.length - 1].created_at
        if (!lastReceivedAtRef.current || latest > lastReceivedAtRef.current) {
          lastReceivedAtRef.current = latest
        }
      }
    },
    []
  )

  const markAsRead = useCallback(
    async (threadId) => {
      if (!user) return

      const { error } = await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('thread_id', threadId)
        .neq('sender_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Error marking messages as read:', error)
        return
      }

      // Update local unread count
      setUnreadCounts((prev) => ({
        ...prev,
        [threadId]: 0,
      }))

      // Update local messages state
      setMessages((prev) => {
        const threadMessages = prev[threadId]
        if (!threadMessages) return prev
        return {
          ...prev,
          [threadId]: threadMessages.map((msg) =>
            msg.sender_id !== user.id ? { ...msg, read: true } : msg
          ),
        }
      })
    },
    [user]
  )

  // Compute total unread count across all threads
  const totalUnreadCount = Object.values(unreadCounts).reduce(
    (sum, count) => sum + count,
    0
  )

  const value = {
    threads,
    messages,
    unreadCounts,
    totalUnreadCount,
    sendMessage,
    openOrCreateThread,
    subscribeToThread,
    markAsRead,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) throw new Error('useChat must be used within ChatProvider')
  return context
}
