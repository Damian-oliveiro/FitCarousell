import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { supabase } from '../lib/supabase'
import GroupEvents from '../components/GroupEvents'
import GroupChallenges from '../components/GroupChallenges'
import './GroupDetail.css'

export default function GroupDetail() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const { createGroupEvent, createChallenge } = useData()

  const [group, setGroup] = useState(null)
  const [isMember, setIsMember] = useState(false)
  const [events, setEvents] = useState([])
  const [challenges, setChallenges] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [showChallengeForm, setShowChallengeForm] = useState(false)

  // Merchants or the group creator can create events/challenges
  const canCreateContent = profile?.role === 'merchant' || (group && user && group.created_by === user.id)

  const fetchGroupDetail = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    // Fetch group info
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .single()

    if (groupError) {
      setError('Failed to load group')
      setLoading(false)
      return
    }

    setGroup(groupData)

    // Check membership
    if (user) {
      const { data: memberData } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', id)
        .eq('user_id', user.id)
        .single()

      setIsMember(!!memberData)

      // If member, fetch group content
      if (memberData) {
        await fetchGroupContent()
      }
    }

    setLoading(false)
  }, [id, user])

  async function fetchGroupContent() {
    // Fetch group events
    const { data: eventsData } = await supabase
      .from('group_events')
      .select('*')
      .eq('group_id', id)
      .order('date', { ascending: true })

    setEvents(eventsData || [])

    // Fetch challenges
    const { data: challengesData } = await supabase
      .from('challenges')
      .select('*')
      .eq('group_id', id)
      .order('start_date', { ascending: true })

    setChallenges(challengesData || [])

    // Fetch member activity posts (feed_posts from group members)
    const { data: membersData } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', id)

    if (membersData && membersData.length > 0) {
      const memberIds = membersData.map(m => m.user_id)
      const { data: postsData } = await supabase
        .from('feed_posts')
        .select('*, profiles(display_name, avatar_url)')
        .in('user_id', memberIds)
        .order('created_at', { ascending: false })
        .limit(20)

      setPosts(postsData || [])
    }
  }

  useEffect(() => {
    fetchGroupDetail()
  }, [fetchGroupDetail])

  async function handleJoin() {
    if (!user || !group) return

    setActionLoading(true)

    const { error: joinError } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: user.id })

    if (joinError) {
      if (joinError.code === '23505') {
        // Already a member
        setIsMember(true)
      }
      setActionLoading(false)
      return
    }

    setIsMember(true)
    setGroup(prev => prev ? { ...prev, member_count: (prev.member_count || 0) + 1 } : prev)
    // Fetch content now that user is a member
    await fetchGroupContent()
    setActionLoading(false)
  }

  async function handleLeave() {
    if (!user || !group) return

    setActionLoading(true)

    const { error: leaveError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', group.id)
      .eq('user_id', user.id)

    if (leaveError) {
      setActionLoading(false)
      return
    }

    setIsMember(false)
    setGroup(prev => prev ? { ...prev, member_count: Math.max(0, (prev.member_count || 0) - 1) } : prev)
    setEvents([])
    setChallenges([])
    setPosts([])
    setActionLoading(false)
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  function formatTime(timeStr) {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayHour = h % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  function formatRelativeTime(timestamp) {
    if (!timestamp) return ''
    const now = new Date()
    const date = new Date(timestamp)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(timestamp)
  }

  async function handleCreateEvent(groupId, eventData) {
    const result = await createGroupEvent(groupId, eventData)
    if (result) {
      setEvents(prev => [...prev, result].sort((a, b) => new Date(a.date) - new Date(b.date)))
      setShowEventForm(false)
    }
    return result
  }

  async function handleCreateChallenge(groupId, challengeData) {
    const result = await createChallenge(groupId, challengeData)
    if (result) {
      setChallenges(prev => [...prev, result].sort((a, b) => new Date(a.start_date) - new Date(b.start_date)))
      setShowChallengeForm(false)
    }
    return result
  }

  if (loading) {
    return (
      <div className="group-detail">
        <div className="group-detail-loading">
          <div className="loading-spinner" />
          <p>Loading group...</p>
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="group-detail">
        <Link to="/groups" className="group-back-link">← Back to Groups</Link>
        <div className="group-detail-error">
          <p>{error || 'Group not found'}</p>
          <button className="btn-primary" onClick={fetchGroupDetail}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group-detail">
      <Link to="/groups" className="group-back-link">← Back to Groups</Link>

      {/* Group Header */}
      <div className="group-detail-header">
        <h2>{group.name}</h2>
        {group.description && <p>{group.description}</p>}
        <div className="group-detail-meta">
          <span className="group-member-count">
            {group.member_count || 0} {group.member_count === 1 ? 'member' : 'members'}
          </span>
          {isMember ? (
            <button
              className="btn-leave"
              onClick={handleLeave}
              disabled={actionLoading}
            >
              {actionLoading ? 'Leaving...' : 'Leave Group'}
            </button>
          ) : (
            <button
              className="btn-join"
              onClick={handleJoin}
              disabled={actionLoading}
            >
              {actionLoading ? 'Joining...' : 'Join Group'}
            </button>
          )}
        </div>
      </div>

      {/* Member Content or Join Prompt */}
      {!isMember ? (
        <div className="group-join-prompt">
          <p>Join this group to see events, challenges, and member activity.</p>
          <button
            className="btn-join"
            onClick={handleJoin}
            disabled={actionLoading}
          >
            {actionLoading ? 'Joining...' : 'Join to see content'}
          </button>
        </div>
      ) : (
        <>
          {/* Events Section */}
          <div className="group-content-section">
            <div className="section-header">
              <h3>Events</h3>
              {canCreateContent && (
                <button
                  className="btn-create"
                  onClick={() => setShowEventForm(!showEventForm)}
                >
                  {showEventForm ? 'Cancel' : '+ Create Event'}
                </button>
              )}
            </div>
            {showEventForm && canCreateContent && (
              <GroupEvents groupId={id} onEventCreated={handleCreateEvent} />
            )}
            {events.length === 0 ? (
              <p className="section-empty">No upcoming events.</p>
            ) : (
              <div className="group-events-list">
                {events.map(event => (
                  <div key={event.id} className="group-event-item">
                    <h4>{event.title}</h4>
                    <div className="event-meta">
                      <span>{formatDate(event.date)}</span>
                      {event.time && <span>{formatTime(event.time)}</span>}
                      {event.location && <span>{event.location}</span>}
                    </div>
                    {event.description && (
                      <p className="event-description">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Challenges Section */}
          <div className="group-content-section">
            <div className="section-header">
              <h3>Challenges</h3>
              {canCreateContent && (
                <button
                  className="btn-create"
                  onClick={() => setShowChallengeForm(!showChallengeForm)}
                >
                  {showChallengeForm ? 'Cancel' : '+ Create Challenge'}
                </button>
              )}
            </div>
            {showChallengeForm && canCreateContent && (
              <GroupChallenges groupId={id} onChallengeCreated={handleCreateChallenge} />
            )}
            {challenges.length === 0 ? (
              <p className="section-empty">No active challenges.</p>
            ) : (
              <div className="group-challenges-list">
                {challenges.map(challenge => (
                  <div key={challenge.id} className="group-challenge-item">
                    <h4>{challenge.title}</h4>
                    <p className="challenge-goal">{challenge.goal}</p>
                    <span className="challenge-dates">
                      {formatDate(challenge.start_date)} — {formatDate(challenge.end_date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Member Activity Section */}
          <div className="group-content-section">
            <h3>Member Activity</h3>
            {posts.length === 0 ? (
              <p className="section-empty">No recent activity from members.</p>
            ) : (
              <div className="group-posts-list">
                {posts.map(post => (
                  <div key={post.id} className="group-post-item">
                    <p className="post-author">
                      {post.profiles?.display_name || 'Unknown'}
                    </p>
                    <p className="post-content">
                      {post.caption || 'Shared an activity'}
                    </p>
                    <p className="post-time">{formatRelativeTime(post.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
