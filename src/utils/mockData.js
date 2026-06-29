/**
 * Mock data for development and testing.
 * Provides scrollable content for HomeFeed, Marketplace, and Groups.
 */

const FIRST_NAMES = ['Alex', 'Jordan', 'Sam', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Quinn', 'Avery', 'Blake', 'Drew', 'Sage', 'Kai', 'Reese', 'Charlie']
const LAST_NAMES = ['Chen', 'Kim', 'Patel', 'Nguyen', 'Tanaka', 'Garcia', 'Lee', 'Singh', 'Williams', 'Brown', 'Johnson', 'Miller', 'Davis', 'Wilson', 'Moore']
const ACTIVITY_TYPES = ['Run', 'Cycle', 'Swim', 'Walk']
const CAPTIONS = [
  'Beautiful morning run along the coast! 🌅',
  'Personal best today! Feeling great 💪',
  'Recovery run with the crew',
  'Interval training session — legs are toast 🔥',
  'First 10k in months, felt amazing',
  'Rainy ride but totally worth it 🌧️🚴',
  'Easy swim to shake off yesterday\'s session',
  'Trail run through the park — nature therapy 🌲',
  'Sprint workout done! Getting faster 🏃‍♂️💨',
  'Long ride with the cycling group today',
  'Sunset walk with good vibes',
  'Hill repeats — embracing the pain 🏔️',
  'New route discovered today!',
  'Post-work stress buster 🧘‍♂️',
  'Race prep — 3 weeks to go!',
]

function randomId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function randomDate(daysBack = 30) {
  const now = new Date()
  const past = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000)
  return past.toISOString()
}

function randomName() {
  return `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`
}

export function generateMockFeedPosts(count = 30) {
  const posts = []
  for (let i = 0; i < count; i++) {
    const type = ACTIVITY_TYPES[Math.floor(Math.random() * ACTIVITY_TYPES.length)]
    const distance = type === 'Swim' ? +(Math.random() * 3 + 0.5).toFixed(2) : +(Math.random() * 15 + 1).toFixed(2)
    const duration = Math.floor(distance * (type === 'Run' ? 5.5 : type === 'Cycle' ? 3 : type === 'Swim' ? 20 : 10) + Math.random() * 10)

    posts.push({
      id: randomId(),
      created_at: randomDate(14),
      caption: Math.random() > 0.3 ? CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)] : null,
      likes_count: Math.floor(Math.random() * 50),
      comments_count: Math.floor(Math.random() * 12),
      profiles: {
        display_name: randomName(),
        avatar_url: null,
        role: Math.random() > 0.85 ? 'merchant' : 'individual',
      },
      activities: {
        type,
        distance,
        duration,
      },
    })
  }
  return posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

const LISTING_TITLES = [
  'Nike Pegasus 40 Running Shoes',
  'Garmin Forerunner 265 Watch',
  'Road Bike - Giant Defy',
  'Yoga Mat Premium 6mm',
  'Resistance Bands Set (5 Pack)',
  'Swimming Goggles - Speedo',
  'Cycling Jersey - Rapha Pro',
  'Running Belt with Phone Holder',
  'Foam Roller - Deep Tissue',
  'Wahoo KICKR Smart Trainer',
  'Trail Running Shoes - Salomon',
  'Gym Bag - Under Armour',
  'Apple Watch Ultra 2',
  'Spin Bike - Peloton',
  'Protein Shaker Bottles (3 Pack)',
  'Hydration Vest - CamelBak',
  'Dumbbells Set 5-25kg',
  'Swim Cap + Goggles Bundle',
  'Heart Rate Monitor Chest Strap',
  'Compression Tights - 2XU',
  'Running Shorts - Nike Dri-FIT',
  'Cycling Computer - Wahoo Bolt',
  'Jump Rope - Weighted Speed',
  'Treadmill - NordicTrack',
  'Exercise Mat - Manduka PRO',
]

const LISTING_IMAGES = ['RUN', 'TECH', 'BIKE', 'YOGA', 'FIT', 'SWIM', 'CYCLE', 'GEAR', 'CORE', 'TRAIN', 'TRAIL', 'BAG', 'WATCH', 'SPIN', 'FUEL', 'HYDRO', 'LIFT', 'AQUA', 'HR', 'COMP', 'FLEX', 'NAV', 'SPEED', 'MOVE', 'PRO']
const CATEGORIES = ['Running', 'Cycling', 'Swimming', 'Fitness', 'Electronics']
const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair']

export function generateMockListings(count = 25) {
  return Array.from({ length: count }, (_, i) => ({
    id: randomId(),
    title: LISTING_TITLES[i % LISTING_TITLES.length],
    description: `High quality ${LISTING_TITLES[i % LISTING_TITLES.length].toLowerCase()}. Great condition and ready for your next workout.`,
    price: +(Math.random() * 500 + 10).toFixed(2),
    category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
    image: LISTING_IMAGES[i % LISTING_IMAGES.length],
    status: 'active',
    seller_id: randomId(),
    created_at: randomDate(60),
    profiles: {
      display_name: randomName(),
      role: Math.random() > 0.5 ? 'merchant' : 'individual',
    },
  }))
}

const GROUP_NAMES = [
  '5K Beginners',
  'Marathon Training Club',
  'City Cyclists United',
  'Open Water Swimmers',
  'Trail Runners SG',
  'Fitness Accountability',
  'Morning Run Crew',
  'Weekend Warriors',
  'Triathlon Training',
  'Park Run Community',
  'Strength & Conditioning',
  'Yoga & Mobility',
]

const GROUP_DESCRIPTIONS = [
  'A supportive group for those starting their running journey. All paces welcome!',
  'Structured training plans and group long runs every weekend.',
  'Road cycling enthusiasts exploring new routes every week.',
  'Open water swimming sessions at various locations.',
  'Trail running adventures in forests and parks.',
  'Daily check-ins and workout sharing to stay on track.',
  'Early birds who love starting the day with a run.',
  'Casual athletes who go hard on weekends.',
  'Swim-Bike-Run training for all distances.',
  'Weekly Park Run meetups and post-run coffee.',
  'Lifting, cross-training, and getting stronger together.',
  'Flexibility, recovery, and mindful movement.',
]

export function generateMockGroups(count = 12) {
  return Array.from({ length: count }, (_, i) => ({
    id: randomId(),
    name: GROUP_NAMES[i % GROUP_NAMES.length],
    description: GROUP_DESCRIPTIONS[i % GROUP_DESCRIPTIONS.length],
    member_count: Math.floor(Math.random() * 200 + 5),
    created_by: randomId(),
    created_at: randomDate(180),
  }))
}

export function generateMockAds(count = 5) {
  return Array.from({ length: count }, () => ({
    id: randomId(),
    merchant_id: randomId(),
    title: `${LISTING_TITLES[Math.floor(Math.random() * LISTING_TITLES.length)]} — Special Offer!`,
    image: 'https://via.placeholder.com/400x200/8b5cf6/ffffff?text=FitCarousell+Ad',
    link_type: 'listing',
    link_id: randomId(),
    is_active: true,
    created_at: randomDate(7),
    _type: 'ad',
  }))
}
