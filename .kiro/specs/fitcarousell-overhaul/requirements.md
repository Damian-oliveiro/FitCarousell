# Requirements Document

## Introduction

TribeFit is a fitness-social-marketplace hybrid app — a crossover between Strava (fitness tracking and social running community) and Carousell (peer-to-peer marketplace). This overhaul restructures the app's navigation and page architecture to center around a scrollable Home feed, a persistent bottom navigation bar ("hanging footer"), an enhanced Marketplace with chat/offers/spotlight/ratings, a Groups section for community and merchant events, a Record placeholder for future GPS tracking, and a Profile/Settings page.

## Glossary

- **App**: The TribeFit React single-page application
- **Home_Feed**: The scrollable main page showing runs, friends' runs, community runs, and merchant advertisements
- **Footer_Nav**: The persistent bottom navigation bar with five tabs: Home, Marketplace, Record, Groups, You
- **Marketplace**: The Carousell-like section where users list items, chat with sellers, make offers, spotlight listings, and rate transactions
- **Record_Page**: A navigation placeholder for future GPS fitness recording features (distance, pace, maps)
- **Groups_Page**: The section where users join communities, view merchant events, and participate in challenges
- **Profile_Page**: The user profile and settings section
- **Feed_Card**: A single content item in the Home feed (activity post, friend's run, community run, or advertisement)
- **Listing**: A marketplace item posted by a seller with title, description, price, category, condition, and images
- **Spotlight**: A paid promotion option that increases a listing's visibility in the Marketplace
- **Offer**: A buyer's proposed price for a marketplace listing, sent to the seller
- **Seller_Rating**: A numeric score (1–5) with optional text review left by a buyer after a transaction
- **Chat_Thread**: A real-time messaging conversation between a buyer and seller about a specific listing
- **Group**: A community entity that users can join to see shared activities, merchant events, and challenges
- **Challenge**: A time-bound fitness goal created within a Group (e.g., "Run 50km this month")
- **Merchant**: A user with the "merchant" role who can create listings, events, and advertisements
- **Advertisement**: A merchant-created promotional Feed_Card displayed in the Home_Feed
- **Authenticated_User**: A user who has successfully signed in to the App

## Requirements

### Requirement 1: Home Feed as Default Landing Page

**User Story:** As a user, I want to see a scrollable feed of fitness activities when I open the app, so that I can immediately engage with my community's runs and discover content.

#### Acceptance Criteria

1. WHEN an Authenticated_User opens the App, THE App SHALL navigate to the Home_Feed as the default route
2. THE Home_Feed SHALL display Feed_Cards in reverse chronological order based on the Feed_Card's creation timestamp
3. THE Home_Feed SHALL include Feed_Cards from the Authenticated_User's own shared activities, followed users' shared activities, non-followed users' shared activities, and Advertisements from Merchants, where Advertisements appear at a maximum frequency of 1 per every 5 organic Feed_Cards
4. WHEN the Authenticated_User scrolls to the bottom of the currently loaded Feed_Cards, THE Home_Feed SHALL load the next batch of 20 Feed_Cards (infinite scroll)
5. WHILE the Home_Feed is loading additional Feed_Cards, THE App SHALL display a loading indicator below the existing content
6. IF the Home_Feed fails to load Feed_Cards, THEN THE App SHALL display an error message indicating the feed could not be loaded, along with a retry option that re-attempts the failed request when activated
7. IF the Home_Feed has no Feed_Cards to display, THEN THE App SHALL display an empty state message indicating no posts are available and prompting the user to complete and share an activity

### Requirement 2: Persistent Bottom Navigation Bar

**User Story:** As a user, I want a persistent bottom navigation bar so that I can quickly switch between the main sections of the app from any page.

#### Acceptance Criteria

1. THE Footer_Nav SHALL be visible on all authenticated pages of the App and SHALL NOT be rendered on unauthenticated pages (login, registration)
2. THE Footer_Nav SHALL contain exactly five navigation tabs in this fixed left-to-right order: Home, Marketplace, Record, Groups, You, each displaying an icon and a text label
3. WHEN an Authenticated_User taps a tab in the Footer_Nav, THE App SHALL navigate to the corresponding page within 300 milliseconds
4. WHILE an Authenticated_User is on a page, THE Footer_Nav SHALL indicate the active tab by applying a visually distinct color to both the icon and label of the corresponding tab, differentiating it from the inactive tabs
5. THE Footer_Nav SHALL remain fixed at the bottom of the viewport regardless of scroll position and SHALL not overlap or obscure page content (main content area includes sufficient bottom padding)
6. IF an Authenticated_User is on a sub-page that does not directly correspond to a top-level tab, THEN THE Footer_Nav SHALL highlight the parent section tab that the sub-page belongs to

### Requirement 3: Marketplace Listing Management

**User Story:** As a merchant, I want to create, edit, and manage product listings so that I can sell fitness-related items to the community.

#### Acceptance Criteria

1. WHEN a Merchant navigates to the Marketplace, THE Marketplace SHALL display a "Create Listing" button
2. WHEN a Merchant submits a new listing form with a title of 1 to 100 characters, a description of up to 500 characters, a price between 0.01 and 99999999.99, a category selected from [Running, Cycling, Swimming, Fitness, Electronics], a condition selected from [Brand New, Like New, Good, Fair], and an icon image, THE Marketplace SHALL create the Listing and display it in the Marketplace listings
3. IF a Merchant submits the listing form with a missing title or a price of zero or less, THEN THE Marketplace SHALL not create the Listing and SHALL keep the form open with the entered data preserved
4. THE Marketplace SHALL display all Listings in a grid view ordered by creation date descending, showing title, price, condition badge, category badge, seller display name, and image for each Listing
5. WHEN an Authenticated_User taps a Listing, THE Marketplace SHALL display the listing detail view with full description, seller display name, merchant badge if seller is a Merchant, condition, category, price, and a "Contact Seller" button
6. THE Marketplace SHALL allow Authenticated_Users to search Listings by title keyword using case-insensitive substring matching
7. THE Marketplace SHALL allow Authenticated_Users to filter Listings by category using filter buttons for [All, Running, Cycling, Swimming, Fitness, Electronics], where selecting "All" displays every Listing
8. WHEN no Listings match the current search and filter criteria, THE Marketplace SHALL display an empty state message indicating no listings were found

### Requirement 4: Marketplace Chat with Seller

**User Story:** As a buyer, I want to chat with a seller about a listing so that I can ask questions and negotiate before purchasing.

#### Acceptance Criteria

1. WHEN an Authenticated_User views a Listing detail and the Authenticated_User is not the seller of that Listing, THE Marketplace SHALL display a "Chat with Seller" button
2. WHEN an Authenticated_User taps "Chat with Seller", THE App SHALL open the existing Chat_Thread for that Authenticated_User and Listing combination, or create a new Chat_Thread if none exists
3. WHEN a message is sent in a Chat_Thread, THE App SHALL deliver the message to the recipient within 3 seconds under normal network conditions
4. THE Chat_Thread SHALL display messages in chronological order, each showing the sender's display name and a timestamp indicating when the message was sent
5. WHEN an Authenticated_User has unread messages, THE App SHALL display a numeric unread count badge on the relevant Chat_Thread in the chat list
6. IF an Authenticated_User attempts to send an empty message or a message exceeding 1000 characters, THEN THE App SHALL prevent submission and display a validation error indicating the character limit
7. IF a message fails to send due to a network or server error, THEN THE App SHALL display an error indication on the unsent message and provide a retry option

### Requirement 5: Marketplace Offer System

**User Story:** As a buyer, I want to make a price offer on a listing so that I can negotiate a deal with the seller.

#### Acceptance Criteria

1. WHEN an Authenticated_User views a Listing detail that they do not own, THE Marketplace SHALL display a "Make Offer" button
2. WHEN an Authenticated_User submits an Offer with a numeric amount between 0.01 and the Listing price (inclusive), THE App SHALL send the Offer to the Listing seller and display a confirmation message to the buyer
3. IF an Authenticated_User attempts to submit an Offer on a Listing that is already marked as sold, THEN THE App SHALL display an error message indicating the Listing is no longer available and SHALL NOT send the Offer
4. WHEN a seller receives an Offer, THE App SHALL display the Offer amount and buyer identity in the Chat_Thread with Accept and Decline action buttons
5. WHEN a seller accepts an Offer, THE App SHALL mark the Listing as sold, notify the buyer with an in-app message indicating acceptance, and automatically decline all other pending Offers on the same Listing
6. WHEN a seller declines an Offer, THE App SHALL notify the buyer with an in-app message indicating the Offer was declined
7. WHEN a buyer's Offer is declined, THE App SHALL allow the buyer to submit a new Offer on the same Listing if the Listing is not yet marked as sold

### Requirement 6: Marketplace Spotlight (Paid Promotion)

**User Story:** As a merchant, I want to pay to spotlight my listing so that it gets more visibility and appears prominently in the Marketplace.

#### Acceptance Criteria

1. WHEN a Merchant views their own Listing detail, THE Marketplace SHALL display a "Spotlight" action that allows the Merchant to activate a 7-day Spotlight period for that Listing
2. WHEN a Merchant activates Spotlight on a Listing, THE Marketplace SHALL display a visible Spotlight badge on the Listing card and detail view to distinguish it from non-spotlighted Listings
3. WHILE a Listing has active Spotlight, THE Marketplace SHALL display the Listing above all non-spotlighted Listings in search results and browse views
4. THE Marketplace SHALL display up to 6 Spotlighted Listings in a dedicated featured section at the top of the Marketplace page, ordered by most recently activated
5. WHEN a Spotlight period expires after 7 days, THE Marketplace SHALL remove the Spotlight badge and return the Listing to its default position based on creation date
6. IF a Merchant attempts to activate Spotlight on a Listing that already has an active Spotlight, THEN THE Marketplace SHALL display a message indicating that the Listing is already spotlighted and prevent duplicate activation

### Requirement 7: Marketplace Seller Rating System

**User Story:** As a buyer, I want to rate sellers after a transaction so that the community can identify trustworthy sellers.

#### Acceptance Criteria

1. WHEN a buyer confirms receipt of a purchased item from a Listing, THE App SHALL mark the transaction as complete and prompt the buyer to submit a Seller_Rating within the same session
2. WHEN a buyer submits a Seller_Rating, THE App SHALL accept a numeric score between 1 and 5 inclusive, and an optional text review of no more than 500 characters
3. IF a buyer attempts to submit more than one Seller_Rating for the same transaction, THEN THE App SHALL reject the submission and display an error message indicating that the transaction has already been rated
4. IF a buyer attempts to rate a transaction where they are also the seller, THEN THE App SHALL reject the submission and display an error message indicating that users cannot rate their own listings
5. THE Marketplace SHALL display the seller's average rating rounded to one decimal place and total review count on their Listings and profile, or display "No ratings yet" if the seller has zero ratings
6. WHEN an Authenticated_User views a seller's profile, THE App SHALL display Seller_Ratings for that seller in reverse chronological order, loading a maximum of 20 ratings per page

### Requirement 8: Record Page Placeholder

**User Story:** As a user, I want to access a Record tab in the navigation so that the app is ready for future GPS tracking and fitness recording features.

#### Acceptance Criteria

1. WHEN an Authenticated_User taps the "Record" tab in the Footer_Nav, THE App SHALL navigate to the Record_Page
2. THE Record_Page SHALL display a heading with the text "Record" and a placeholder message containing the text "coming soon" to indicate that GPS recording features are not yet available
3. IF an Authenticated_User navigates to the Record_Page URL directly via the browser address bar, THEN THE App SHALL display the Record_Page
4. IF an unauthenticated user attempts to access the Record_Page URL, THEN THE App SHALL redirect the user to the Login page
5. THE Footer_Nav SHALL display the "Record" tab as a navigation item visible on all pages alongside the existing navigation tabs

### Requirement 9: Groups — Community and Events

**User Story:** As a user, I want to join groups so that I can participate in community activities, view merchant events, and take on fitness challenges with others.

#### Acceptance Criteria

1. WHEN an Authenticated_User navigates to the Groups_Page, THE Groups_Page SHALL display a list of up to 50 available Groups, each showing the group name, a short description (max 200 characters), and member count
2. WHEN an Authenticated_User taps "Join" on a Group they are not already a member of, THE App SHALL add the Authenticated_User as a member of that Group and update the displayed member count
3. IF an Authenticated_User taps "Join" on a Group they are already a member of, THEN THE App SHALL not create a duplicate membership and SHALL indicate that the user is already a member
4. WHILE an Authenticated_User is a member of a Group, THE Groups_Page SHALL display that Group's events, Challenges, and feed posts from other members of the Group
5. WHEN a Merchant creates an event within a Group, THE Groups_Page SHALL display the event with date, time, location, and description
6. WHEN a Merchant or group admin creates a Challenge within a Group, THE Groups_Page SHALL display the Challenge with its goal, start date, and end date
7. THE Groups_Page SHALL display the member count for each Group
8. WHEN an Authenticated_User taps "Leave" on a Group they are a member of, THE App SHALL remove the Authenticated_User from that Group and update the displayed member count

### Requirement 10: Profile and Settings

**User Story:** As a user, I want to manage my profile and settings so that I can control my personal information and app preferences.

#### Acceptance Criteria

1. WHEN an Authenticated_User taps the "Profile" tab in the Footer_Nav, THE App SHALL navigate to the Profile_Page
2. THE Profile_Page SHALL display the Authenticated_User's display name, avatar (or a default placeholder if no avatar is set), role ("Individual" or "Merchant"), and account creation date formatted as month and year
3. WHEN an Authenticated_User taps the edit profile button, THE App SHALL display an inline edit form for the display name field
4. WHEN an Authenticated_User modifies the display name and taps save, THE App SHALL validate that the display name is between 2 and 50 characters and contains only letters, numbers, and spaces, and then persist the updated name to the database
5. IF the display name validation fails, THEN THE App SHALL display an error message indicating the validation constraint that was violated, and SHALL NOT persist the change
6. IF the profile update fails due to a server error, THEN THE App SHALL display an error message indicating the update failed and SHALL retain the user's edited input in the form
7. THE Profile_Page SHALL display a "Log Out" button
8. WHEN an Authenticated_User taps the "Log Out" button, THE App SHALL sign the user out, clear the local session, and navigate to the Login page
9. THE Profile_Page SHALL display the Authenticated_User's activity statistics: total distance (in km), total duration (in hours and minutes), total activity count, events joined count, followers count, and following count

### Requirement 11: Home Feed Advertisements

**User Story:** As a merchant, I want to place advertisements in the Home feed so that my products and events reach active fitness users.

#### Acceptance Criteria

1. WHEN a Merchant submits a new Advertisement with a title (maximum 100 characters), an image, and a link to an existing Listing or Group event, THE App SHALL insert the Advertisement as a Feed_Card in the Home_Feed within 5 seconds
2. THE Home_Feed SHALL visually distinguish Advertisements from organic Feed_Cards with a "Sponsored" label displayed on the Feed_Card
3. THE Home_Feed SHALL intersperse Advertisements among organic Feed_Cards at a ratio of no more than 1 Advertisement per 5 organic Feed_Cards, and SHALL NOT display any Advertisement if fewer than 5 organic Feed_Cards are loaded
4. WHEN an Authenticated_User taps an Advertisement, THE App SHALL navigate to the associated Listing detail or Group event detail
5. IF an Advertisement's associated Listing or event has been deleted, THEN THE App SHALL hide that Advertisement from the Home_Feed
6. WHEN a Merchant views their own Advertisement, THE App SHALL display options to edit or delete the Advertisement

### Requirement 12: Navigation Route Structure

**User Story:** As a developer, I want a clear route structure so that the app navigation is predictable and maintainable.

#### Acceptance Criteria

1. THE App SHALL define the following top-level routes: "/" (Home_Feed), "/marketplace" (Marketplace), "/record" (Record_Page), "/groups" (Groups_Page), "/profile" (Profile_Page)
2. WHEN an unauthenticated user attempts to access a protected route, THE App SHALL redirect to the login page at "/login"
3. WHEN an Authenticated_User completes login, THE App SHALL navigate to the Home_Feed route "/"
4. IF an Authenticated_User navigates to an undefined route, THEN THE App SHALL redirect to the Home_Feed
5. THE App SHALL define "/login" and "/register" as public routes accessible without authentication
6. IF an Authenticated_User navigates to "/login" or "/register", THEN THE App SHALL redirect to the Home_Feed route "/"
