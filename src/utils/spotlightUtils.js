/**
 * Spotlight utility functions for managing listing spotlights.
 * A spotlight promotes a listing for 7 days, making it more visible in the marketplace.
 */

/**
 * Activates a spotlight for a listing. Inserts into listing_spotlights
 * with expires_at = now + 7 days.
 *
 * @param {object} supabase - The Supabase client instance
 * @param {string} listingId - The listing ID to spotlight
 * @returns {Promise<{data: object|null, error: string|null}>}
 */
export async function activateSpotlight(supabase, listingId) {
  // Check if an active (non-expired) spotlight already exists for this listing
  const now = new Date().toISOString()
  const { data: existing, error: checkError } = await supabase
    .from('listing_spotlights')
    .select('id, expires_at')
    .eq('listing_id', listingId)
    .gt('expires_at', now)
    .maybeSingle()

  if (checkError) {
    return { data: null, error: 'Failed to check spotlight status' }
  }

  if (existing) {
    return { data: null, error: 'This listing is already spotlighted' }
  }

  // Calculate expires_at = now + 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error: insertError } = await supabase
    .from('listing_spotlights')
    .upsert(
      {
        listing_id: listingId,
        activated_at: new Date().toISOString(),
        expires_at: expiresAt,
      },
      { onConflict: 'listing_id' }
    )
    .select()
    .single()

  if (insertError) {
    return { data: null, error: 'Failed to activate spotlight' }
  }

  return { data, error: null }
}

/**
 * Checks if a spotlight is currently active (not expired).
 *
 * @param {object} spotlight - A spotlight record with expires_at field
 * @returns {boolean}
 */
export function isSpotlightActive(spotlight) {
  if (!spotlight || !spotlight.expires_at) return false
  return new Date(spotlight.expires_at) > new Date()
}

/**
 * Filters a list of spotlights to only include active (non-expired) ones.
 *
 * @param {Array} spotlights - Array of spotlight records
 * @returns {Array} Only active spotlights
 */
export function filterActiveSpotlights(spotlights) {
  if (!spotlights) return []
  return spotlights.filter(isSpotlightActive)
}

/**
 * Sorts listings so that actively spotlighted listings appear first,
 * followed by non-spotlighted listings in their original order.
 *
 * @param {Array} listings - Array of listing objects
 * @param {Array} activeSpotlightIds - Set or array of listing IDs with active spotlights
 * @returns {Array} Sorted listings
 */
export function sortListingsWithSpotlight(listings, activeSpotlightIds) {
  const spotlightSet = new Set(activeSpotlightIds)
  return [...listings].sort((a, b) => {
    const aSpotlighted = spotlightSet.has(a.id)
    const bSpotlighted = spotlightSet.has(b.id)
    if (aSpotlighted && !bSpotlighted) return -1
    if (!aSpotlighted && bSpotlighted) return 1
    return 0 // preserve original order within groups
  })
}
