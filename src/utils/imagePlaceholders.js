// Placeholder images for marketplace and feed
// Using loremflickr for category-matched sport images
// Using placehold.co for route maps

export const sportImages = {
  shoes: "https://loremflickr.com/600/400/running-shoes?lock=11",
  kettlebell: "https://loremflickr.com/600/400/kettlebell,gym?lock=12",
  headphones: "https://loremflickr.com/600/400/sports-headphones?lock=13",
  football: "https://loremflickr.com/600/400/football?lock=14",
  bicycle: "https://loremflickr.com/600/400/road-bike?lock=15",
  smartwatch: "https://loremflickr.com/600/400/smartwatch,fitness?lock=16",
  runningWatch: "https://loremflickr.com/600/400/running-watch?lock=17",
  cyclingHelmet: "https://loremflickr.com/600/400/cycling-helmet?lock=18",
  swimmingGoggles: "https://loremflickr.com/600/400/swimming-goggles?lock=19",
  yogaMat: "https://loremflickr.com/600/400/yoga-mat?lock=20",
  dumbbells: "https://loremflickr.com/600/400/dumbbells,gym?lock=21",
  pullupBar: "https://loremflickr.com/600/400/gym-equipment?lock=22",
  resistanceBand: "https://loremflickr.com/600/400/resistance-band?lock=23",
  tennisRacket: "https://loremflickr.com/600/400/tennis-racket?lock=24",
  basketball: "https://loremflickr.com/600/400/basketball?lock=25",
  sportsBag: "https://loremflickr.com/600/400/gym-bag?lock=26",
  foamRoller: "https://loremflickr.com/600/400/foam-roller,fitness?lock=27",
  jumpRope: "https://loremflickr.com/600/400/jump-rope,fitness?lock=28",
  waterBottle: "https://loremflickr.com/600/400/water-bottle,sport?lock=29",
  compression: "https://loremflickr.com/600/400/compression-tights?lock=30",
}

export const routeMaps = {
  route1: "https://placehold.co/800x300/e8f5dc/f05a00?text=Morning+5K+Route",
  route2: "https://placehold.co/800x300/e6f4df/f05a00?text=Coastal+Run",
  route3: "https://placehold.co/800x300/e9f7e5/f05a00?text=Park+Loop",
  route4: "https://placehold.co/800x300/e5f1db/f05a00?text=Evening+Run",
  route5: "https://placehold.co/800x300/ecf5e0/f05a00?text=Trail+Run",
  route6: "https://placehold.co/800x300/e4f0da/f05a00?text=Hill+Repeats",
  route7: "https://placehold.co/800x300/e7f3dd/f05a00?text=Long+Run",
  route8: "https://placehold.co/800x300/eaf6e2/f05a00?text=Recovery+Jog",
  route9: "https://placehold.co/800x300/e3efda/f05a00?text=Interval+Session",
  route10: "https://placehold.co/800x300/ebf6e3/f05a00?text=City+Loop",
}

// Arrays for easy random access
export const sportImageList = Object.values(sportImages)
export const routeMapList = Object.values(routeMaps)

// Category-matched images for marketplace listings
export const categoryImages = {
  Running: [
    "https://loremflickr.com/600/400/running-shoes?lock=31",
    "https://loremflickr.com/600/400/running-shorts?lock=32",
    "https://loremflickr.com/600/400/running-watch?lock=33",
    "https://loremflickr.com/600/400/running-vest?lock=34",
    "https://loremflickr.com/600/400/running-belt?lock=35",
  ],
  Cycling: [
    "https://loremflickr.com/600/400/road-bike?lock=36",
    "https://loremflickr.com/600/400/cycling-helmet?lock=37",
    "https://loremflickr.com/600/400/cycling-jersey?lock=38",
    "https://loremflickr.com/600/400/bike-computer?lock=39",
    "https://loremflickr.com/600/400/cycling-gloves?lock=40",
  ],
  Swimming: [
    "https://loremflickr.com/600/400/swimming-goggles?lock=41",
    "https://loremflickr.com/600/400/swim-cap?lock=42",
    "https://loremflickr.com/600/400/swim-fins?lock=43",
    "https://loremflickr.com/600/400/swimsuit,sport?lock=44",
    "https://loremflickr.com/600/400/pool-swimming?lock=45",
  ],
  Fitness: [
    "https://loremflickr.com/600/400/dumbbells,gym?lock=46",
    "https://loremflickr.com/600/400/yoga-mat?lock=47",
    "https://loremflickr.com/600/400/kettlebell,gym?lock=48",
    "https://loremflickr.com/600/400/resistance-band?lock=49",
    "https://loremflickr.com/600/400/foam-roller?lock=50",
  ],
  Electronics: [
    "https://loremflickr.com/600/400/smartwatch,fitness?lock=51",
    "https://loremflickr.com/600/400/fitness-tracker?lock=52",
    "https://loremflickr.com/600/400/sports-headphones?lock=53",
    "https://loremflickr.com/600/400/heart-rate-monitor?lock=54",
    "https://loremflickr.com/600/400/bike-computer?lock=55",
  ],
}

/**
 * Get a category-matched image for a marketplace listing.
 * Uses the item index to pick a different image each time.
 */
export function getCategoryImage(category, index = 0) {
  const images = categoryImages[category] || sportImageList
  return images[index % images.length]
}
