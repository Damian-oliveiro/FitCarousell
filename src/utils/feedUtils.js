/**
 * Intersperses advertisements among organic feed posts.
 *
 * Rules:
 * - If organicPosts has fewer than 5 items, return only organic posts (no ads).
 * - Otherwise, insert 1 ad after every 5 organic posts.
 * - Ads are drawn from the ads array in order; if ads run out, remaining slots get no ad.
 *
 * @param {Array} organicPosts - Array of organic feed post objects
 * @param {Array} ads - Array of advertisement objects
 * @returns {Array} Mixed array with ads interspersed (each ad marked with _type: 'ad')
 */
export function intersperseFeedWithAds(organicPosts, ads) {
  if (!organicPosts || organicPosts.length < 5) {
    return organicPosts ? [...organicPosts] : []
  }

  if (!ads || ads.length === 0) {
    return [...organicPosts]
  }

  const result = []
  let adIndex = 0

  for (let i = 0; i < organicPosts.length; i++) {
    result.push(organicPosts[i])

    // After every 5th organic post, insert an ad if available
    if ((i + 1) % 5 === 0 && adIndex < ads.length) {
      result.push({ ...ads[adIndex], _type: 'ad' })
      adIndex++
    }
  }

  return result
}
