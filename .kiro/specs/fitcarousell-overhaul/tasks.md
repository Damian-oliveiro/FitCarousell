# Implementation Plan: FitCarousell Overhaul

## Overview

This plan restructures FitCarousell from a fitness-tracking app into a fitness-social-marketplace hybrid. Implementation proceeds in layers: database schema first, then navigation/routing, then individual features from simplest to most complex, finishing with cross-cutting concerns like advertisements. Each task builds on previous ones so there's no orphaned code.

## Tasks

- [x] 1. Database schema extensions and test setup
  - [x] 1.1 Add new database tables and schema modifications
    - Create a migration SQL file at `supabase/migration_overhaul.sql` with all new tables: `chat_threads`, `chat_messages`, `offers`, `listing_spotlights`, `seller_ratings`, `groups`, `group_members`, `group_events`, `challenges`, `advertisements`
    - Add `status` and `sold_to` columns to the existing `listings` table
    - Add all new indexes defined in the design document
    - Enable Supabase Realtime on `chat_messages` table
    - Add RLS policies for all new tables following existing patterns
    - Add triggers: `handle_join_group` (increment `member_count`), `handle_leave_group` (decrement `member_count`)
    - _Requirements: 3.2, 4.2, 4.3, 5.2, 6.1, 7.2, 9.1, 9.2, 11.1_

  - [x] 1.2 Set up Vitest and testing dependencies
    - Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, and `fast-check` as dev dependencies
    - Create `vitest.config.js` with jsdom environment and React plugin
    - Add `"test": "vitest --run"` script to `package.json`
    - Create `src/test/setup.js` with `@testing-library/jest-dom` imports
    - _Requirements: All (testing infrastructure)_

- [x] 2. Navigation and routing restructure
  - [x] 2.1 Create FooterNav component
    - Create `src/components/FooterNav.jsx` with 5 tabs: Home (`/`), Market (`/marketplace`), Record (`/record`), Groups (`/groups`), You (`/profile`)
    - Each tab renders an icon and text label using `NavLink` from react-router-dom
    - Active tab uses `isActive` prop or a custom match for sub-routes (e.g., `/marketplace/chat/123` highlights Market tab)
    - Create `src/components/FooterNav.css` with fixed-bottom positioning, `z-index` to stay above content, and distinct active-state styling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 2.2 Update Layout component and route structure
    - Rewrite `src/components/Layout.jsx` to remove the header nav and render only `<main>` with `<Outlet />` and `<FooterNav />`
    - Add bottom padding to `<main>` so content is not obscured by the fixed FooterNav
    - Update `src/App.jsx` route structure: change index route from `/activities` redirect to render `HomeFeed`, add routes for `/marketplace`, `/marketplace/:id`, `/marketplace/chat/:threadId`, `/record`, `/groups`, `/groups/:id`, `/profile`
    - Change `AuthRoute` to redirect authenticated users to `/` instead of `/activities`
    - Change fallback `*` route to redirect to `/`
    - Add `ChatProvider` wrapping the Layout inside `DataProvider`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 2.1, 2.5_

  - [ ]* 2.3 Write property test for sub-route parent tab highlighting
    - **Property 3: Sub-route highlights correct parent tab**
    - For any sub-route path under a known parent section, verify FooterNav marks the correct parent tab as active
    - Use fast-check to generate arbitrary sub-route paths (e.g., `/marketplace/anything`, `/groups/uuid`)
    - **Validates: Requirements 2.6**

- [x] 3. Record page placeholder
  - [x] 3.1 Implement Record page
    - Create `src/pages/Record.jsx` displaying a heading "Record" and a paragraph with "coming soon" text
    - Create `src/pages/Record.css` for basic styling
    - Verify the page renders when navigating to `/record` and is protected by `ProtectedRoute`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 4. Home Feed with infinite scroll
  - [x] 4.1 Implement HomeFeed page component
    - Create `src/pages/HomeFeed.jsx` that fetches feed posts using `fetchFeedPosts` from DataContext with offset-based pagination (20 per batch)
    - Implement infinite scroll using an IntersectionObserver on a sentinel element at the bottom of the feed
    - Display loading indicator while fetching additional posts
    - Display error state with retry button when fetch fails
    - Display empty state message when no posts are available, prompting user to share an activity
    - Create `src/pages/HomeFeed.css` for feed layout styling
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 1.7_

  - [x] 4.2 Implement FeedCard and AdFeedCard components
    - Create `src/components/FeedCard.jsx` to render an activity post (user name, avatar, activity details, caption, likes, comments)
    - Create `src/components/AdFeedCard.jsx` to render an advertisement card with "Sponsored" label, image, title, and link navigation
    - Create utility function `intersperseFeedWithAds(organicPosts, ads)` in `src/utils/feedUtils.js` that inserts ads at a max ratio of 1:5 and returns zero ads if organic posts < 5
    - _Requirements: 1.3, 11.2, 11.3, 11.4_

  - [ ]* 4.3 Write property test for feed chronological ordering
    - **Property 1: Feed posts are in reverse chronological order**
    - Generate arrays of feed posts with arbitrary distinct timestamps; verify the sort function produces strictly descending order
    - **Validates: Requirements 1.2**

  - [ ]* 4.4 Write property test for advertisement interspersing ratio
    - **Property 2: Advertisement interspersing respects ratio constraints**
    - Generate varying counts of organic posts and ads; verify at most 1 ad per 5 organic posts, and zero ads if organic < 5
    - **Validates: Requirements 1.3, 11.3**

- [x] 5. Checkpoint - Ensure navigation and feed work end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Marketplace enhancements — listing management
  - [x] 6.1 Implement CreateListingForm component
    - Create `src/components/CreateListingForm.jsx` with fields: title (1-100 chars), description (max 500 chars), price (0.01-99999999.99), category dropdown [Running, Cycling, Swimming, Fitness, Electronics], condition dropdown [Brand New, Like New, Good, Fair], icon image
    - Form validates on submit; displays inline validation errors and preserves form data on failure
    - On successful submission, calls `createListing` from DataContext and closes the form
    - Only rendered when user has merchant role
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 6.2 Implement enhanced Marketplace page with search and filter
    - Rewrite `src/pages/Marketplace.jsx` to include: "Create Listing" button (merchant only), search bar with case-insensitive substring matching, category filter buttons [All, Running, Cycling, Swimming, Fitness, Electronics], listing grid display
    - Display ListingCards in grid showing title, price, condition badge, category badge, seller name, and image
    - Display empty state when no listings match search/filter criteria
    - Update `src/pages/Marketplace.css` for grid layout and filter bar
    - _Requirements: 3.1, 3.4, 3.6, 3.7, 3.8_

  - [x] 6.3 Implement ListingDetail page
    - Create `src/pages/ListingDetail.jsx` at route `/marketplace/:id`
    - Display full listing information: title, description, price, condition, category, seller display name, merchant badge if applicable
    - Show "Chat with Seller" button if viewer is not the seller
    - Show "Make Offer" button if viewer is not the seller and listing is not sold
    - Show "Spotlight" button if viewer is the seller and has merchant role
    - Create `src/pages/ListingDetail.css`
    - _Requirements: 3.5, 4.1, 5.1, 6.1_

  - [ ]* 6.4 Write property test for listing creation validation
    - **Property 4: Listing creation validation**
    - Generate arbitrary listing inputs; verify creation succeeds iff title is 1-100 chars, price is 0.01-99999999.99, category is in allowed set, and condition is in allowed set
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 6.5 Write property test for marketplace search
    - **Property 5: Marketplace search returns correct subset**
    - Generate arbitrary query strings and listing sets; verify search results include all and only listings whose title contains query as case-insensitive substring
    - **Validates: Requirements 3.6**

  - [ ]* 6.6 Write property test for marketplace category filter
    - **Property 6: Marketplace category filter returns correct subset**
    - Generate arbitrary category selections and listing sets; verify filter results match expected subset
    - **Validates: Requirements 3.7**

  - [ ]* 6.7 Write property test for listings sorted by created_at
    - **Property 21: Listings sorted by creation date descending**
    - Generate arbitrary listing arrays with distinct timestamps; verify sort produces descending order
    - **Validates: Requirements 3.4**

- [x] 7. Chat system
  - [x] 7.1 Implement ChatContext provider
    - Create `src/context/ChatContext.jsx` providing: `threads`, `messages`, `unreadCounts`, `sendMessage(threadId, content)`, `openOrCreateThread(listingId, sellerId)`, `subscribeToThread(threadId)`, `markAsRead(threadId)`
    - Subscribe to Supabase Realtime channel for `chat_messages` inserts
    - Maintain per-thread message arrays and compute unread counts
    - Handle reconnection with exponential backoff (1s, 2s, 4s, max 30s)
    - _Requirements: 4.2, 4.3, 4.5, 4.7_

  - [x] 7.2 Implement ChatThreadList and ChatThread components
    - Create `src/pages/MarketplaceChat.jsx` at route `/marketplace/chat/:threadId`
    - Create `src/components/ChatThreadList.jsx` showing all threads for current user with unread badges
    - Create `src/components/ChatThread.jsx` displaying messages in chronological order with sender name and timestamp
    - Create `src/components/ChatInput.jsx` with validation (1-1000 chars), send button, and retry on failure
    - Create `src/components/MessageBubble.jsx` for individual message rendering with error/retry state
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 7.3 Write property test for chat thread idempotency
    - **Property 7: Chat thread creation is idempotent**
    - For any (buyer_id, listing_id) pair, simulate multiple open-or-create calls; verify same thread ID returned each time
    - **Validates: Requirements 4.2**

  - [ ]* 7.4 Write property test for message chronological order
    - **Property 8: Chat messages display in chronological order**
    - Generate message arrays with distinct timestamps; verify sort produces ascending order
    - **Validates: Requirements 4.4**

  - [ ]* 7.5 Write property test for unread count accuracy
    - **Property 9: Unread count equals unread messages**
    - Generate message sets with varying read states and sender IDs; verify unread count formula
    - **Validates: Requirements 4.5**

  - [ ]* 7.6 Write property test for message content validation
    - **Property 10: Message content validation**
    - Generate arbitrary strings; verify validation accepts iff length is 1-1000 inclusive
    - **Validates: Requirements 4.6**

- [x] 8. Offer system
  - [x] 8.1 Implement offer submission and display
    - Create `src/components/OfferForm.jsx` with amount input validated between 0.01 and listing price
    - Add `submitOffer(listingId, amount)` to DataContext that inserts into `offers` table and creates an 'offer' type message in the chat thread
    - Create `src/components/OfferMessage.jsx` rendering offer amount with Accept/Decline buttons for the seller
    - Block offer submission if listing status is "sold"
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 8.2 Implement offer acceptance and decline logic
    - Add `acceptOffer(offerId)` to DataContext: updates offer status to 'accepted', sets listing status to 'sold', declines all other pending offers on the same listing, sends system messages to affected buyers
    - Add `declineOffer(offerId)` to DataContext: updates offer status to 'declined', sends notification message to buyer
    - Allow buyer to submit a new offer after decline if listing is still active
    - _Requirements: 5.5, 5.6, 5.7_

  - [ ]* 8.3 Write property test for offer amount validation
    - **Property 11: Offer amount validation**
    - Generate arbitrary amounts and listing prices; verify offer is accepted iff amount is in [0.01, listing_price] and listing is not sold
    - **Validates: Requirements 5.2, 5.3**

  - [ ]* 8.4 Write property test for accepting offer state transitions
    - **Property 12: Accepting an offer transitions listing and sibling offers**
    - Generate listings with N pending offers; verify accepting one sets listing to "sold" and all others to "declined"
    - **Validates: Requirements 5.5**

- [x] 9. Checkpoint - Ensure marketplace, chat, and offers work together
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Spotlight feature
  - [x] 10.1 Implement spotlight activation and display
    - Add `activateSpotlight(listingId)` to DataContext that inserts into `listing_spotlights` with `expires_at = now() + 7 days`
    - Prevent duplicate activation if listing already has active spotlight
    - Create `src/components/SpotlightSection.jsx` showing up to 6 spotlighted listings ordered by `activated_at` descending
    - Add spotlight badge rendering on `ListingCard` and `ListingDetail` for active spotlights
    - Modify marketplace listing sort to place active-spotlighted listings above non-spotlighted
    - Filter out expired spotlights client-side by checking `expires_at` against current time
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 10.2 Write property test for spotlight ordering and expiry
    - **Property 13: Spotlight ordering and expiry**
    - Generate listings with various spotlight states (active, expired, none); verify active-spotlighted appear first, max 6 in featured, expired excluded
    - **Validates: Requirements 6.3, 6.4, 6.5**

- [x] 11. Seller rating system
  - [x] 11.1 Implement seller rating submission and display
    - Create `src/components/RatingForm.jsx` with star selector (1-5) and optional text review (max 500 chars)
    - Add `submitRating(listingId, sellerId, score, review)` to DataContext with validations: buyer ≠ seller, no duplicate rating per (listing_id, buyer_id)
    - Create `src/components/SellerRatings.jsx` displaying ratings in reverse chronological order with pagination (20 per page)
    - Add average rating display (rounded to 1 decimal) and total count on ListingCard and seller profile; show "No ratings yet" when count is 0
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 11.2 Write property test for seller rating validation
    - **Property 14: Seller rating validation**
    - Generate arbitrary rating inputs; verify acceptance iff score is 1-5, review ≤ 500 chars, buyer ≠ seller, no prior rating for same (listing, buyer)
    - **Validates: Requirements 7.2, 7.3, 7.4**

  - [ ]* 11.3 Write property test for average rating computation
    - **Property 15: Average seller rating computation**
    - Generate sets of scores (1-5); verify average equals arithmetic mean rounded to 1 decimal, and empty set displays "No ratings yet"
    - **Validates: Requirements 7.5**

  - [ ]* 11.4 Write property test for rating pagination ordering
    - **Property 16: Seller ratings paginated in reverse chronological order**
    - Generate >20 ratings with distinct timestamps; verify first page returns 20 in descending order, no duplicates across pages
    - **Validates: Requirements 7.6**

- [x] 12. Groups page
  - [x] 12.1 Implement Groups page and GroupDetail
    - Create `src/pages/Groups.jsx` displaying up to 50 groups with name, description (max 200 chars), and member count
    - Add Join/Leave buttons per group; handle join (increment count), leave (decrement count), and duplicate join prevention
    - Create `src/pages/GroupDetail.jsx` at `/groups/:id` showing group feed posts, events, and challenges for members
    - Add `joinGroup`, `leaveGroup`, `fetchGroups`, `fetchGroupDetail` to DataContext
    - Create `src/pages/Groups.css` and `src/pages/GroupDetail.css`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.7, 9.8_

  - [x] 12.2 Implement group events and challenges
    - Create `src/components/GroupEvents.jsx` rendering events with date, time, location, description
    - Create `src/components/GroupChallenges.jsx` rendering challenges with goal, start date, end date
    - Add `createGroupEvent` and `createChallenge` functions to DataContext (merchant/admin only)
    - _Requirements: 9.5, 9.6_

  - [ ]* 12.3 Write property test for group membership count consistency
    - **Property 17: Group membership count consistency**
    - Simulate sequences of join/leave operations; verify member_count always equals actual membership row count
    - **Validates: Requirements 9.2, 9.8**

- [x] 13. Profile page updates
  - [x] 13.1 Enhance Profile page
    - Rewrite `src/pages/Profile.jsx` to display: display name, avatar (or default placeholder), role, account creation date (formatted as month and year)
    - Add inline edit form for display name with validation (2-50 chars, letters/numbers/spaces only)
    - Display activity statistics: total distance (km), total duration (hours and minutes), activity count, events joined count, followers count, following count
    - Keep existing "Log Out" button that signs out, clears session, and navigates to `/login`
    - Handle server errors on profile update: show error message, retain edited input
    - Update `src/pages/Profile.css`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

  - [ ]* 13.2 Write property test for display name validation
    - **Property 18: Display name validation**
    - Generate arbitrary strings; verify validation succeeds iff trimmed length is 2-50 and matches `[a-zA-Z0-9 ]+`
    - **Validates: Requirements 10.4, 10.5**

  - [ ]* 13.3 Write property test for activity statistics computation
    - **Property 19: Activity statistics computation**
    - Generate sets of activities with arbitrary distances and durations; verify totals match sums
    - **Validates: Requirements 10.9**

- [x] 14. Advertisements in home feed
  - [x] 14.1 Implement advertisement management and feed integration
    - Create `src/components/AdForm.jsx` for merchants to create advertisements (title max 100 chars, image, link to listing or group event)
    - Add `createAdvertisement`, `editAdvertisement`, `deleteAdvertisement`, `fetchActiveAds` to DataContext
    - Integrate ad fetching into HomeFeed, using `intersperseFeedWithAds` utility to intersperse into feed
    - Filter out ads whose linked listing or event no longer exists
    - Display edit/delete options when merchant views their own ad
    - Navigate to linked listing detail or group event detail on ad tap
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ]* 14.2 Write property test for ads with deleted entities excluded
    - **Property 20: Advertisements with deleted entities are excluded**
    - Generate ad sets with some referencing non-existent entities; verify those are excluded from feed
    - **Validates: Requirements 11.5**

- [x] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses Vitest + fast-check for all testing
- All components use plain CSS (no CSS-in-JS or utility frameworks)
- Supabase client is already configured at `src/lib/supabase.js`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3", "3.1"] },
    { "id": 3, "tasks": ["4.1", "6.1"] },
    { "id": 4, "tasks": ["4.2", "6.2", "6.3"] },
    { "id": 5, "tasks": ["4.3", "4.4", "6.4", "6.5", "6.6", "6.7"] },
    { "id": 6, "tasks": ["7.1"] },
    { "id": 7, "tasks": ["7.2", "7.3", "7.4", "7.5", "7.6"] },
    { "id": 8, "tasks": ["8.1"] },
    { "id": 9, "tasks": ["8.2", "8.3", "8.4"] },
    { "id": 10, "tasks": ["10.1"] },
    { "id": 11, "tasks": ["10.2", "11.1"] },
    { "id": 12, "tasks": ["11.2", "11.3", "11.4", "12.1"] },
    { "id": 13, "tasks": ["12.2", "12.3"] },
    { "id": 14, "tasks": ["13.1"] },
    { "id": 15, "tasks": ["13.2", "13.3"] },
    { "id": 16, "tasks": ["14.1"] },
    { "id": 17, "tasks": ["14.2"] }
  ]
}
```
