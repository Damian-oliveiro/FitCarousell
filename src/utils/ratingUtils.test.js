import { describe, it, expect, vi } from 'vitest'
import { submitRating, computeAverageRating } from './ratingUtils'

describe('computeAverageRating', () => {
  it('returns 0 average and 0 count for empty array', () => {
    const result = computeAverageRating([])
    expect(result).toEqual({ average: 0, count: 0 })
  })

  it('returns 0 average and 0 count for null/undefined', () => {
    expect(computeAverageRating(null)).toEqual({ average: 0, count: 0 })
    expect(computeAverageRating(undefined)).toEqual({ average: 0, count: 0 })
  })

  it('computes correct average for a single rating', () => {
    const result = computeAverageRating([{ score: 4 }])
    expect(result).toEqual({ average: 4, count: 1 })
  })

  it('computes correct average for multiple ratings', () => {
    const result = computeAverageRating([{ score: 3 }, { score: 5 }, { score: 4 }])
    expect(result).toEqual({ average: 4, count: 3 })
  })

  it('rounds to 1 decimal place', () => {
    const result = computeAverageRating([{ score: 1 }, { score: 2 }, { score: 3 }])
    expect(result).toEqual({ average: 2, count: 3 })
  })

  it('rounds correctly with non-terminating decimal', () => {
    // (1+2+2) / 3 = 5/3 = 1.666... => 1.7
    const result = computeAverageRating([{ score: 1 }, { score: 2 }, { score: 2 }])
    expect(result).toEqual({ average: 1.7, count: 3 })
  })
})

describe('submitRating', () => {
  function createMockSupabase({ existingRating = null, insertResult = null, checkError = null, insertError = null }) {
    return {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: existingRating,
                error: checkError,
              }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: insertResult,
              error: insertError,
            }),
          }),
        }),
      }),
    }
  }

  it('rejects score below 1', async () => {
    const mockSupabase = createMockSupabase({})
    const result = await submitRating(mockSupabase, {
      listingId: 'l1',
      buyerId: 'b1',
      sellerId: 's1',
      score: 0,
    })
    expect(result.error).toBe('Please select a rating between 1 and 5')
    expect(result.data).toBeNull()
  })

  it('rejects score above 5', async () => {
    const mockSupabase = createMockSupabase({})
    const result = await submitRating(mockSupabase, {
      listingId: 'l1',
      buyerId: 'b1',
      sellerId: 's1',
      score: 6,
    })
    expect(result.error).toBe('Please select a rating between 1 and 5')
  })

  it('rejects non-integer score', async () => {
    const mockSupabase = createMockSupabase({})
    const result = await submitRating(mockSupabase, {
      listingId: 'l1',
      buyerId: 'b1',
      sellerId: 's1',
      score: 3.5,
    })
    expect(result.error).toBe('Please select a rating between 1 and 5')
  })

  it('rejects review over 500 characters', async () => {
    const mockSupabase = createMockSupabase({})
    const result = await submitRating(mockSupabase, {
      listingId: 'l1',
      buyerId: 'b1',
      sellerId: 's1',
      score: 4,
      review: 'x'.repeat(501),
    })
    expect(result.error).toBe('Review must be under 500 characters')
  })

  it('rejects when buyer is the seller', async () => {
    const mockSupabase = createMockSupabase({})
    const result = await submitRating(mockSupabase, {
      listingId: 'l1',
      buyerId: 'same-user',
      sellerId: 'same-user',
      score: 5,
    })
    expect(result.error).toBe('Cannot rate your own listing')
  })

  it('accepts valid score at boundary (1)', async () => {
    const mockSupabase = createMockSupabase({ insertResult: { id: 'r1', score: 1 } })
    const result = await submitRating(mockSupabase, {
      listingId: 'l1',
      buyerId: 'b1',
      sellerId: 's1',
      score: 1,
    })
    expect(result.error).toBeNull()
    expect(result.data).toEqual({ id: 'r1', score: 1 })
  })

  it('accepts valid score at boundary (5)', async () => {
    const mockSupabase = createMockSupabase({ insertResult: { id: 'r2', score: 5 } })
    const result = await submitRating(mockSupabase, {
      listingId: 'l1',
      buyerId: 'b1',
      sellerId: 's1',
      score: 5,
    })
    expect(result.error).toBeNull()
    expect(result.data).toEqual({ id: 'r2', score: 5 })
  })

  it('accepts review at exactly 500 characters', async () => {
    const mockSupabase = createMockSupabase({ insertResult: { id: 'r3', score: 3 } })
    const result = await submitRating(mockSupabase, {
      listingId: 'l1',
      buyerId: 'b1',
      sellerId: 's1',
      score: 3,
      review: 'a'.repeat(500),
    })
    expect(result.error).toBeNull()
  })
})
