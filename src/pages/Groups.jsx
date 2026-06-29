import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { generateMockGroups } from '../utils/mockData'
import './Groups.css'

const USE_MOCK_DATA = true // Set to false when Supabase is connected with real data

export default function Groups() {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [memberships, setMemberships] = useState([]) // group IDs user has joined
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null) // group ID currently being acted on
  const [actionMessage, setActionMessage] = useState(null) // { groupId, message }

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (USE_MOCK_DATA) {
      setGroups(generateMockGroups(12))
      setLoading(false)
      return
    }

    const { data, error: fetchError } = await supabase
      .from('groups')
      .select('*')
      .order('member_count', { ascending: false })
      .limit(50)

    if (fetchError) {
      // Fallback to mock data
      setGroups(generateMockGroups(12))
      setLoading(false)
      return
    }

    setGroups(data || [])
    setLoading(false)
  }, [])

  const fetchMemberships = useCallback(async () => {
    if (!user) return

    const { data, error: fetchError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id)

    if (!fetchError && data) {
      setMemberships(data.map(d => d.group_id))
    }
  }, [user])

  useEffect(() => {
    fetchGroups()
    fetchMemberships()
  }, [fetchGroups, fetchMemberships])

  async function handleJoin(groupId) {
    if (!user) return

    // Check if already a member
    if (memberships.includes(groupId)) {
      setActionMessage({ groupId, message: 'Already a member' })
      setTimeout(() => setActionMessage(null), 3000)
      return
    }

    setActionLoading(groupId)
    setActionMessage(null)

    const { error: joinError } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, user_id: user.id })

    if (joinError) {
      // Handle duplicate constraint violation
      if (joinError.code === '23505') {
        setActionMessage({ groupId, message: 'Already a member' })
        setMemberships(prev => prev.includes(groupId) ? prev : [...prev, groupId])
      } else {
        setActionMessage({ groupId, message: 'Failed to join group' })
      }
      setActionLoading(null)
      setTimeout(() => setActionMessage(null), 3000)
      return
    }

    // Update local state
    setMemberships(prev => [...prev, groupId])
    setGroups(prev =>
      prev.map(g =>
        g.id === groupId ? { ...g, member_count: (g.member_count || 0) + 1 } : g
      )
    )
    setActionLoading(null)
  }

  async function handleLeave(groupId) {
    if (!user) return

    setActionLoading(groupId)
    setActionMessage(null)

    const { error: leaveError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user.id)

    if (leaveError) {
      setActionMessage({ groupId, message: 'Failed to leave group' })
      setActionLoading(null)
      setTimeout(() => setActionMessage(null), 3000)
      return
    }

    // Update local state
    setMemberships(prev => prev.filter(id => id !== groupId))
    setGroups(prev =>
      prev.map(g =>
        g.id === groupId ? { ...g, member_count: Math.max(0, (g.member_count || 0) - 1) } : g
      )
    )
    setActionLoading(null)
  }

  function truncateDescription(description, maxLength = 200) {
    if (!description) return ''
    if (description.length <= maxLength) return description
    return description.slice(0, maxLength) + '…'
  }

  if (loading) {
    return (
      <div className="groups-page">
        <div className="groups-loading">
          <div className="loading-spinner" />
          <p>Loading groups...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="groups-page">
        <div className="groups-error">
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchGroups}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="groups-page">
      <h2>Groups</h2>

      {groups.length === 0 ? (
        <div className="groups-empty">
          <p>No groups available yet.</p>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map(group => {
            const isMember = memberships.includes(group.id)
            const isActing = actionLoading === group.id
            const message = actionMessage?.groupId === group.id ? actionMessage.message : null

            return (
              <div key={group.id} className="group-card">
                <Link to={`/groups/${group.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3>{group.name}</h3>
                </Link>
                <p className="group-card-description">
                  {truncateDescription(group.description)}
                </p>
                <div className="group-card-footer">
                  <span className="group-member-count">
                    {group.member_count || 0} {group.member_count === 1 ? 'member' : 'members'}
                  </span>
                  {isMember ? (
                    <button
                      className="btn-leave"
                      onClick={() => handleLeave(group.id)}
                      disabled={isActing}
                    >
                      {isActing ? 'Leaving...' : 'Leave'}
                    </button>
                  ) : (
                    <button
                      className="btn-join"
                      onClick={() => handleJoin(group.id)}
                      disabled={isActing}
                    >
                      {isActing ? 'Joining...' : 'Join'}
                    </button>
                  )}
                </div>
                {message && (
                  <span className="member-badge">{message}</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
