import { describe, it, expect } from 'vitest'
import { intersperseFeedWithAds } from './feedUtils'

describe('intersperseFeedWithAds', () => {
  it('returns only organic posts when fewer than 5 posts', () => {
    const posts = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const ads = [{ id: 'ad1', title: 'Ad 1' }]
    const result = intersperseFeedWithAds(posts, ads)
    expect(result).toHaveLength(3)
    expect(result.every(item => !item._type)).toBe(true)
  })

  it('returns empty array when no organic posts', () => {
    const result = intersperseFeedWithAds([], [{ id: 'ad1' }])
    expect(result).toEqual([])
  })

  it('returns organic posts when ads array is empty', () => {
    const posts = Array.from({ length: 10 }, (_, i) => ({ id: i }))
    const result = intersperseFeedWithAds(posts, [])
    expect(result).toHaveLength(10)
  })

  it('inserts 1 ad after every 5 organic posts', () => {
    const posts = Array.from({ length: 10 }, (_, i) => ({ id: i }))
    const ads = [{ id: 'ad1', title: 'Ad 1' }, { id: 'ad2', title: 'Ad 2' }]
    const result = intersperseFeedWithAds(posts, ads)

    // 10 organic + 2 ads = 12 items
    expect(result).toHaveLength(12)
    // Ad after 5th post (index 5)
    expect(result[5]._type).toBe('ad')
    expect(result[5].id).toBe('ad1')
    // Ad after 10th post (index 11)
    expect(result[11]._type).toBe('ad')
    expect(result[11].id).toBe('ad2')
  })

  it('does not insert more ads than available', () => {
    const posts = Array.from({ length: 15 }, (_, i) => ({ id: i }))
    const ads = [{ id: 'ad1', title: 'Ad 1' }]
    const result = intersperseFeedWithAds(posts, ads)

    // 15 organic + 1 ad = 16 items (only 1 ad available)
    expect(result).toHaveLength(16)
    const adItems = result.filter(item => item._type === 'ad')
    expect(adItems).toHaveLength(1)
  })

  it('with exactly 5 posts inserts 1 ad after them', () => {
    const posts = Array.from({ length: 5 }, (_, i) => ({ id: i }))
    const ads = [{ id: 'ad1', title: 'Ad 1' }]
    const result = intersperseFeedWithAds(posts, ads)

    expect(result).toHaveLength(6)
    expect(result[5]._type).toBe('ad')
  })

  it('with exactly 4 posts returns no ads', () => {
    const posts = Array.from({ length: 4 }, (_, i) => ({ id: i }))
    const ads = [{ id: 'ad1', title: 'Ad 1' }]
    const result = intersperseFeedWithAds(posts, ads)

    expect(result).toHaveLength(4)
    expect(result.every(item => !item._type)).toBe(true)
  })

  it('handles null/undefined inputs gracefully', () => {
    expect(intersperseFeedWithAds(null, [])).toEqual([])
    expect(intersperseFeedWithAds(undefined, [])).toEqual([])
    expect(intersperseFeedWithAds([], null)).toEqual([])
  })
})
