/**
 * Mock data for development and testing.
 * Provides scrollable content for HomeFeed, Marketplace, and Groups.
 */

import { getCategoryImage } from './imagePlaceholders'

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
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=400&fit=crop',
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
    'HIIT Bootcamp Session',
    'Long Run Weekend',
    'Recovery Yoga + Coffee',
    'Sprint Challenge',
    'Full Marathon - City Race',
    'Coastal Loop Run',
    'Night Run City Tour',
    'Pilates Core Strength',
    'Walking Club - Seniors Welcome',
    'Marathon Pace Run',
    'CrossFit Community WOD',
    'Outdoor Yoga Session',
    'Half Marathon Training',
    'Cycling Endurance Ride',
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
    'City Hall Starting Point',
    'Tanjong Beach Sentosa',
    'Changi Coastal Walk',
    'ActiveSG Gym Tampines',
  ]

  const EVENT_DESCRIPTIONS = [
    'Friendly group run for all paces. We regroup at every kilometer marker. No one left behind.',
    'Moderate pace run through scenic trails. Bring headlamp if joining early. Water provided at checkpoints.',
    'High intensity interval training on the track. 400m repeats with 90 second recovery. All fitness levels welcome.',
    'Building up for race day. Steady pace at 5:30-6:00 min/km. Hydration stations along the way.',
    'Easy pace run followed by brunch at the nearby cafe. Great way to start the weekend.',
    'Timed sprints with full recovery. Push your limits. Warm-up at 6:45am, sprints start at 7am sharp.',
    'Full 42.195km certified course through the city. Timing chip included. Finisher medal for all.',
    'Beginner-friendly yoga flow in the park. Mats provided. Ends with cold brew from our sponsor.',
    'Walk at your own pace along the scenic coastal trail. 5km route with rest stops every 1km.',
    'Reformer Pilates session focused on core and posture. Limited to 15 pax. Equipment provided.',
    'Endurance ride along East Coast. 60km route, average speed 28-32km/h. Regroup every 20km.',
    'Community workout of the day. Scaled options available. All equipment provided.',
  ]

  const EVENT_PRICING = [
    { price: 0, label: 'Free' },
    { price: 0, label: 'Free' },
    { price: 15, label: '$15/pax' },
    { price: 0, label: 'Free' },
    { price: 10, label: '$10 (includes coffee)' },
    { price: 0, label: 'Free' },
    { price: 85, label: '$85 (Early bird)' },
    { price: 20, label: '$20/session' },
    { price: 0, label: 'Free' },
    { price: 35, label: '$35/session' },
    { price: 0, label: 'Free' },
    { price: 25, label: '$25 (includes meal)' },
  ]

  const EVENT_PRIZES = [
    null,
    null,
    'Top 3 finishers win $50 voucher',
    null,
    null,
    'Fastest time wins Garmin watch',
    '1st: $500, 2nd: $300, 3rd: $100',
    null,
    null,
    null,
    'Complete all 4 weeks to win Nike gear pack',
    'Random draw: 2x $100 gift cards',
  ]

  const EVENT_ORGANIZERS = [
    'Nike Run Club',
    'RunSG Community',
    'Adidas Runners',
    'Endurance Lab SG',
    'Lululemon Studio',
    'New Balance Running',
    'Singapore Marathon Org',
    'Under Armour Training',
    'ASICS FrontRunner',
    'Garmin Sports',
    'Hoka One One',
    'Puma Nitro Club',
  ]

  // Activity-matched cover images for groups/events
  const EVENT_IMAGES = [
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=250&fit=crop', // running group
    'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=250&fit=crop', // trail running
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=250&fit=crop', // gym/HIIT
    'https://images.unsplash.com/photo-1461897104016-0b3b00b1ea56?w=600&h=250&fit=crop', // runners outdoors
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=250&fit=crop', // yoga
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=250&fit=crop', // cycling
    'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=600&h=250&fit=crop', // marathon crowd
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=250&fit=crop', // yoga/pilates
    'https://images.unsplash.com/photo-1486218119243-13883505764c?w=600&h=250&fit=crop', // trail
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=250&fit=crop', // fitness
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=250&fit=crop', // swimming
    'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&h=250&fit=crop', // cycling group
  ]

  // Event activity type for filtering
  const EVENT_TYPES = ['Running', 'Running', 'Fitness', 'Running', 'Yoga', 'Running', 'Marathon', 'Yoga', 'Walking', 'Pilates', 'Cycling', 'Running', 'CrossFit', 'Yoga', 'Marathon', 'Cycling']

  return Array.from({ length: count }, (_, i) => {
    const pricing = EVENT_PRICING[i % EVENT_PRICING.length]
    const prize = EVENT_PRIZES[i % EVENT_PRIZES.length]
    const eventType = EVENT_TYPES[i % EVENT_TYPES.length]
    return {
      id: randomId(),
      name: GROUP_NAMES[i % GROUP_NAMES.length],
      description: GROUP_DESCRIPTIONS[i % GROUP_DESCRIPTIONS.length],
      member_count: Math.floor(Math.random() * 200 + 5),
      created_by: randomId(),
      created_at: randomDate(180),
      cover_image: EVENT_IMAGES[i % EVENT_IMAGES.length],
      upcoming_event: {
        title: EVENT_TITLES[i % EVENT_TITLES.length],
        description: EVENT_DESCRIPTIONS[i % EVENT_DESCRIPTIONS.length],
        location: EVENT_LOCATIONS[i % EVENT_LOCATIONS.length],
        date: new Date(Date.now() + (i + 1) * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: `${6 + (i % 4)}:${i % 2 === 0 ? '00' : '30'} AM`,
        map_image: EVENT_IMAGES[(i + 3) % EVENT_IMAGES.length],
        price: pricing.price,
        priceLabel: pricing.label,
        prize,
        organizer: EVENT_ORGANIZERS[i % EVENT_ORGANIZERS.length],
        spotsLeft: Math.floor(Math.random() * 30 + 2),
        eventType,
      },
    }
  })
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

// ===== MERCHANT SHOP ITEMS =====
export function generateMerchantShopItems() {
  const brands = [
    { name: 'Nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop' },
    { name: 'Adidas', logo: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=300&h=200&fit=crop' },
    { name: 'Asics', logo: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=300&h=200&fit=crop' },
    { name: 'Garmin', logo: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=300&h=200&fit=crop' },
  ]

  const items = [
    // Nike
    { brand: 'Nike', title: 'Nike Pegasus 41', price: 189.99, category: 'Running', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop', description: 'Responsive cushioning for everyday runs. Updated mesh upper for breathability.' },
    { brand: 'Nike', title: 'Nike Dri-FIT ADV', price: 65.00, category: 'Running', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=400&fit=crop', description: 'Advanced moisture-wicking running shirt. Lightweight and fast-drying.' },
    { brand: 'Nike', title: 'Nike Vaporfly 3', price: 349.99, category: 'Running', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=400&fit=crop', description: 'Race-day carbon fiber plate shoe. ZoomX foam for maximum energy return.' },
    { brand: 'Nike', title: 'Nike Flex Stride Shorts', price: 55.00, category: 'Running', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=400&fit=crop', description: 'Flexible running shorts with inner brief. Reflective details for low light.' },
    // Adidas
    { brand: 'Adidas', title: 'Adidas Ultraboost 24', price: 229.99, category: 'Running', image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=400&fit=crop', description: 'Boost midsole with Continental rubber outsole. Primeknit upper adapts to your foot.' },
    { brand: 'Adidas', title: 'Adidas Adizero Adios Pro 3', price: 299.99, category: 'Running', image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=400&fit=crop', description: 'Competition racing flat with EnergyRods. Sub-2 hour marathon technology.' },
    { brand: 'Adidas', title: 'Adidas Terrex Free Hiker', price: 199.99, category: 'Running', image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&h=400&fit=crop', description: 'Trail running shoe with Boost cushioning. Continental grip for technical terrain.' },
    { brand: 'Adidas', title: 'Adidas Own The Run Tee', price: 45.00, category: 'Fitness', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&h=400&fit=crop', description: 'AEROREADY moisture-absorbing running tee. Lightweight recycled materials.' },
    // Asics
    { brand: 'Asics', title: 'Asics Gel-Nimbus 26', price: 199.99, category: 'Running', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=400&fit=crop', description: 'Premium cushioned neutral runner. PureGEL technology for soft landings.' },
    { brand: 'Asics', title: 'Asics GT-2000 12', price: 159.99, category: 'Running', image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&h=400&fit=crop', description: 'Stability running shoe with FF Blast cushioning. Great for overpronators.' },
    { brand: 'Asics', title: 'Asics Metaspeed Sky+', price: 329.99, category: 'Running', image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=400&fit=crop', description: 'Carbon plate racing shoe for stride runners. Motion Wrap upper for lockdown fit.' },
    { brand: 'Asics', title: 'Asics Running Cap', price: 32.00, category: 'Running', image: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&h=400&fit=crop', description: 'Lightweight performance running cap. Mesh panels for ventilation. UV protection.' },
    // Garmin
    { brand: 'Garmin', title: 'Garmin Forerunner 265', price: 549.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=400&fit=crop', description: 'AMOLED GPS running watch. Training readiness, race predictor, and recovery advisor.' },
    { brand: 'Garmin', title: 'Garmin Forerunner 965', price: 799.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop', description: 'Premium triathlon smartwatch. Full color maps, multi-band GPS, titanium bezel.' },
    { brand: 'Garmin', title: 'Garmin HRM-Pro Plus', price: 179.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=600&h=400&fit=crop', description: 'Chest strap heart rate monitor. Running dynamics, ground contact time, vertical oscillation.' },
    { brand: 'Garmin', title: 'Garmin Edge 840', price: 499.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=400&fit=crop', description: 'Touchscreen cycling computer. Turn-by-turn navigation, power meter compatible.' },
  ]

  return { brands, items: items.map(item => ({ ...item, id: randomId(), status: 'active' })) }
}

// ===== USED MARKETPLACE ITEMS =====
const WEAR_LEVELS = ['Like New - Used once', 'Good - Minor wear', 'Fair - Visible wear', 'Well-loved - Heavy use']

export function generateUsedListings(count = 100) {
  // Each item has a title, its correct category, and a matching image
  const USED_ITEMS = [
    // ===== RUNNING (22 items) =====
    { title: 'Nike Air Zoom Tempo (6 months)', category: 'Running', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop' },
    { title: 'Saucony Endorphin Speed 3', category: 'Running', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=400&fit=crop' },
    { title: 'Running Shorts - Lululemon', category: 'Running', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=400&fit=crop' },
    { title: 'Race Number Belt', category: 'Running', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop' },
    { title: 'Reflective Running Jacket', category: 'Running', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop' },
    { title: 'Adidas Ultraboost 22 (Worn twice)', category: 'Running', image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=400&fit=crop' },
    { title: 'Brooks Ghost 15 (Lightly used)', category: 'Running', image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=400&fit=crop' },
    { title: 'Asics Gel-Nimbus 25', category: 'Running', image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&h=400&fit=crop' },
    { title: 'Running Sunglasses - Oakley Radar', category: 'Running', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=400&fit=crop' },
    { title: 'Hydration Vest - Salomon ADV Skin', category: 'Running', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop' },
    { title: 'Nike Pegasus 39 (Used 3 months)', category: 'Running', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop' },
    { title: 'Hoka Bondi 8 (3 months old)', category: 'Running', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=400&fit=crop' },
    { title: 'Compression Socks (3 pairs)', category: 'Running', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=400&fit=crop' },
    { title: 'Running Belt - FlipBelt Classic', category: 'Running', image: 'https://images.unsplash.com/photo-1461897104016-0b3b00b1ea56?w=600&h=400&fit=crop' },
    { title: 'New Balance FuelCell RC Elite', category: 'Running', image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=400&fit=crop' },
    { title: 'Running Armband - Phone Holder', category: 'Running', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop' },
    { title: 'Trail Running Shoes - Salomon Speedcross', category: 'Running', image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=400&fit=crop' },
    { title: 'Running Cap - Nike AeroBill', category: 'Running', image: 'https://images.unsplash.com/photo-1461897104016-0b3b00b1ea56?w=600&h=400&fit=crop' },
    { title: 'Asics Gel-Kayano 29 Stability', category: 'Running', image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&h=400&fit=crop' },
    { title: 'Running Gloves - Touchscreen', category: 'Running', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop' },
    { title: 'Hoka Clifton 9 (Barely worn)', category: 'Running', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=400&fit=crop' },
    { title: 'Running Headlamp - Black Diamond', category: 'Running', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop' },

    // ===== CYCLING (22 items) =====
    { title: 'Trek Domane AL3 Frame', category: 'Cycling', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop' },
    { title: 'Bike Bottle Cage Set', category: 'Cycling', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop' },
    { title: 'Cycling Computer Mount', category: 'Cycling', image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&h=400&fit=crop' },
    { title: 'Chain Cleaning Kit', category: 'Cycling', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop' },
    { title: 'Bike Saddle - Fizik Argo', category: 'Cycling', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop' },
    { title: 'Road Bike Helmet - Specialized Prevail', category: 'Cycling', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop' },
    { title: 'Cycling Jersey - Castelli Aero', category: 'Cycling', image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&h=400&fit=crop' },
    { title: 'Wahoo KICKR Snap Trainer', category: 'Cycling', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop' },
    { title: 'Cycling Gloves - Pearl Izumi Elite', category: 'Cycling', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop' },
    { title: 'Bike Repair Stand - Park Tool', category: 'Cycling', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop' },
    { title: 'Cycling Shorts - Rapha Core', category: 'Cycling', image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&h=400&fit=crop' },
    { title: 'Indoor Cycling Shoes - Shimano RC3', category: 'Cycling', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop' },
    { title: 'Bike Pump - Topeak Floor', category: 'Cycling', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop' },
    { title: 'Cycling Sunglasses - POC Aspire', category: 'Cycling', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop' },
    { title: 'Bike Lock - Kryptonite U-Lock', category: 'Cycling', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop' },
    { title: 'Cycling Bib Shorts - Assos', category: 'Cycling', image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&h=400&fit=crop' },
    { title: 'Bike Multi-Tool - Crankbrothers', category: 'Cycling', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop' },
    { title: 'Cycling Wind Jacket - Castelli', category: 'Cycling', image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&h=400&fit=crop' },
    { title: 'Bike Rear Light - Garmin Varia', category: 'Cycling', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop' },
    { title: 'Helmet - Giro Aether MIPS', category: 'Cycling', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop' },
    { title: 'Bike Trainer Mat - Wahoo', category: 'Cycling', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop' },
    { title: 'Carbon Road Wheelset - Zipp 303', category: 'Cycling', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop' },

    // ===== SWIMMING (22 items) =====
    { title: 'Speedo Vanquisher Goggles', category: 'Swimming', image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=400&fit=crop' },
    { title: 'Pull Buoy - TYR', category: 'Swimming', image: 'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=600&h=400&fit=crop' },
    { title: 'Lap Counter Watch', category: 'Swimming', image: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&h=400&fit=crop' },
    { title: 'Swim Bag - Arena Team 45', category: 'Swimming', image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=600&h=400&fit=crop' },
    { title: 'Nose Clip + Earplugs Set', category: 'Swimming', image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&h=400&fit=crop' },
    { title: 'Swimming Kickboard - Speedo', category: 'Swimming', image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=400&fit=crop' },
    { title: 'Swim Fins - Speedo Biofuse', category: 'Swimming', image: 'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=600&h=400&fit=crop' },
    { title: 'Swim Paddles - Finis Agility', category: 'Swimming', image: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&h=400&fit=crop' },
    { title: 'Waterproof Swim MP3 Player', category: 'Swimming', image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=600&h=400&fit=crop' },
    { title: 'Swim Snorkel - Centre Mount', category: 'Swimming', image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&h=400&fit=crop' },
    { title: 'Arena Racing Swimsuit', category: 'Swimming', image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=400&fit=crop' },
    { title: 'Swim Cap - Silicone Pro', category: 'Swimming', image: 'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=600&h=400&fit=crop' },
    { title: 'Pool Mesh Bag - Equipment', category: 'Swimming', image: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&h=400&fit=crop' },
    { title: 'Swimming Goggles - Arena Cobra', category: 'Swimming', image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=400&fit=crop' },
    { title: 'Triathlon Wetsuit - Orca', category: 'Swimming', image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=600&h=400&fit=crop' },
    { title: 'Swim Training Fins - Short Blade', category: 'Swimming', image: 'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=600&h=400&fit=crop' },
    { title: 'Aqua Resistance Gloves', category: 'Swimming', image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&h=400&fit=crop' },
    { title: 'Drag Shorts - Swimming Training', category: 'Swimming', image: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&h=400&fit=crop' },
    { title: 'Tempo Trainer Pro - Finis', category: 'Swimming', image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=600&h=400&fit=crop' },
    { title: 'Anti-Fog Spray + Goggle Case', category: 'Swimming', image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=400&fit=crop' },
    { title: 'Open Water Swim Buoy - Safety', category: 'Swimming', image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&h=400&fit=crop' },
    { title: 'Kickboard + Pull Buoy Combo', category: 'Swimming', image: 'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=600&h=400&fit=crop' },

    // ===== FITNESS (22 items) =====
    { title: 'Olympic Barbell 20kg', category: 'Fitness', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop' },
    { title: 'Gym Gloves - RDX Leather', category: 'Fitness', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop' },
    { title: 'Foam Plyo Box - 3-in-1', category: 'Fitness', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop' },
    { title: 'Gym Chalk Bag + Liquid Chalk', category: 'Fitness', image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop' },
    { title: 'Wrist Wraps - Rogue Fitness', category: 'Fitness', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop' },
    { title: 'Resistance Bands Set (5 pack)', category: 'Fitness', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop' },
    { title: 'Yoga Mat - Manduka PRO 6mm', category: 'Fitness', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop' },
    { title: 'Kettlebell 16kg Cast Iron', category: 'Fitness', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop' },
    { title: 'Doorframe Pull-up Bar', category: 'Fitness', image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop' },
    { title: 'Gym Duffel Bag - Nike Brasilia', category: 'Fitness', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop' },
    { title: 'TRX Suspension Trainer Pro', category: 'Fitness', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop' },
    { title: 'Adjustable Dumbbells 2-24kg', category: 'Fitness', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop' },
    { title: 'Battle Ropes 12m Heavy Duty', category: 'Fitness', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop' },
    { title: 'Ab Roller Wheel + Knee Pad', category: 'Fitness', image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop' },
    { title: 'Speed Jump Rope - Weighted', category: 'Fitness', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop' },
    { title: 'Foam Roller - Trigger Point Grid', category: 'Fitness', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop' },
    { title: 'Theragun Mini Massage Gun', category: 'Fitness', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop' },
    { title: 'Weight Plates 20kg Pair', category: 'Fitness', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop' },
    { title: 'Yoga Wheel - Cork Premium', category: 'Fitness', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop' },
    { title: 'Medicine Ball 8kg - Slam', category: 'Fitness', image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop' },
    { title: 'Lifting Belt - Leather 10mm', category: 'Fitness', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop' },
    { title: 'Gym Towel + Spray Bottle Set', category: 'Fitness', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop' },

    // ===== ELECTRONICS (22 items) =====
    { title: 'Garmin Venu 2S (Like new)', category: 'Electronics', image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=400&fit=crop' },
    { title: 'Jabra Elite Active 75t', category: 'Electronics', image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&h=400&fit=crop' },
    { title: 'Wahoo TICKR Fit Armband HR', category: 'Electronics', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=400&fit=crop' },
    { title: 'Cycling Power Meter - Stages', category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop' },
    { title: 'GPS Running Pod - Stryd', category: 'Electronics', image: 'https://images.unsplash.com/photo-1510017803434-a899b57da54f?w=600&h=400&fit=crop' },
    { title: 'Garmin Forerunner 245 Watch', category: 'Electronics', image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=400&fit=crop' },
    { title: 'Apple Watch SE (GPS)', category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop' },
    { title: 'Fitbit Charge 5 Tracker', category: 'Electronics', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=400&fit=crop' },
    { title: 'Polar Vantage V2 Multisport', category: 'Electronics', image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=400&fit=crop' },
    { title: 'Coros PACE 3 GPS Watch', category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop' },
    { title: 'Beats Powerbeats Pro (Sport)', category: 'Electronics', image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&h=400&fit=crop' },
    { title: 'Wahoo ELEMNT Bolt Bike Computer', category: 'Electronics', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=400&fit=crop' },
    { title: 'Garmin HRM-Pro Chest Strap', category: 'Electronics', image: 'https://images.unsplash.com/photo-1510017803434-a899b57da54f?w=600&h=400&fit=crop' },
    { title: 'Samsung Galaxy Watch 5 Pro', category: 'Electronics', image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=400&fit=crop' },
    { title: 'AirPods Pro 2 (Sport tips)', category: 'Electronics', image: 'https://images.unsplash.com/photo-1510017803434-a899b57da54f?w=600&h=400&fit=crop' },
    { title: 'Suunto 9 Peak Pro', category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop' },
    { title: 'Whoop 4.0 Band + Membership', category: 'Electronics', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=400&fit=crop' },
    { title: 'Garmin Edge 530 Cycling GPS', category: 'Electronics', image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=400&fit=crop' },
    { title: 'Shokz OpenRun Pro Headphones', category: 'Electronics', image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&h=400&fit=crop' },
    { title: 'Garmin Instinct 2 Solar', category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop' },
    { title: 'Polar H10 Heart Rate Sensor', category: 'Electronics', image: 'https://images.unsplash.com/photo-1510017803434-a899b57da54f?w=600&h=400&fit=crop' },
    { title: 'Amazfit T-Rex Ultra GPS Watch', category: 'Electronics', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=400&fit=crop' },
  ]

  return Array.from({ length: count }, (_, i) => {
    const item = USED_ITEMS[i % USED_ITEMS.length]
    return {
      id: randomId(),
      title: item.title,
      description: `Selling my ${item.title.toLowerCase()}. Well maintained, condition detailed below. Pick up or meet up available.`,
      price: +(Math.random() * 200 + 5).toFixed(2),
      category: item.category,
      condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
      wear: WEAR_LEVELS[Math.floor(Math.random() * WEAR_LEVELS.length)],
      image: item.image,
      status: 'active',
      seller_id: randomId(),
      created_at: randomDate(30),
      type: 'used',
      profiles: {
        display_name: randomName(),
        role: 'individual',
      },
    }
  })
}

// ===== BLOG POSTS =====
const INFLUENCER_NAMES = ['Coach Maya', 'RunWithJake', 'FitNadia', 'TrailBlazerTom', 'CycleQueenSara', 'SwimCoachLee', 'StrengthByAlex', 'YogaWithRen']

const BLOG_TITLES = [
  'How I Went From Couch to Marathon in 6 Months',
  '5 Common Running Mistakes That Are Slowing You Down',
  'The Science Behind Zone 2 Training',
  'Why Recovery Is More Important Than Training',
  'My Top 10 Post-Run Stretches',
  'Nutrition Tips for Your First Half Marathon',
  'How to Stay Motivated When Training Alone',
  'The Best Time of Day to Run (Backed by Research)',
  'Cross-Training: Why Runners Should Lift Weights',
  'How I Manage Running with a Full-Time Job',
  'Beginner\'s Guide to Heart Rate Training',
  'Trail Running vs Road Running: Which Is Better?',
]

const BLOG_BODIES = [
  'I started my running journey with barely being able to run 1km without stopping. Here\'s how I built up to completing my first marathon, the setbacks I faced, and what kept me going through the toughest training blocks...',
  'After coaching hundreds of runners, I see the same mistakes over and over. From going too fast on easy days to neglecting hip mobility, these fixes alone could shave minutes off your PB...',
  'Zone 2 training revolutionized my endurance. By slowing down 80% of my runs, I actually got faster at racing. Here\'s the science behind why easy running builds a stronger aerobic engine...',
  'Overtraining nearly ended my running career. I learned the hard way that your body gets stronger during rest, not during the workout. Here are the recovery protocols I now swear by...',
  'Flexibility is the most underrated aspect of running performance. These 10 stretches target the key muscles that tighten during running and prevent the most common injuries...',
  'Fueling for a half marathon is different from your daily runs. I break down what to eat in the weeks before, the morning of, and during the race itself...',
  'Solo training is tough mentally. Here are the psychological strategies and habit-building techniques I use to get out the door even when motivation is zero...',
  'Morning vs evening runs — the research actually has a clear answer, but it might not be what you expect. I break down cortisol patterns, injury rates, and performance data...',
  'I was a runner who avoided the gym for years. When I finally started lifting, my running improved dramatically. Here\'s a simple 2x/week strength program for runners...',
  'Balancing 50km/week with a demanding career requires ruthless time management. These are my non-negotiable habits for fitting training into a busy life...',
  'Heart rate training transformed my approach to running. No more junk miles. I explain the zones, how to find your thresholds, and how to structure your week around them...',
  'I\'ve done both extensively. Trails build strength and mental toughness; roads build speed. Here\'s when to choose each and how to mix them for optimal fitness...',
]

export function generateMockBlogPosts(count = 8) {
  const BLOG_IMAGES = [
    ['https://images.unsplash.com/photo-1461897104016-0b3b00b1ea56?w=400&h=300&fit=crop'],
    ['https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop'],
    ['https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=400&h=300&fit=crop'],
    [],
    ['https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=300&fit=crop'],
    ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'],
    ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop'],
    [],
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: randomId(),
    _type: 'blog',
    title: BLOG_TITLES[i % BLOG_TITLES.length],
    body: BLOG_BODIES[i % BLOG_BODIES.length],
    images: BLOG_IMAGES[i % BLOG_IMAGES.length],
    created_at: randomDate(21),
    likes_count: Math.floor(Math.random() * 200 + 10),
    comments_count: Math.floor(Math.random() * 40 + 2),
    profiles: {
      display_name: INFLUENCER_NAMES[i % INFLUENCER_NAMES.length],
      avatar_url: null,
      role: 'individual',
      is_influencer: true,
    },
  }))
}
