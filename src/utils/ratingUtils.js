/**
 * Rating utility functions for the seller rating system.
 */

/**
 * Validates and submits a seller rating.
 * @param {object} supabase - Supabase client instance
 * @param {object} params - Rating parameters
 * @param {string} params.listingId - The listing being rated
 * @param {string} params.buyerId - The buyer submitting the rating
 * @param {string} params.sellerId - The seller being rated
 * @param {number} params.score - Rating score (1-5 integer)
 * @param {string} [params.review] - Optional text review (max 500 chars)
 * @returns {Promise<{data: object|null, error: string|null}>}
 */
export async function submitRating(supabase, { listingId, buyerId, sellerId, score, review }) {
  // Validate score is 1-5 integer
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return { data: null, error: 'Please select a rating between 1 and 5' }
  }

  // Validate review length if provided
  if (review && review.length > 500) {
    return { data: null, error: 'Review must be under 500 characters' }
  }

  // Validate buyer is not the seller
  if (buyerId === sellerId) {
    return { data: null, error: 'Cannot rate your own listing' }
  }

  // Check for existing rating for this (listing_id, buyer_id)
  const { data: existing, error: checkError } = await supabase
    .from('seller_ratings')
    .select('id')
    .eq('listing_id', listingId)
    .eq('buyer_id', buyerId)
    .maybeSingle()

  if (checkError) {
    return { data: null, error: 'Failed to check existing ratings' }
  }

  if (existing) {
    return { data: null, error: 'Already rated this transaction' }
  }

  // Insert rating
  const insertData = {
    listing_id: listingId,
    buyer_id: buyerId,
    seller_id: sellerId,
    score,
  }

  if (review && review.trim().length > 0) {
    insertData.review = review.trim()
  }

  const { data, error: insertError } = await supabase
    .from('seller_ratings')
    .insert(insertData)
    .select()
    .single()

  if (insertError) {
    return { data: null, error: 'Failed to submit rating' }
  }

  return { data, error: null }
}

/**
 * Computes the average rating and count from an array of ratings.
 * @param {Array<{score: number}>} ratings - Array of rating objects with score field
 * @returns {{average: number, count: number}} - Average rounded to 1 decimal, and total count
 */
export function computeAverageRating(ratings) {
  if (!ratings || ratings.length === 0) {
    return { average: 0, count: 0 }
  }

  const sum = ratings.reduce((acc, r) => acc + r.score, 0)
  const average = Math.round((sum / ratings.length) * 10) / 10

  return { average, count: ratings.length }
}
