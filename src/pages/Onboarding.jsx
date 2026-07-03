import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconRun, IconCycle, IconSwim, IconWalk,
  IconTarget, IconHome, IconMarket, IconRecord,
  IconGroups, IconUser, IconHeart, IconCheck,
  IconArrowLeft, IconStar, IconChat, IconCalendar
} from '../components/Icons'
import './Onboarding.css'

const TOTAL_STEPS = 10

const ACTIVITIES = [
  { id: 'running', label: 'Running', Icon: IconRun },
  { id: 'cycling', label: 'Cycling', Icon: IconCycle },
  { id: 'swimming', label: 'Swimming', Icon: IconSwim },
  { id: 'gym', label: 'Gym / Weights', Icon: IconTarget },
  { id: 'yoga', label: 'Yoga', Icon: IconWalk },
  { id: 'hiking', label: 'Hiking', Icon: IconRun },
  { id: 'walking', label: 'Walking', Icon: IconWalk },
  { id: 'crossfit', label: 'CrossFit', Icon: IconTarget },
  { id: 'pilates', label: 'Pilates', Icon: IconWalk },
  { id: 'tennis', label: 'Tennis', Icon: IconRun },
  { id: 'basketball', label: 'Basketball', Icon: IconGroups },
  { id: 'other', label: 'Other', Icon: IconStar },
]

const GOALS = [
  { id: 'track', label: 'Track my workouts', Icon: IconRecord },
  { id: 'buddies', label: 'Find training buddies', Icon: IconGroups },
  { id: 'gear', label: 'Buy/sell gear', Icon: IconMarket },
  { id: 'events', label: 'Join events', Icon: IconCalendar },
  { id: 'nutrition', label: 'Get nutrition tips', Icon: IconHeart },
  { id: 'influencers', label: 'Follow influencers', Icon: IconStar },
]

const INFLUENCERS = [
  { id: 'coach-maya', name: 'Coach Maya', specialty: 'Running', initials: 'CM' },
  { id: 'fit-nadia', name: 'FitNadia', specialty: 'HIIT', initials: 'FN' },
  { id: 'trailblazer-tom', name: 'TrailBlazerTom', specialty: 'Trail', initials: 'TT' },
  { id: 'cycle-queen-sara', name: 'CycleQueenSara', specialty: 'Cycling', initials: 'CS' },
  { id: 'swim-coach-lee', name: 'SwimCoachLee', specialty: 'Swimming', initials: 'SL' },
  { id: 'strength-alex', name: 'StrengthByAlex', specialty: 'Weights', initials: 'SA' },
  { id: 'yoga-ren', name: 'YogaWithRen', specialty: 'Yoga', initials: 'YR' },
  { id: 'mealprep-mike', name: 'MealPrepMike', specialty: 'Nutrition', initials: 'MM' },
]

const FEED_PREFS = [
  { id: 'friends', label: "Friends' activities", Icon: IconGroups },
  { id: 'blogs', label: 'Blog posts', Icon: IconChat },
  { id: 'deals', label: 'Marketplace deals', Icon: IconMarket },
  { id: 'events', label: 'Community events', Icon: IconCalendar },
  { id: 'challenges', label: 'Challenges', Icon: IconTarget },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState('forward')

  // User preferences state
  const [displayName, setDisplayName] = useState('')
  const [fitnessLevel, setFitnessLevel] = useState('')
  const [interests, setInterests] = useState([])
  const [goals, setGoals] = useState([])
  const [followedInfluencers, setFollowedInfluencers] = useState([])
  const [feedPrefs, setFeedPrefs] = useState(['friends', 'blogs', 'deals', 'events', 'challenges'])

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setDirection('forward')
      setStep(step + 1)
    }
  }

  const goBack = () => {
    if (step > 0) {
      setDirection('backward')
      setStep(step - 1)
    }
  }

  const toggleInterest = (id) => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleGoal = (id) => {
    setGoals(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleInfluencer = (id) => {
    setFollowedInfluencers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleFeedPref = (id) => {
    setFeedPrefs(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleComplete = () => {
    const preferences = {
      displayName,
      fitnessLevel,
      interests,
      goals,
      followedInfluencers,
      feedPrefs,
      completedAt: new Date().toISOString(),
    }
    localStorage.setItem('tribefit_onboarding', JSON.stringify(preferences))
    localStorage.setItem('tribefit_onboarded', 'true')
    navigate('/', { replace: true })
  }

  const getStepClass = (index) => {
    if (index === step) return 'onboarding-step active'
    if (direction === 'forward' && index < step) return 'onboarding-step exit-left'
    if (direction === 'forward' && index > step) return 'onboarding-step enter-right'
    if (direction === 'backward' && index > step) return 'onboarding-step exit-right'
    if (direction === 'backward' && index < step) return 'onboarding-step enter-left'
    return 'onboarding-step'
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        {/* Progress Bar */}
        {step > 0 && step < TOTAL_STEPS - 1 && (
          <div className="onboarding-progress">
            <div className="onboarding-progress-bar">
              <div
                className="onboarding-progress-fill"
                style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              />
            </div>
            <span className="onboarding-progress-text">{step + 1}/{TOTAL_STEPS}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="onboarding-step-wrapper">
          {/* Step 0: Welcome */}
          <div className={getStepClass(0)}>
            <div className="onboarding-step-content welcome-step">
              <div className="welcome-logo">
                <IconTarget size={36} style={{ color: 'white' }} />
              </div>
              <h1>Welcome to TribeFit</h1>
              <p className="welcome-tagline">Your fitness community meets marketplace</p>
            </div>
            <div className="onboarding-nav" style={{ justifyContent: 'center' }}>
              <button className="btn-next" onClick={goNext}>
                Get Started
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Step 1: Self Intro */}
          <div className={getStepClass(1)}>
            <div className="onboarding-step-content">
              <h2>Tell us about yourself</h2>
              <p className="step-subtitle">We will personalize your experience based on your info.</p>

              <div className="onboarding-input-group">
                <label htmlFor="ob-name">Display Name</label>
                <input
                  id="ob-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="What should we call you?"
                  maxLength={50}
                />
              </div>

              <div className="onboarding-input-group">
                <label>Fitness Level</label>
                <div className="fitness-level-grid">
                  {['Beginner', 'Intermediate', 'Advanced', 'Pro'].map(level => (
                    <button
                      key={level}
                      type="button"
                      className={`fitness-level-option ${fitnessLevel === level ? 'selected' : ''}`}
                      onClick={() => setFitnessLevel(level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="onboarding-nav">
              <button className="btn-back" onClick={goBack}>
                <IconArrowLeft size={16} /> Back
              </button>
              <button className="btn-next" onClick={goNext}>
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Step 2: Workout Interests */}
          <div className={getStepClass(2)}>
            <div className="onboarding-step-content">
              <h2>Your workout interests</h2>
              <p className="step-subtitle">Pick activities you enjoy. Select as many as you like.</p>

              <div className="multi-select-grid">
                {ACTIVITIES.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={`multi-select-item ${interests.includes(id) ? 'selected' : ''}`}
                    onClick={() => toggleInterest(id)}
                  >
                    <span className="item-icon"><Icon size={20} /></span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="onboarding-nav">
              <button className="btn-back" onClick={goBack}>
                <IconArrowLeft size={16} /> Back
              </button>
              <button className="btn-skip" onClick={goNext}>Skip</button>
              <button className="btn-next" onClick={goNext}>
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Step 3: Goals */}
          <div className={getStepClass(3)}>
            <div className="onboarding-step-content">
              <h2>What are you here for?</h2>
              <p className="step-subtitle">Select your goals so we can tailor your experience.</p>

              <div className="goals-grid">
                {GOALS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={`goal-item ${goals.includes(id) ? 'selected' : ''}`}
                    onClick={() => toggleGoal(id)}
                  >
                    <span className="goal-icon"><Icon size={18} /></span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="onboarding-nav">
              <button className="btn-back" onClick={goBack}>
                <IconArrowLeft size={16} /> Back
              </button>
              <button className="btn-skip" onClick={goNext}>Skip</button>
              <button className="btn-next" onClick={goNext}>
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Step 4: Influencer Preferences */}
          <div className={getStepClass(4)}>
            <div className="onboarding-step-content">
              <h2>Follow creators</h2>
              <p className="step-subtitle">Tap to follow coaches and influencers you find interesting.</p>

              <div className="influencer-grid">
                {INFLUENCERS.map(({ id, name, specialty, initials }) => (
                  <button
                    key={id}
                    type="button"
                    className={`influencer-card ${followedInfluencers.includes(id) ? 'followed' : ''}`}
                    onClick={() => toggleInfluencer(id)}
                  >
                    <div className="influencer-avatar">{initials}</div>
                    <div className="influencer-info">
                      <div className="influencer-name">{name}</div>
                      <div className="influencer-specialty">{specialty}</div>
                    </div>
                    <span className="influencer-follow-icon">
                      {followedInfluencers.includes(id)
                        ? <IconCheck size={16} />
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="onboarding-nav">
              <button className="btn-back" onClick={goBack}>
                <IconArrowLeft size={16} /> Back
              </button>
              <button className="btn-skip" onClick={goNext}>Skip</button>
              <button className="btn-next" onClick={goNext}>
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Step 5: Feed Preferences */}
          <div className={getStepClass(5)}>
            <div className="onboarding-step-content">
              <h2>What do you want to see?</h2>
              <p className="step-subtitle">Customize your feed. Toggle what matters to you.</p>

              <div className="toggle-list">
                {FEED_PREFS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={`toggle-item ${feedPrefs.includes(id) ? 'active' : ''}`}
                    onClick={() => toggleFeedPref(id)}
                  >
                    <span className="toggle-item-label">
                      <Icon size={18} />
                      {label}
                    </span>
                    <span className="toggle-switch" />
                  </button>
                ))}
              </div>
            </div>
            <div className="onboarding-nav">
              <button className="btn-back" onClick={goBack}>
                <IconArrowLeft size={16} /> Back
              </button>
              <button className="btn-next" onClick={goNext}>
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Step 6: App Tour - Feed */}
          <div className={getStepClass(6)}>
            <div className="onboarding-step-content">
              <h2>Your Home Feed</h2>
              <p className="step-subtitle">Here is where everything comes together.</p>

              <div className="tour-mock">
                <div className="tour-mock-header">
                  <IconHome size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span className="tour-mock-title">Home Feed</span>
                </div>
                <div className="tour-mock-items">
                  <div className="tour-mock-item">
                    <div className="tour-mock-item-icon"><IconRun size={16} /></div>
                    <span className="tour-mock-item-text">Friends' run activities and stats</span>
                  </div>
                  <div className="tour-mock-item">
                    <div className="tour-mock-item-icon"><IconChat size={16} /></div>
                    <span className="tour-mock-item-text">Blog posts and community updates</span>
                  </div>
                  <div className="tour-mock-item">
                    <div className="tour-mock-item-icon"><IconCalendar size={16} /></div>
                    <span className="tour-mock-item-text">Upcoming events and challenges</span>
                  </div>
                </div>
                <div className="tour-callout">
                  <span className="tour-callout-icon"><IconStar size={16} /></span>
                  <span>This is your feed. See friends' runs, blog posts, and community content all in one place.</span>
                </div>
              </div>
            </div>
            <div className="onboarding-nav">
              <button className="btn-back" onClick={goBack}>
                <IconArrowLeft size={16} /> Back
              </button>
              <button className="btn-next" onClick={goNext}>
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Step 7: App Tour - Marketplace */}
          <div className={getStepClass(7)}>
            <div className="onboarding-step-content">
              <h2>The Marketplace</h2>
              <p className="step-subtitle">Buy and sell fitness gear within the community.</p>

              <div className="tour-mock">
                <div className="tour-mock-header">
                  <IconMarket size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span className="tour-mock-title">Marketplace</span>
                </div>
                <div className="tour-mock-items">
                  <div className="tour-mock-item">
                    <div className="tour-mock-item-icon"><IconMarket size={16} /></div>
                    <span className="tour-mock-item-text">Used - Browse pre-owned gear from other athletes</span>
                  </div>
                  <div className="tour-mock-item">
                    <div className="tour-mock-item-icon"><IconStar size={16} /></div>
                    <span className="tour-mock-item-text">Shop - New items from verified merchants</span>
                  </div>
                </div>
                <div className="tour-callout">
                  <span className="tour-callout-icon"><IconStar size={16} /></span>
                  <span>Find great deals on running shoes, bikes, weights, and more. List your own gear in seconds.</span>
                </div>
              </div>
            </div>
            <div className="onboarding-nav">
              <button className="btn-back" onClick={goBack}>
                <IconArrowLeft size={16} /> Back
              </button>
              <button className="btn-next" onClick={goNext}>
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Step 8: App Tour - Record */}
          <div className={getStepClass(8)}>
            <div className="onboarding-step-content">
              <h2>Track Your Runs</h2>
              <p className="step-subtitle">Record activities with live GPS tracking.</p>

              <div className="tour-mock">
                <div className="tour-mock-header">
                  <IconRecord size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span className="tour-mock-title">Record Activity</span>
                </div>
                <div className="tour-mock-items">
                  <div className="tour-mock-item">
                    <div className="tour-mock-item-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <span className="tour-mock-item-text">Live GPS route mapping</span>
                  </div>
                  <div className="tour-mock-item">
                    <div className="tour-mock-item-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <span className="tour-mock-item-text">Duration, pace, and distance stats</span>
                  </div>
                  <div className="tour-mock-item">
                    <div className="tour-mock-item-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                    </div>
                    <span className="tour-mock-item-text">See your route on a map when done</span>
                  </div>
                </div>
                <div className="tour-callout">
                  <span className="tour-callout-icon"><IconStar size={16} /></span>
                  <span>Track your runs with live GPS, see your route on the map, and share achievements with friends.</span>
                </div>
              </div>
            </div>
            <div className="onboarding-nav">
              <button className="btn-back" onClick={goBack}>
                <IconArrowLeft size={16} /> Back
              </button>
              <button className="btn-next" onClick={goNext}>
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Step 9: All Set */}
          <div className={getStepClass(9)}>
            <div className="onboarding-step-content final-step">
              <div className="final-check-circle">
                <IconCheck size={36} />
              </div>
              <h1>You're ready to go!</h1>
              <p className="final-subtitle">Your preferences are saved. Time to explore TribeFit.</p>
            </div>
            <div className="onboarding-nav" style={{ justifyContent: 'center' }}>
              <button className="btn-start" onClick={handleComplete}>
                Start Exploring
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
