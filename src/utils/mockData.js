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
  const ROUTE_IMAGES = [
    'https://i.redd.it/strava-art-santa-v0-7vqjx8o3ja4a1.jpg?width=750&format=pjpg&auto=webp&s=300',
    'https://i.redd.it/christmas-tree-strava-art-v0-2d7k8n5tl64a1.jpg?width=750&format=pjpg&auto=webp&s=300',
    'https://i.redd.it/strava-art-reindeer-v0-3xv0yfqqra4a1.jpg?width=750&format=pjpg&auto=webp&s=300',
    'https://i.redd.it/9xg7a0e7g0961.jpg?width=640&format=pjpg&auto=webp&s=300',
    'https://i.redd.it/snowflake-strava-art-v0-k2h1p5r9v74a1.jpg?width=750&format=pjpg&auto=webp&s=300',
    'https://i.redd.it/strava-art-snowman-v0-lw3tn4r2sa4a1.jpg?width=750&format=pjpg&auto=webp&s=300',
    'https://external-preview.redd.it/strava-art-v0-dG0yaGt6djYxcmRjMafrwv3XJJFDxlDPWkNQXhzLqfJyaT5IWHlTcDlyVQ.png?width=640&format=png&auto=webp&s=300',
    'https://i.redd.it/yqn07rnxs9a61.jpg?width=640&format=pjpg&auto=webp&s=300',
    'https://i.redd.it/d2d5v19dfwe61.jpg?width=640&format=pjpg&auto=webp&s=300',
    'https://i.redd.it/j9xg6w7bc0961.png?width=640&format=png&auto=webp&s=300',
  ]

  const posts = []
  for (let i = 0; i < count; i++) {
    const type = ACTIVITY_TYPES[Math.floor(Math.random() * ACTIVITY_TYPES.length)]
    const distance = type === 'Swim' ? +(Math.random() * 3 + 0.5).toFixed(2) : +(Math.random() * 15 + 1).toFixed(2)
    const duration = Math.floor(distance * (type === 'Run' ? 5.5 : type === 'Cycle' ? 3 : type === 'Swim' ? 20 : 10) + Math.random() * 10)

    posts.push({
      id: randomId(),
      created_at: randomDate(14),
      caption: Math.random() > 0.3 ? CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)] : null,
      route_image: ROUTE_IMAGES[Math.floor(Math.random() * ROUTE_IMAGES.length)],
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

const LISTING_IMAGES = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1591291621164-2c6367723315?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1483721310020-03333e577078?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop',
]
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
  const MAP_IMAGES = [
    'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=600&h=250&fit=crop',
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=250&fit=crop',
    'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&h=250&fit=crop',
    'https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=600&h=250&fit=crop',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=250&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=250&fit=crop',
  ]

  const EVENT_TITLES = [
    'Saturday Morning 5K',
    'Sunrise Trail Run',
    'Interval Training Session',
    'Long Run Weekend',
    'Recovery Jog + Coffee',
    'Sprint Challenge',
    'Group Hill Repeats',
    'Coastal Loop Run',
    'Night Run City Tour',
    'Park Run Meetup',
    'Bridge to Bridge',
    'Marathon Pace Run',
  ]

  const EVENT_LOCATIONS = [
    'East Coast Park, Gate 4',
    'MacRitchie Reservoir Trail',
    'Marina Bay Sands Loop',
    'Botanic Gardens Main Gate',
    'Sentosa Boardwalk Start',
    'Bukit Timah Nature Reserve',
    'Gardens by the Bay East',
    'Punggol Waterway Park',
    'Bedok Reservoir',
    'Bishan-Ang Mo Kio Park',
    'West Coast Park',
    'Jurong Lake Gardens',
  ]

  const EVENT_DESCRIPTIONS = [
    'Friendly group run for all paces. We regroup at every kilometer marker. No one left behind.',
    'Moderate pace run through scenic trails. Bring headlamp if joining early. Water provided at checkpoints.',
    'High intensity interval training on the track. 400m repeats with 90 second recovery. All fitness levels welcome.',
    'Building up for race day. Steady pace at 5:30-6:00 min/km. Hydration stations along the way.',
    'Easy pace run followed by brunch at the nearby cafe. Great way to start the weekend.',
    'Timed sprints with full recovery. Push your limits. Warm-up at 6:45am, sprints start at 7am sharp.',
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: randomId(),
    name: GROUP_NAMES[i % GROUP_NAMES.length],
    description: GROUP_DESCRIPTIONS[i % GROUP_DESCRIPTIONS.length],
    member_count: Math.floor(Math.random() * 200 + 5),
    created_by: randomId(),
    created_at: randomDate(180),
    cover_image: MAP_IMAGES[i % MAP_IMAGES.length],
    upcoming_event: {
      title: EVENT_TITLES[i % EVENT_TITLES.length],
      description: EVENT_DESCRIPTIONS[i % EVENT_DESCRIPTIONS.length],
      location: EVENT_LOCATIONS[i % EVENT_LOCATIONS.length],
      date: new Date(Date.now() + (i + 1) * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: `${6 + (i % 4)}:${i % 2 === 0 ? '00' : '30'} AM`,
      map_image: MAP_IMAGES[(i + 2) % MAP_IMAGES.length],
    },
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
