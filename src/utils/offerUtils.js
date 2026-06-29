/**
 * Offer utility functions for accepting and declining marketplace offers.
 * These functions handle the full transaction flow including status updates,
 * listing state changes, and notification messages in chat threads.
 */

/**
 * Accept an offer — performs the full acceptance transaction:
 * 1. Fetches the offer to get listing_id and buyer_id
 * 2. Updates offer status to 'accepted'
 * 3. Updates listing: status='sold', sold_to=buyer_id
 * 4. Declines all other pending offers on the same listing
 * 5. Sends 'offer_accepted' message in the chat thread between buyer and seller
 * 6. For each declined offer's buyer, sends 'offer_declined' message in their chat threads
 *
 * @param {object} supabaseClient - The Supabase client instance
 * @param {string} offerId - The ID of the offer to accept
 * @param {string} userId - The ID of the seller accepting the offer
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function acceptOffer(supabaseClient, offerId, userId) {
  try {
    // 1. Fetch the offer details
    const { data: offer, error: fetchError } = await supabaseClient
      .from('offers')
      .select('*')
      .eq('id', offerId)
      .single()

    if (fetchError || !offer) {
      return { success: false, error: 'Offer not found' }
    }

    if (offer.status !== 'pending') {
      return { success: false, error: 'Offer is no longer pending' }
    }

    const { listing_id, buyer_id, amount } = offer

    // Verify the listing exists and belongs to the user
    const { data: listing, error: listingError } = await supabaseClient
      .from('listings')
      .select('id, seller_id, status')
      .eq('id', listing_id)
      .single()

    if (listingError || !listing) {
      return { success: false, error: 'Listing not found' }
    }

    if (listing.seller_id !== userId) {
      return { success: false, error: 'Only the seller can accept offers' }
    }

    if (listing.status === 'sold') {
      return { success: false, error: 'Listing already sold' }
    }

    // 2. Update offer status to 'accepted'
    const { error: acceptError } = await supabaseClient
      .from('offers')
      .update({ status: 'accepted' })
      .eq('id', offerId)

    if (acceptError) {
      return { success: false, error: 'Failed to accept offer' }
    }

    // 3. Update listing: status='sold', sold_to=buyer_id
    const { error: listingUpdateError } = await supabaseClient
      .from('listings')
      .update({ status: 'sold', sold_to: buyer_id })
      .eq('id', listing_id)

    if (listingUpdateError) {
      return { success: false, error: 'Failed to update listing status' }
    }

    // 4. Decline all other pending offers on the same listing
    const { data: otherOffers, error: otherOffersError } = await supabaseClient
      .from('offers')
      .select('id, buyer_id')
      .eq('listing_id', listing_id)
      .eq('status', 'pending')
      .neq('id', offerId)

    if (!otherOffersError && otherOffers && otherOffers.length > 0) {
      const otherOfferIds = otherOffers.map((o) => o.id)

      await supabaseClient
        .from('offers')
        .update({ status: 'declined' })
        .in('id', otherOfferIds)
    }

    // 5. Send 'offer_accepted' message in the chat thread between buyer and seller
    const acceptedThread = await findOrCreateThread(
      supabaseClient,
      listing_id,
      buyer_id,
      userId
    )

    if (acceptedThread) {
      await supabaseClient.from('chat_messages').insert({
        thread_id: acceptedThread.id,
        sender_id: userId,
        content: `Offer of $${parseFloat(amount).toFixed(2)} has been accepted! 🎉`,
        message_type: 'offer_accepted',
        read: false,
      })
    }

    // 6. For each declined offer's buyer, send 'offer_declined' message
    if (!otherOffersError && otherOffers && otherOffers.length > 0) {
      for (const declinedOffer of otherOffers) {
        const declinedThread = await findOrCreateThread(
          supabaseClient,
          listing_id,
          declinedOffer.buyer_id,
          userId
        )

        if (declinedThread) {
          await supabaseClient.from('chat_messages').insert({
            thread_id: declinedThread.id,
            sender_id: userId,
            content: 'Your offer has been declined. The listing has been sold to another buyer.',
            message_type: 'offer_declined',
            read: false,
          })
        }
      }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

/**
 * Decline an offer — updates status and notifies the buyer:
 * 1. Updates offer status to 'declined'
 * 2. Sends 'offer_declined' notification message to buyer via chat
 *
 * @param {object} supabaseClient - The Supabase client instance
 * @param {string} offerId - The ID of the offer to decline
 * @param {string} userId - The ID of the seller declining the offer
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function declineOffer(supabaseClient, offerId, userId) {
  try {
    // Fetch the offer details
    const { data: offer, error: fetchError } = await supabaseClient
      .from('offers')
      .select('*')
      .eq('id', offerId)
      .single()

    if (fetchError || !offer) {
      return { success: false, error: 'Offer not found' }
    }

    if (offer.status !== 'pending') {
      return { success: false, error: 'Offer is no longer pending' }
    }

    const { listing_id, buyer_id, amount } = offer

    // Verify the listing belongs to the user
    const { data: listing, error: listingError } = await supabaseClient
      .from('listings')
      .select('id, seller_id')
      .eq('id', listing_id)
      .single()

    if (listingError || !listing) {
      return { success: false, error: 'Listing not found' }
    }

    if (listing.seller_id !== userId) {
      return { success: false, error: 'Only the seller can decline offers' }
    }

    // 1. Update offer status to 'declined'
    const { error: declineError } = await supabaseClient
      .from('offers')
      .update({ status: 'declined' })
      .eq('id', offerId)

    if (declineError) {
      return { success: false, error: 'Failed to decline offer' }
    }

    // 2. Send 'offer_declined' message in the chat thread to the buyer
    const thread = await findOrCreateThread(
      supabaseClient,
      listing_id,
      buyer_id,
      userId
    )

    if (thread) {
      await supabaseClient.from('chat_messages').insert({
        thread_id: thread.id,
        sender_id: userId,
        content: `Your offer of $${parseFloat(amount).toFixed(2)} has been declined. You can submit a new offer if the listing is still available.`,
        message_type: 'offer_declined',
        read: false,
      })
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

/**
 * Helper: Find an existing chat thread between buyer and seller for a listing,
 * or create one if it doesn't exist.
 */
async function findOrCreateThread(supabaseClient, listingId, buyerId, sellerId) {
  // Check for existing thread
  const { data: existing, error: fetchError } = await supabaseClient
    .from('chat_threads')
    .select('*')
    .eq('listing_id', listingId)
    .eq('buyer_id', buyerId)
    .maybeSingle()

  if (!fetchError && existing) {
    return existing
  }

  // Create new thread
  const { data: newThread, error: insertError } = await supabaseClient
    .from('chat_threads')
    .insert({
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: sellerId,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error creating chat thread for offer notification:', insertError)
    return null
  }

  return newThread
}
