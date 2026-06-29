import { describe, it, expect, vi } from 'vitest'
import { acceptOffer, declineOffer } from './offerUtils'

// Helper to create a mock supabase client
function createMockSupabase(overrides = {}) {
  const defaultResponse = { data: null, error: null }

  const mockFrom = (table) => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(defaultResponse),
      maybeSingle: vi.fn().mockResolvedValue(defaultResponse),
      order: vi.fn().mockReturnThis(),
    }

    // Apply any overrides for this table
    if (overrides[table]) {
      overrides[table](chain)
    }

    return chain
  }

  return { from: vi.fn(mockFrom) }
}

describe('offerUtils', () => {
  describe('acceptOffer', () => {
    it('returns error if offer is not found', async () => {
      const mockSupabase = createMockSupabase({
        offers: (chain) => {
          chain.single.mockResolvedValue({ data: null, error: { message: 'Not found' } })
        },
      })

      const result = await acceptOffer(mockSupabase, 'offer-1', 'seller-1')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Offer not found')
    })

    it('returns error if offer is not pending', async () => {
      const mockSupabase = createMockSupabase({
        offers: (chain) => {
          chain.single.mockResolvedValue({
            data: { id: 'offer-1', status: 'accepted', listing_id: 'l1', buyer_id: 'b1', amount: 50 },
            error: null,
          })
        },
      })

      const result = await acceptOffer(mockSupabase, 'offer-1', 'seller-1')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Offer is no longer pending')
    })

    it('returns error if user is not the seller', async () => {
      const callCount = { offers: 0, listings: 0 }
      const mockFrom = (table) => {
        const chain = {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          neq: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          single: vi.fn(),
          maybeSingle: vi.fn(),
          order: vi.fn().mockReturnThis(),
        }

        if (table === 'offers') {
          chain.single.mockResolvedValue({
            data: { id: 'offer-1', status: 'pending', listing_id: 'l1', buyer_id: 'b1', amount: 50 },
            error: null,
          })
        } else if (table === 'listings') {
          chain.single.mockResolvedValue({
            data: { id: 'l1', seller_id: 'other-seller', status: 'active' },
            error: null,
          })
        }

        return chain
      }

      const mockSupabase = { from: vi.fn(mockFrom) }
      const result = await acceptOffer(mockSupabase, 'offer-1', 'wrong-seller')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Only the seller can accept offers')
    })

    it('returns error if listing is already sold', async () => {
      const mockFrom = (table) => {
        const chain = {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          neq: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          single: vi.fn(),
          maybeSingle: vi.fn(),
          order: vi.fn().mockReturnThis(),
        }

        if (table === 'offers') {
          chain.single.mockResolvedValue({
            data: { id: 'offer-1', status: 'pending', listing_id: 'l1', buyer_id: 'b1', amount: 50 },
            error: null,
          })
        } else if (table === 'listings') {
          chain.single.mockResolvedValue({
            data: { id: 'l1', seller_id: 'seller-1', status: 'sold' },
            error: null,
          })
        }

        return chain
      }

      const mockSupabase = { from: vi.fn(mockFrom) }
      const result = await acceptOffer(mockSupabase, 'offer-1', 'seller-1')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Listing already sold')
    })

    it('successfully accepts offer, updates listing, declines other offers, and sends messages', async () => {
      const insertedMessages = []
      const updatedTables = []

      const mockFrom = (table) => {
        const chain = {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn((data) => {
            if (table === 'chat_messages') insertedMessages.push(data)
            return chain
          }),
          update: vi.fn((data) => {
            updatedTables.push({ table, data })
            return chain
          }),
          eq: vi.fn().mockReturnThis(),
          neq: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: null, error: null }),
          single: vi.fn(),
          maybeSingle: vi.fn(),
          order: vi.fn().mockReturnThis(),
        }

        // Default resolvers
        chain.single.mockResolvedValue({ data: null, error: null })
        chain.maybeSingle.mockResolvedValue({ data: null, error: null })

        if (table === 'offers') {
          // First call: fetch the offer; subsequent calls: fetch other pending offers
          let offerCallCount = 0
          chain.single.mockImplementation(() => {
            offerCallCount++
            if (offerCallCount === 1) {
              return Promise.resolve({
                data: { id: 'offer-1', status: 'pending', listing_id: 'l1', buyer_id: 'buyer-1', amount: 50 },
                error: null,
              })
            }
            return Promise.resolve({ data: null, error: null })
          })
          // For select of other pending offers
          chain.neq.mockReturnValue({
            ...chain,
            then: (resolve) => resolve({ data: [{ id: 'offer-2', buyer_id: 'buyer-2' }], error: null }),
          })
        } else if (table === 'listings') {
          chain.single.mockResolvedValue({
            data: { id: 'l1', seller_id: 'seller-1', status: 'active' },
            error: null,
          })
        } else if (table === 'chat_threads') {
          chain.maybeSingle.mockResolvedValue({
            data: { id: 'thread-1' },
            error: null,
          })
          chain.single.mockResolvedValue({
            data: { id: 'thread-1' },
            error: null,
          })
        }

        return chain
      }

      const mockSupabase = { from: vi.fn(mockFrom) }
      const result = await acceptOffer(mockSupabase, 'offer-1', 'seller-1')

      expect(result.success).toBe(true)
      // Verify offers table was updated
      expect(mockSupabase.from).toHaveBeenCalledWith('offers')
      // Verify listings table was updated
      expect(mockSupabase.from).toHaveBeenCalledWith('listings')
      // Verify chat_messages were sent
      expect(mockSupabase.from).toHaveBeenCalledWith('chat_messages')
    })
  })

  describe('declineOffer', () => {
    it('returns error if offer is not found', async () => {
      const mockSupabase = createMockSupabase({
        offers: (chain) => {
          chain.single.mockResolvedValue({ data: null, error: { message: 'Not found' } })
        },
      })

      const result = await declineOffer(mockSupabase, 'offer-1', 'seller-1')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Offer not found')
    })

    it('returns error if offer is not pending', async () => {
      const mockSupabase = createMockSupabase({
        offers: (chain) => {
          chain.single.mockResolvedValue({
            data: { id: 'offer-1', status: 'declined', listing_id: 'l1', buyer_id: 'b1', amount: 50 },
            error: null,
          })
        },
      })

      const result = await declineOffer(mockSupabase, 'offer-1', 'seller-1')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Offer is no longer pending')
    })

    it('returns error if user is not the seller', async () => {
      const mockFrom = (table) => {
        const chain = {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          neq: vi.fn().mockReturnThis(),
          single: vi.fn(),
          maybeSingle: vi.fn(),
          order: vi.fn().mockReturnThis(),
        }

        if (table === 'offers') {
          chain.single.mockResolvedValue({
            data: { id: 'offer-1', status: 'pending', listing_id: 'l1', buyer_id: 'b1', amount: 50 },
            error: null,
          })
        } else if (table === 'listings') {
          chain.single.mockResolvedValue({
            data: { id: 'l1', seller_id: 'other-seller' },
            error: null,
          })
        }

        return chain
      }

      const mockSupabase = { from: vi.fn(mockFrom) }
      const result = await declineOffer(mockSupabase, 'offer-1', 'wrong-user')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Only the seller can decline offers')
    })

    it('successfully declines offer and sends notification', async () => {
      const mockFrom = (table) => {
        const chain = {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          neq: vi.fn().mockReturnThis(),
          single: vi.fn(),
          maybeSingle: vi.fn(),
          order: vi.fn().mockReturnThis(),
        }

        chain.single.mockResolvedValue({ data: null, error: null })
        chain.maybeSingle.mockResolvedValue({ data: null, error: null })

        if (table === 'offers') {
          chain.single.mockResolvedValue({
            data: { id: 'offer-1', status: 'pending', listing_id: 'l1', buyer_id: 'buyer-1', amount: 75 },
            error: null,
          })
        } else if (table === 'listings') {
          chain.single.mockResolvedValue({
            data: { id: 'l1', seller_id: 'seller-1' },
            error: null,
          })
        } else if (table === 'chat_threads') {
          chain.maybeSingle.mockResolvedValue({
            data: { id: 'thread-1' },
            error: null,
          })
        }

        return chain
      }

      const mockSupabase = { from: vi.fn(mockFrom) }
      const result = await declineOffer(mockSupabase, 'offer-1', 'seller-1')

      expect(result.success).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('offers')
      expect(mockSupabase.from).toHaveBeenCalledWith('chat_threads')
      expect(mockSupabase.from).toHaveBeenCalledWith('chat_messages')
    })
  })
})
