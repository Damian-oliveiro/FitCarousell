import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { submitRating as submitRatingUtil } from '../utils/ratingUtils'

const DataContext = createContext()

export function DataProvider({ children }) {
  const { user, profile } = useAuth()
  const [activities, setActivities] = useState([])
  const [events, setEvents] = useState([])
  const [listings, setListings] = useState([])
  const [feedPosts, setFeedPosts] = useState([])
  const [joinedEvents, setJoinedEvents] = useState([])
  const [following, setFollowing] = useState([])
  const [followers, setFollowers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const showError = (msg) => {
    setError(msg)
    setTimeout(() => setError(null), 5000)
  }

  // Fetch activities for current user
  const fetchActivities = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) { showError('Failed to load activities'); return }
    setActivities(data || [])
  }, [user])

  // Fetch events
  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*, profiles(display_name, role)')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) { showError('Failed to load events'); return }
    setEvents(data || [])
  }, [])

  // Fetch marketplace listings
  const fetchListings = useCallback(async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*, profiles(display_name, role)')
      .order('created_at', { ascending: false })

    if (error) { showError('Failed to load listings'); return }
    setListings(data || [])
  }, [])

  // Fetch community feed posts
  const fetchFeedPosts = useCallback(async (offset = 0, limit = 20) => {
    if (!user) return []
    const { data, error } = await supabase
      .from('feed_posts')
      .select('*, profiles(display_name, avatar_url, role), activities(*)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) { showError('Failed to load feed'); return [] }
    if (offset === 0) {
      setFeedPosts(data || [])
    } else {
      setFeedPosts(prev => [...prev, ...(data || [])])
    }
    return data || []
  }, [user])

  // Fetch joined events
  const fetchJoinedEvents = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('event_participants')
      .select('event_id')
      .eq('user_id', user.id)

    if (!error && data) {
      setJoinedEvents(data.map(d => d.event_id))
    }
  }, [user])

  // Fetch following/followers
  const fetchFollowing = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    setFollowing(data?.map(d => d.following_id) || [])
  }, [user])

  const fetchFollowers = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', user.id)

    setFollowers(data?.map(d => d.follower_id) || [])
  }, [user])

  useEffect(() => {
    if (user) {
      setLoading(true)
      Promise.all([
        fetchActivities(),
        fetchEvents(),
        fetchListings(),
        fetchJoinedEvents(),
        fetchFollowing(),
        fetchFollowers(),
      ]).finally(() => setLoading(false))
    }
  }, [user, fetchActivities, fetchEvents, fetchListings, fetchJoinedEvents, fetchFollowing, fetchFollowers])

  // Add activity
  async function addActivity(activity) {
    if (!user) return
    const newActivity = {
      ...activity,
      user_id: user.id,
      pace: activity.duration / activity.distance,
    }
    const { data, error } = await supabase
      .from('activities')
      .insert(newActivity)
      .select()
      .single()

    if (error) { showError('Failed to save activity'); return null }
    setActivities(prev => [data, ...prev])
    return data
  }

  // Share activity to feed
  async function shareToFeed(activityId, caption = '') {
    if (!user) return
    const { data, error } = await supabase
      .from('feed_posts')
      .insert({
        user_id: user.id,
        activity_id: activityId,
        caption,
        likes_count: 0,
        comments_count: 0,
      })
      .select('*, profiles(display_name, avatar_url, role), activities(*)')
      .single()

    if (error) { showError('Failed to share activity'); return }
    setFeedPosts(prev => [data, ...prev])
  }

  // Like a post
  async function likePost(postId) {
    if (!user) return
    const { error } = await supabase.from('likes').insert({
      user_id: user.id,
      post_id: postId
    })

    if (error) {
      if (error.code === '23505') return // already liked
      showError('Failed to like post')
      return
    }

    await supabase.from('feed_posts').update({
      likes_count: supabase.rpc ? undefined : undefined
    }).eq('id', postId)

    setFeedPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1, user_liked: true } : p
    ))
  }

  // Unlike a post
  async function unlikePost(postId) {
    if (!user) return
    const { error } = await supabase.from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId)

    if (error) { showError('Failed to unlike post'); return }
    setFeedPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes_count: Math.max(0, (p.likes_count || 0) - 1), user_liked: false } : p
    ))
  }

  // Add comment
  async function addComment(postId, content) {
    if (!user) return
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: user.id, content })
      .select('*, profiles(display_name, avatar_url)')
      .single()

    if (error) { showError('Failed to add comment'); return null }
    setFeedPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
    ))
    return data
  }

  // Fetch comments for a post
  async function fetchComments(postId, offset = 0, limit = 10) {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(display_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) { showError('Failed to load comments'); return [] }
    return data || []
  }

  // Join event
  async function joinEvent(eventId) {
    if (!user || joinedEvents.includes(eventId)) return
    const { error } = await supabase
      .from('event_participants')
      .insert({ event_id: eventId, user_id: user.id })

    if (error) { showError('Failed to join event'); return }
    setJoinedEvents(prev => [...prev, eventId])
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, participant_count: (e.participant_count || 0) + 1 } : e
    ))
  }

  // Create event (merchant only)
  async function createEvent(eventData) {
    if (!user || profile?.role !== 'merchant') return
    const { data, error } = await supabase
      .from('events')
      .insert({ ...eventData, merchant_id: user.id, participant_count: 0 })
      .select('*, profiles(display_name, role)')
      .single()

    if (error) { showError('Failed to create event'); return null }
    setEvents(prev => [...prev, data].sort((a, b) => new Date(a.date) - new Date(b.date)))
    return data
  }

  // Create listing (merchant only)
  async function createListing(listingData) {
    if (!user || profile?.role !== 'merchant') return
    const { data, error } = await supabase
      .from('listings')
      .insert({ ...listingData, seller_id: user.id })
      .select('*, profiles(display_name, role)')
      .single()

    if (error) { showError('Failed to create listing'); return null }
    setListings(prev => [data, ...prev])
    return data
  }

  // Fetch groups (up to 50 ordered by member_count desc)
  async function fetchGroups() {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('member_count', { ascending: false })
      .limit(50)

    if (error) { showError('Failed to load groups'); return [] }
    return data || []
  }

  // Fetch group detail by ID
  async function fetchGroupDetail(groupId) {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single()

    if (error) { showError('Failed to load group'); return null }
    return data
  }

  // Join a group
  async function joinGroup(groupId) {
    if (!user) return { success: false, message: 'Not authenticated' }

    const { error } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, user_id: user.id })

    if (error) {
      if (error.code === '23505') {
        return { success: false, message: 'Already a member' }
      }
      showError('Failed to join group')
      return { success: false, message: 'Failed to join group' }
    }

    return { success: true }
  }

  // Leave a group
  async function leaveGroup(groupId) {
    if (!user) return { success: false, message: 'Not authenticated' }

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user.id)

    if (error) {
      showError('Failed to leave group')
      return { success: false, message: 'Failed to leave group' }
    }

    return { success: true }
  }

  // Create group event (merchant or group creator only)
  async function createGroupEvent(groupId, { title, description, date, time, location }) {
    if (!user) return null
    if (profile?.role !== 'merchant') {
      showError('Only merchants can create group events')
      return null
    }

    const { data, error } = await supabase
      .from('group_events')
      .insert({
        group_id: groupId,
        merchant_id: user.id,
        title,
        description: description || null,
        date,
        time: time || null,
        location: location || null,
      })
      .select()
      .single()

    if (error) { showError('Failed to create group event'); return null }
    return data
  }

  // Create challenge (merchant or group admin only)
  async function createChallenge(groupId, { title, goal, startDate, endDate }) {
    if (!user) return null
    if (profile?.role !== 'merchant') {
      showError('Only merchants can create challenges')
      return null
    }

    const { data, error } = await supabase
      .from('challenges')
      .insert({
        group_id: groupId,
        created_by: user.id,
        title,
        goal,
        start_date: startDate,
        end_date: endDate,
      })
      .select()
      .single()

    if (error) { showError('Failed to create challenge'); return null }
    return data
  }

  // Follow user
  async function followUser(userId) {
    if (!user || userId === user.id) return
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, following_id: userId })

    if (error) { showError('Failed to follow user'); return }
    setFollowing(prev => [...prev, userId])
  }

  // Unfollow user
  async function unfollowUser(userId) {
    if (!user) return
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId)

    if (error) { showError('Failed to unfollow user'); return }
    setFollowing(prev => prev.filter(id => id !== userId))
  }

  // Submit seller rating
  async function submitRating({ listingId, sellerId, score, review }) {
    if (!user) return null
    const { data, error: ratingError } = await submitRatingUtil(supabase, {
      listingId,
      buyerId: user.id,
      sellerId,
      score,
      review,
    })

    if (ratingError) {
      showError(ratingError)
      return null
    }
    return data
  }

  // Fetch seller average rating
  async function fetchSellerRating(sellerId) {
    const { data, error: fetchError } = await supabase
      .from('seller_ratings')
      .select('score')
      .eq('seller_id', sellerId)

    if (fetchError) return { average: 0, count: 0 }

    if (!data || data.length === 0) return { average: 0, count: 0 }

    const sum = data.reduce((acc, r) => acc + r.score, 0)
    const average = Math.round((sum / data.length) * 10) / 10
    return { average, count: data.length }
  }

  const value = {
    activities,
    events,
    listings,
    feedPosts,
    joinedEvents,
    following,
    followers,
    loading,
    error,
    addActivity,
    shareToFeed,
    likePost,
    unlikePost,
    addComment,
    fetchComments,
    fetchFeedPosts,
    joinEvent,
    createEvent,
    createListing,
    followUser,
    unfollowUser,
    fetchActivities,
    fetchEvents,
    fetchListings,
    fetchGroups,
    fetchGroupDetail,
    joinGroup,
    leaveGroup,
    createGroupEvent,
    createChallenge,
    submitRating,
    fetchSellerRating,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within DataProvider')
  return context
}
