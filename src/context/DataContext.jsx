import React, { createContext, useContext, useState } from 'react'

const DataContext = createContext()

const initialActivities = [
  { id: 1, type: 'Run', distance: 5.2, duration: 28, date: '2026-06-27', user: 'You' },
  { id: 2, type: 'Cycle', distance: 22.5, duration: 55, date: '2026-06-25', user: 'You' },
  { id: 3, type: 'Swim', distance: 1.0, duration: 35, date: '2026-06-23', user: 'You' },
]

const initialEvents = [
  {
    id: 1,
    title: '5K Morning Run',
    description: 'Join us for a casual 5K around Marina Bay. All levels welcome!',
    date: '2026-07-05',
    location: 'Marina Bay Sands',
    participants: 24,
    type: 'Run',
  },
  {
    id: 2,
    title: 'Century Ride Challenge',
    description: '100km cycling challenge through East Coast Park. Complete it within 4 hours!',
    date: '2026-07-12',
    location: 'East Coast Park',
    participants: 15,
    type: 'Cycle',
  },
  {
    id: 3,
    title: 'Swim & Brunch',
    description: 'Open water swim followed by brunch at the beach club.',
    date: '2026-07-20',
    location: 'Sentosa Beach',
    participants: 12,
    type: 'Swim',
  },
  {
    id: 4,
    title: '30-Day Fitness Challenge',
    description: 'Log at least 30 minutes of activity every day for 30 days. Leaderboard prizes!',
    date: '2026-07-01',
    location: 'Virtual',
    participants: 89,
    type: 'Challenge',
  },
]

const initialListings = [
  {
    id: 1,
    title: 'Garmin Forerunner 265',
    description: 'Used for 6 months, excellent condition. Comes with original box and charger.',
    price: 350,
    category: 'Electronics',
    condition: 'Like New',
    seller: 'RunnerJohn',
    image: '⌚',
    date: '2026-06-26',
  },
  {
    id: 2,
    title: 'Trek Domane AL 5 Road Bike',
    description: 'Size 56cm. Well maintained, recently serviced. Perfect for long rides.',
    price: 1200,
    category: 'Cycling',
    condition: 'Good',
    seller: 'CyclistMike',
    image: '🚲',
    date: '2026-06-25',
  },
  {
    id: 3,
    title: 'Nike Vaporfly Next% 2',
    description: 'Size US 10. Worn twice for races only. Still has plenty of life.',
    price: 180,
    category: 'Running',
    condition: 'Like New',
    seller: 'SpeedDemon',
    image: '👟',
    date: '2026-06-24',
  },
  {
    id: 4,
    title: 'TYR Wetsuit Men\'s M',
    description: 'Full sleeve triathlon wetsuit. Perfect for open water swimming.',
    price: 150,
    category: 'Swimming',
    condition: 'Good',
    seller: 'TriAthlete99',
    image: '🏊',
    date: '2026-06-23',
  },
  {
    id: 5,
    title: 'Yoga Mat - Manduka PRO',
    description: 'Barely used premium yoga mat. 6mm thick, great grip.',
    price: 60,
    category: 'Fitness',
    condition: 'Like New',
    seller: 'YogaFan',
    image: '🧘',
    date: '2026-06-22',
  },
]

export function DataProvider({ children }) {
  const [activities, setActivities] = useState(initialActivities)
  const [events, setEvents] = useState(initialEvents)
  const [listings, setListings] = useState(initialListings)
  const [joinedEvents, setJoinedEvents] = useState([])

  const addActivity = (activity) => {
    setActivities((prev) => [{ ...activity, id: Date.now(), user: 'You' }, ...prev])
  }

  const joinEvent = (eventId) => {
    if (!joinedEvents.includes(eventId)) {
      setJoinedEvents((prev) => [...prev, eventId])
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, participants: e.participants + 1 } : e))
      )
    }
  }

  const addListing = (listing) => {
    setListings((prev) => [{ ...listing, id: Date.now(), seller: 'You', date: new Date().toISOString().split('T')[0] }, ...prev])
  }

  return (
    <DataContext.Provider
      value={{ activities, addActivity, events, joinEvent, joinedEvents, listings, addListing }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
