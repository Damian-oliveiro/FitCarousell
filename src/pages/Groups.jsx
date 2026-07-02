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
  const [actionLoading, setActionLoading] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)
  const [activityFilter, setActivityFilter] = useState('All')

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
    if (memberships.includes(groupId)) {
      setActionMessage({ groupId, message: 'Already a member' })
      setTimeout(() => setActionMessage(null), 3000)
      return
    }

    setActionLoading(groupId)
    setActionMessage(null)

    // In mock mode, just update local state
    if (USE_MOCK_DATA) {
      setTimeout(() => {
        setMemberships(prev => [...prev, groupId])
        setGroups(prev => prev.map(g => g.id === groupId ? { ...g, member_count: (g.member_count || 0) + 1 } : g))
        setActionLoading(null)
      }, 300)
      return
    }

    const { error: joinError } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, user_id: user?.id })

    if (joinError) {
      if (joinError.code === '23505') {
        setMemberships(prev => prev.includes(groupId) ? prev : [...prev, groupId])
      } else {
        setActionMessage({ groupId, message: 'Failed to join group' })
      }
      setActionLoading(null)
      setTimeout(() => setActionMessage(null), 3000)
      return
    }

    setMemberships(prev => [...prev, groupId])
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, member_count: (g.member_count || 0) + 1 } : g))
    setActionLoading(null)
  }

  async function handleLeave(groupId) {
    setActionLoading(groupId)
    setActionMessage(null)

    if (USE_MOCK_DATA) {
      setTimeout(() => {
        setMemberships(prev => prev.filter(id => id !== groupId))
        setGroups(prev => prev.map(g => g.id === groupId ? { ...g, member_count: Math.max(0, (g.member_count || 0) - 1) } : g))
        setActionLoading(null)
      }, 300)
      return
    }

    const { error: leaveError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user?.id)

    if (leaveError) {
      setActionMessage({ groupId, message: 'Failed to leave group' })
      setActionLoading(null)
      setTimeout(() => setActionMessage(null), 3000)
      return
    }

    setMemberships(prev => prev.filter(id => id !== groupId))
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, member_count: Math.max(0, (g.member_count || 0) - 1) } : g))
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
      <h2>Groups & Events</h2>

      {/* Activity type filter */}
      <div className="groups-filter-bar">
        {['All', 'Running', 'Marathon', 'Cycling', 'Yoga', 'Pilates', 'Fitness', 'Walking', 'CrossFit'].map(type => (
          <button
            key={type}
            className={`filter-btn ${activityFilter === type ? 'active' : ''}`}
            onClick={() => setActivityFilter(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="groups-empty">
          <p>No groups available yet.</p>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.filter(g => activityFilter === 'All' || g.upcoming_event?.eventType === activityFilter).map(group => {
            const isMember = memberships.includes(group.id)
            const isActing = actionLoading === group.id
            const message = actionMessage?.groupId === group.id ? actionMessage.message : null

            return (
              <div key={group.id} className="group-card">
                {group.cover_image && (
                  <div className="group-card-cover">
                    <img src={group.cover_image} alt={group.name} />
                  </div>
                )}
                <div className="group-card-body">
                  <Link to={`/groups/${group.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3>{group.name}</h3>
                  </Link>
                  <p className="group-card-description">
                    {truncateDescription(group.description)}
                  </p>

                  {group.upcoming_event && (
                    <div className="group-card-event">
                      <div className="group-card-event-header">Next Event</div>
                      <div className="group-card-event-title">{group.upcoming_event.title}</div>
                      <p className="group-card-event-desc">{group.upcoming_event.description}</p>
                      <div className="group-card-event-meta">
                        <span>{group.upcoming_event.date} at {group.upcoming_event.time}</span>
                        <span>{group.upcoming_event.location}</span>
                      </div>
                      <div className="group-card-event-details">
                        <span className={`event-price-tag ${group.upcoming_event.price === 0 ? 'free' : 'paid'}`}>
                          {group.upcoming_event.priceLabel}
                        </span>
                        {group.upcoming_event.prize && (
                          <span className="event-prize-tag">{group.upcoming_event.prize}</span>
                        )}
                        <span className="event-spots">{group.upcoming_event.spotsLeft} spots left</span>
                      </div>
                      <div className="group-card-event-organizer">
                        By {group.upcoming_event.organizer}
                      </div>
                      {group.upcoming_event.map_image && (
                        <div className="group-card-map">
                          <img src={group.upcoming_event.map_image} alt="Event" />
                        </div>
                      )}
                      <button className="btn-primary btn-sm event-join-btn">
                        {group.upcoming_event.price > 0 ? `Join - ${group.upcoming_event.priceLabel}` : 'Join Event'}
                      </button>
                    </div>
                  )}

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
              </div>
            )
          })}
        </div>
      )}

      {/* Health Tips & Blogs Section */}
      <HealthTipsSection />
    </div>
  )
}

const HEALTH_TIPS = [
  {
    author: 'Dr. Sarah Fit',
    tag: 'Nutrition',
    title: 'What to Eat Before a Morning Run',
    body: 'Your pre-run fuel matters more than you think. A light meal 60-90 minutes before — think banana with peanut butter or oatmeal with berries — gives your body the glycogen it needs without causing cramps. Avoid high-fiber and high-fat foods right before running.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=300&fit=crop',
  },
  {
    author: 'Coach Jake',
    tag: 'Recovery',
    title: 'The 48-Hour Rule: Why Rest Days Matter',
    body: 'Muscle growth happens during rest, not during the workout. After intense training, your muscle fibers need 48 hours to repair and come back stronger. Skipping rest leads to overtraining, elevated cortisol, and eventually injury. Schedule rest like you schedule workouts.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=300&fit=crop',
  },
  {
    author: 'NutriFit Clinic',
    tag: 'Healthy Eating',
    title: '5 Post-Workout Meals for Muscle Recovery',
    body: 'The 30-minute window after training is when your body absorbs nutrients most efficiently. Aim for a 3:1 carb-to-protein ratio. Try: grilled chicken with sweet potato, Greek yogurt with granola, salmon with quinoa, protein smoothie with banana, or eggs with avocado toast.',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=300&fit=crop',
  },
  {
    author: 'RunWithJake',
    tag: 'Training',
    title: 'Why 80% of Your Runs Should Be Easy',
    body: 'The biggest mistake recreational runners make is running too fast on easy days. The 80/20 rule — 80% easy, 20% hard — builds your aerobic base without accumulating fatigue. Easy means you can hold a full conversation. If you are gasping, slow down.',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=300&fit=crop',
  },
  {
    author: 'YogaWithRen',
    tag: 'Mobility',
    title: 'Hip Openers Every Runner Needs',
    body: 'Tight hips are the #1 cause of IT band syndrome and knee pain in runners. Spend 10 minutes daily on pigeon pose, 90/90 stretch, and hip flexor lunges. Your stride will lengthen, your pace will drop, and your joints will thank you.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=300&fit=crop',
  },
  {
    author: 'StrengthByAlex',
    tag: 'Workout',
    title: 'The Only 3 Lifts Runners Need',
    body: 'Deadlifts for posterior chain strength, Bulgarian split squats for single-leg stability, and calf raises for ankle resilience. Two sessions per week, 3 sets of 8 reps. This alone prevents 70% of common running injuries.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=300&fit=crop',
  },
]

function HealthTipsSection() {
  return (
    <div className="health-tips-section">
      <h3 className="health-tips-title">Health & Fitness Tips</h3>
      <p className="health-tips-subtitle">From coaches, nutritionists, and athletes</p>
      <div className="health-tips-list">
        {HEALTH_TIPS.map((tip, i) => (
          <div key={i} className="health-tip-card">
            <img src={tip.image} alt={tip.title} className="health-tip-image" />
            <div className="health-tip-content">
              <div className="health-tip-meta">
                <span className="health-tip-tag">{tip.tag}</span>
                <span className="health-tip-author">{tip.author}</span>
              </div>
              <h4 className="health-tip-title">{tip.title}</h4>
              <p className="health-tip-body">{tip.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
