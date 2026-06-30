// Sport-specific placeholder images using Unsplash source (reliable, always sport-related)
// Each image has a unique sig param to prevent duplicates

export const sportImages = {
  shoes: 'https://source.unsplash.com/600x400/?running-shoes&sig=1',
  kettlebell: 'https://source.unsplash.com/600x400/?kettlebell&sig=2',
  headphones: 'https://source.unsplash.com/600x400/?sport-headphones&sig=3',
  bicycle: 'https://source.unsplash.com/600x400/?road-bicycle&sig=4',
  smartwatch: 'https://source.unsplash.com/600x400/?fitness-watch&sig=5',
  cyclingHelmet: 'https://source.unsplash.com/600x400/?cycling-helmet&sig=6',
  swimmingGoggles: 'https://source.unsplash.com/600x400/?swimming-pool&sig=7',
  yogaMat: 'https://source.unsplash.com/600x400/?yoga-mat&sig=8',
  dumbbells: 'https://source.unsplash.com/600x400/?dumbbells-gym&sig=9',
  foamRoller: 'https://source.unsplash.com/600x400/?foam-roller&sig=10',
  jumpRope: 'https://source.unsplash.com/600x400/?jump-rope&sig=11',
  sportsBag: 'https://source.unsplash.com/600x400/?gym-bag&sig=12',
}

// Category-matched images for marketplace listings
// Using picsum.photos with specific sport-related seeds that are verified to look good
export const categoryImages = {
  Running: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=400&fit=crop',
  ],
  Cycling: [
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&h=400&fit=crop',
  ],
  Swimming: [
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=600&h=400&fit=crop',
  ],
  Fitness: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop',
  ],
  Electronics: [
    'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1510017803434-a899b57da54f?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=400&fit=crop',
  ],
}

export const sportImageList = Object.values(sportImages)

/**
 * Get a category-matched image for a marketplace listing.
 */
export function getCategoryImage(category, index = 0) {
  const images = categoryImages[category] || categoryImages.Fitness
  return images[index % images.length]
}
