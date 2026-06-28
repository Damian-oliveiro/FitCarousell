# Requirements Document

## Introduction

FitCarousell is a fitness social platform built with React and Vite. This overhaul transforms it from a simple activity logger into a full-featured fitness social platform with real-time activity tracking (Strava-style), dual user types (Individuals and Merchants), a community social feed, backend database integration, and a modern UI/UX redesign. The Merchant model also serves as the platform's revenue engine through event advertising and product sales.

## Glossary

- **App**: The FitCarousell web application
- **Individual_User**: A registered user who tracks activities, interacts with the community feed, and browses events and marketplace listings
- **Merchant_User**: A registered business user who advertises events, sells products, and pays the platform for promotion features
- **Activity_Tracker**: The real-time tracking component that records elapsed time during an activity session and allows manual distance entry upon completion, calculating pace from those values
- **Community_Feed**: A vertically-scrollable social feed displaying activity posts from followed users and the broader community, similar to TikTok/Strava feed formats
- **Follow_System**: The mechanism allowing users to follow other users and see their shared activities in the Community_Feed
- **Feed_Post**: A single item in the Community_Feed representing a completed activity shared by a user
- **Marketplace**: The section where Merchant_Users list products for sale and Individual_Users browse and purchase fitness goods
- **Events_Page**: The section where Merchant_Users advertise fitness events and Individual_Users browse and join events
- **Auth_System**: The authentication and authorization system managing user registration, login, sessions, and role-based access
- **Database_Service**: The Supabase backend providing authentication, PostgreSQL database, and real-time subscriptions for persisting and retrieving all application data
- **Navigation_Bar**: The primary navigation component providing access to all major sections of the App

---

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a new user, I want to register an account and log in, so that I can access personalized features and have my data persisted across sessions.

#### Acceptance Criteria

1. WHEN a visitor accesses the App without an active session, THE Auth_System SHALL redirect the visitor to the login page within 2 seconds
2. WHEN a visitor selects "Register", THE Auth_System SHALL present a registration form requiring email, password, display name (between 2 and 50 characters), and account type (Individual or Merchant)
3. WHEN a visitor submits a registration form with a valid email format, a password of at least 8 characters containing at least one uppercase letter, one lowercase letter, and one digit, and a display name between 2 and 50 characters, THE Auth_System SHALL create a new user account in the Database_Service and log the visitor in within 5 seconds
4. IF a visitor submits a registration form with an email already in use, THEN THE Auth_System SHALL display an error message indicating the email is already registered and preserve all other entered form field values
5. IF a visitor submits a registration form with a password that does not meet the minimum requirements, THEN THE Auth_System SHALL display an error message indicating the specific unmet password criteria
6. WHEN a registered user submits valid login credentials, THE Auth_System SHALL create an authenticated session and redirect the user to the Activities page within 3 seconds
7. IF a user submits invalid login credentials, THEN THE Auth_System SHALL display an error message indicating invalid email or password without revealing which field is incorrect
8. WHEN an authenticated user selects "Log Out", THE Auth_System SHALL terminate the session and redirect the user to the login page
9. IF a user session has been inactive for more than 30 minutes, THEN THE Auth_System SHALL terminate the session and redirect the user to the login page upon their next interaction

---

### Requirement 2: Dual User Roles

**User Story:** As the platform owner, I want to support Individual and Merchant user types, so that merchants can advertise events and sell products as the platform's revenue model.

#### Acceptance Criteria

1. WHEN a user completes registration, THE Auth_System SHALL assign exactly one role: Individual_User or Merchant_User, and the assigned role SHALL remain fixed for the lifetime of the account
2. WHILE a user is authenticated as a Merchant_User, THE App SHALL display merchant-specific controls including "Create Event", "Create Listing", and a merchant dashboard
3. WHILE a user is authenticated as an Individual_User, THE App SHALL hide merchant-specific controls and display consumer-focused features including event browsing, product browsing, and activity tracking
4. WHEN a Merchant_User accesses their profile, THE App SHALL display a merchant dashboard showing their listed events, active product listings, and engagement metrics including total views, number of bookmarks, and number of inquiries received
5. THE App SHALL display a merchant badge on all Merchant_User profiles, event cards, and marketplace listings to distinguish merchant content from individual user content
6. IF a user without Merchant_User role attempts to access a merchant-specific control, THEN THE App SHALL deny the action and display a message indicating that the feature is available to merchant accounts only

---

### Requirement 3: Real-Time Activity Tracking

**User Story:** As an Individual_User, I want to track my activities in real-time with start/stop controls, so that I can accurately record my runs, rides, and swims as they happen.

#### Acceptance Criteria

1. WHEN an Individual_User taps "Start Activity" and selects an activity type, THE Activity_Tracker SHALL begin recording elapsed time displayed in HH:MM:SS format updated every second
2. WHILE the Activity_Tracker is recording, THE App SHALL display a live timer, a "Pause" button, and a "Stop" button
3. WHEN an Individual_User taps "Pause", THE Activity_Tracker SHALL pause the elapsed time counter while retaining the accumulated time
4. WHEN an Individual_User taps "Resume" from a paused state, THE Activity_Tracker SHALL continue the timer from the paused value
5. WHEN an Individual_User taps "Stop", THE Activity_Tracker SHALL stop the timer and present a completion form requesting the distance covered as a numeric value in kilometres between 0.01 and 9999.99 inclusive, accepting up to two decimal places
6. WHEN an Individual_User submits the completion form with a distance between 0.01 and 9999.99 km, THE Activity_Tracker SHALL calculate average pace (min/km) from total elapsed time divided by distance, display a summary containing activity type, total elapsed time, distance, and average pace, and save the activity to the Database_Service
7. IF an Individual_User submits the completion form with a distance that is empty, non-numeric, zero, negative, or greater than 9999.99, THEN THE Activity_Tracker SHALL display an error message indicating the valid distance range and SHALL retain the completion form with previously entered data
8. IF the user closes the browser while the Activity_Tracker is recording, THEN THE Activity_Tracker SHALL persist the in-progress session data (start time, elapsed time, activity type) to local storage for recovery
9. WHEN the Activity_Tracker detects a previously interrupted session on page load, THE Activity_Tracker SHALL prompt the user to resume or discard the interrupted session
10. IF the user selects "discard" on the interrupted session prompt, THEN THE Activity_Tracker SHALL delete the persisted session data from local storage and display the default start activity view
11. THE Activity_Tracker SHALL support activity types: Run, Cycle, Swim, and Walk

---

### Requirement 4: Activity Logging (Manual Entry)

**User Story:** As an Individual_User, I want to manually log past activities, so that I can maintain a complete record even for activities I did not track in real-time.

#### Acceptance Criteria

1. WHEN an Individual_User selects "Log Activity Manually", THE App SHALL display a form with fields for activity type (selectable from Run, Cycle, Swim, Walk), distance (in km, accepting values from 0.1 to 999.9), duration (in minutes, accepting whole numbers from 1 to 1440), and date (selectable up to the current date, no future dates permitted)
2. WHEN an Individual_User submits a manual activity form where all required fields contain values within their defined ranges, THE App SHALL save the activity to the Database_Service, calculate average pace (min/km) from the provided duration and distance, and display the activity in the activity history
3. IF an Individual_User submits a manual activity form with one or more required fields empty, THEN THE App SHALL visually indicate each empty required field with a distinct border color and display an inline validation message adjacent to each missing field stating which field is required
4. IF an Individual_User submits a manual activity form with a distance or duration value outside the accepted range, THEN THE App SHALL display an inline validation message adjacent to the invalid field indicating the accepted range
5. IF the Database_Service fails to save a manually logged activity, THEN THE App SHALL display an error notification indicating the save was unsuccessful and retain the form data so the user can retry submission

---

### Requirement 5: Activities Page as Main Page

**User Story:** As a user, I want the Activities page to be the default landing page after login, so that I can immediately start or review my fitness activities.

#### Acceptance Criteria

1. WHEN an authenticated user completes login, THE App SHALL navigate to the Activities page as the default route
2. THE Activities page SHALL display a "Start Activity" button and a "Log Manually" button grouped together at the top of the page, above the activity history list
3. THE Activities page SHALL display the user's activity history sorted by date in descending order (most recent first) below the action buttons
4. WHEN an Individual_User views their activity history, THE App SHALL display each activity entry with its type icon, distance in km, duration in minutes, average pace in min/km, and the activity date
5. IF the user has no recorded activities, THEN THE Activities page SHALL display an empty-state message indicating no activities have been logged yet

---

### Requirement 6: Community Social Feed

**User Story:** As a user, I want to browse a scrollable social feed of activities from users I follow and the broader community, so that I can stay motivated and engage with the fitness community.

#### Acceptance Criteria

1. THE Community_Feed SHALL display Feed_Posts in a vertically-scrollable, full-width card format ordered by most recent first
2. WHEN a user scrolls to the bottom of the currently loaded Feed_Posts, THE Community_Feed SHALL load the next batch of 20 posts and append them below the existing posts (infinite scroll)
3. THE Community_Feed SHALL display each Feed_Post with the poster's display name, avatar, activity type, distance, duration, pace, date, and an optional text caption of no more than 300 characters
4. WHEN a user taps the "Like" button on a Feed_Post, THE App SHALL increment the like count for that post and persist it to the Database_Service
5. IF the Database_Service fails to persist a like or comment, THEN THE App SHALL revert the like count or discard the comment locally and display an error message indicating the action could not be completed
6. WHEN a user taps the "Comment" button on a Feed_Post, THE App SHALL display a comment input field (maximum 500 characters) and the 10 most recent existing comments for that post, with an option to load earlier comments
7. WHEN a user submits a comment on a Feed_Post, THE App SHALL persist the comment to the Database_Service and display it below the post in chronological order
8. WHEN a user completes and saves an activity, THE App SHALL prompt the user to share the activity to the Community_Feed with an optional caption
9. IF a user declines to share, THEN THE App SHALL save the activity without creating a Feed_Post
10. THE Community_Feed SHALL be accessible via the "Community" link in the Navigation_Bar
11. THE Community_Feed SHALL display all Feed_Posts from followed users first (ordered by most recent), followed by remaining community posts (ordered by most recent) as two distinct sections

---

### Requirement 7: Follow System

**User Story:** As a user, I want to follow other users, so that I can see their activities in my feed and stay connected with my fitness community.

#### Acceptance Criteria

1. WHEN a user views another user's Feed_Post or profile, THE App SHALL display a "Follow" button if the viewing user is not already following that person and the viewed user is not the viewing user's own account
2. WHEN a user taps "Follow" on another user, THE Follow_System SHALL create a follow relationship in the Database_Service, update the button to "Following", and increment the displayed follower/following counts within 3 seconds
3. IF the follow or unfollow operation fails due to a network or Database_Service error, THEN THE Follow_System SHALL revert the button to its previous state and display an error message indicating the operation could not be completed
4. WHEN a user taps "Following" (unfollow) on a followed user, THE Follow_System SHALL display a confirmation prompt before removing the follow relationship from the Database_Service and reverting the button to "Follow"
5. THE Profile page SHALL display the user's follower count and following count as whole numbers up to 999, and abbreviated format for counts of 1,000 or more (e.g., "1.2K", "3.4M")
6. WHEN a user taps on the follower or following count, THE App SHALL display a scrollable list of up to 50 users per loaded page with follow/unfollow buttons, or a message indicating the list is empty if no users exist in that list

---

### Requirement 8: Events Page (Merchant-Driven)

**User Story:** As a Merchant_User, I want to create and advertise fitness events, so that I can attract participants and generate revenue through the platform.

#### Acceptance Criteria

1. WHEN a Merchant_User selects "Create Event", THE Events_Page SHALL display a form with fields for title (maximum 100 characters), description (maximum 500 characters), date, time, location (maximum 200 characters), maximum participants (between 2 and 1000), event type (selectable from predefined categories), and cover image (accepted formats: JPEG or PNG, maximum file size 5 MB)
2. WHEN a Merchant_User submits the event creation form with all required fields populated and the event date set to a future date, THE Events_Page SHALL save the event to the Database_Service, display a confirmation message indicating successful creation, and display the new event in the events listing sorted by event date in ascending order
3. IF a Merchant_User submits the event creation form with any required field empty or with an event date set in the past, THEN THE Events_Page SHALL display an error message indicating which fields require correction and SHALL NOT save the event
4. WHEN an Individual_User browses the Events_Page, THE App SHALL display all events with a date equal to or later than the current date as cards showing title, date, location, current participant count out of maximum participants, and the organizing merchant's name, sorted by event date in ascending order
5. WHEN an Individual_User taps "Join Event" on an event that has not reached maximum participants, THE App SHALL register the user for the event, increment the participant count by one, persist the registration to the Database_Service, and display a confirmation message indicating successful registration
6. IF an Individual_User attempts to join an event that has reached maximum participants, THEN THE App SHALL display a message indicating the event is full and SHALL NOT register the user
7. IF an Individual_User attempts to join an event they have already joined, THEN THE App SHALL keep the "Join Event" control disabled and SHALL NOT create a duplicate registration
8. WHEN a Merchant_User views their own event, THE App SHALL display the current participant count out of maximum participants and a list of registered participants showing each participant's display name

---

### Requirement 9: Marketplace (Merchant-Driven)

**User Story:** As a Merchant_User, I want to list fitness products for sale, so that I can sell goods to the community and generate revenue.

#### Acceptance Criteria

1. WHEN a Merchant_User selects "Create Listing", THE Marketplace SHALL display a form with fields for title (text input, max 100 characters), description (text area, max 500 characters), price (numeric input), category (dropdown), condition (dropdown), and a product icon selector
2. WHEN a Merchant_User submits the listing form with a non-empty title and a price greater than 0, THE Marketplace SHALL save the listing to the Database_Service with the seller set to the current user and the current date, and display it as the first item in the marketplace grid
3. IF a Merchant_User submits the listing form with an empty title or a price of 0 or below, THEN THE Marketplace SHALL not save the listing and SHALL keep the form displayed with the entered data preserved
4. WHEN an Individual_User browses the Marketplace, THE App SHALL display listings as cards showing product icon, title, price, condition badge, category badge, and seller name
5. WHEN an Individual_User selects a listing card, THE App SHALL navigate to a detail view showing full description, product icon, seller name, and a "Contact Seller" button
6. THE Marketplace SHALL provide category filter buttons for the categories "All", "Running", "Cycling", "Swimming", "Fitness", and "Electronics", where selecting a category displays only listings matching that category, and selecting "All" displays all listings
7. THE Marketplace SHALL provide a search input that filters displayed listings to those whose title contains the entered keyword using case-insensitive partial matching
8. THE Marketplace SHALL display the condition dropdown with the options "Brand New", "Like New", "Good", and "Fair"

---

### Requirement 10: Backend Database Integration

**User Story:** As a user, I want my data to be persisted in a backend database, so that my activities, profile, and interactions are saved across sessions and devices.

#### Acceptance Criteria

1. THE Database_Service SHALL persist all user accounts, activities, events, marketplace listings, feed posts, comments, and likes such that data remains available after the user closes and reopens the App on the same or a different device
2. WHEN a user performs a create, update, or delete action, THE App SHALL send the request to the Database_Service and update the UI only upon receiving a successful response within 10 seconds
3. IF a network request to the Database_Service fails or does not receive a response within 10 seconds, THEN THE App SHALL display an error notification for at least 5 seconds (or until dismissed by the user) and retain the previous UI state without data loss
4. WHEN the App loads a page requiring data, THE App SHALL fetch the data from the Database_Service and display a loading indicator until the data is available or the 10-second timeout is reached
5. THE Database_Service SHALL enforce data validation rules matching the client-side validation before persisting data, and SHALL reject any request that fails validation by returning an error indication specifying which field failed
6. THE Database_Service SHALL associate all user-generated content with the authenticated user's ID and SHALL reject any request that does not include a valid authenticated user identity
7. IF the App receives a validation rejection from the Database_Service, THEN THE App SHALL display the field-level error to the user and preserve all entered form data

---

### Requirement 11: Navigation Overhaul

**User Story:** As a user, I want clear and intuitive navigation, so that I can easily access all sections of the app.

#### Acceptance Criteria

1. THE Navigation_Bar SHALL display links in the following fixed order from left to right (or top to bottom on mobile): Activities (default/home), Community, Events, Marketplace, and Profile
2. THE Navigation_Bar SHALL visually distinguish the currently active page link from inactive links by applying a differentiated background color and text color to the active link
3. WHEN a user taps a Navigation_Bar link, THE App SHALL navigate to the corresponding page without a full page reload and within 300 milliseconds
4. THE Navigation_Bar SHALL be displayed as a fixed bottom tab bar on viewports below 768px width and as a sticky top horizontal bar on viewports at or above 768px width, remaining visible at all times regardless of scroll position
5. WHILE the viewport is at or above 768px width, THE Navigation_Bar SHALL display the FitCarousell brand logo and application name in the header area to the left of the navigation links
6. THE Navigation_Bar SHALL be fully navigable via keyboard, allowing users to move focus between links using the Tab key, with a visible focus indicator on the currently focused link
7. IF a user navigates to a route that does not match any Navigation_Bar link, THEN THE App SHALL keep the Navigation_Bar visible with no link highlighted as active

---

### Requirement 12: UI/UX Styling Overhaul

**User Story:** As a user, I want a modern, Strava-inspired visual design, so that the app feels professional and engaging to use.

#### Acceptance Criteria

1. THE App SHALL use a dark-themed color palette where interactive elements (buttons, links, active icons) use accent colors that meet a minimum contrast ratio of 4.5:1 against their background, following a Strava-inspired orange/white on dark scheme
2. THE App SHALL use consistent card-based layouts for activities, events, and marketplace listings with border-radius between 8px and 16px and a drop shadow providing visible elevation against the page background
3. THE App SHALL apply CSS transitions with a duration between 150ms and 400ms when navigating between pages and when loading new content, with no transition exceeding 400ms from start to completion
4. THE App SHALL use a consistent typographic hierarchy with a sans-serif font family, defining at least four distinct heading levels (h1, h2, h3, h4) with font sizes decreasing from largest to smallest, and body text no smaller than 14px
5. THE App SHALL be responsive, providing an optimized layout for mobile (below 768px), tablet (768px to 1024px), and desktop (above 1024px) viewports
6. WHILE the App is loading data for more than 200ms, THE App SHALL display skeleton loading placeholders that match the approximate dimensions and position of the expected content containers
7. THE App SHALL use activity-type-specific color coding applied consistently across all pages, assigning a unique, distinct color to each supported activity type (including at minimum: Run, Cycle, and Swim)
8. THE App SHALL ensure all text content meets a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (18px or above) against its background

---

### Requirement 13: User Profile

**User Story:** As a user, I want a comprehensive profile page, so that I can view my stats, manage my account settings, and see my activity history.

#### Acceptance Criteria

1. THE Profile page SHALL display the user's display name, avatar, account type badge (Individual or Merchant), and member-since date formatted as "Month YYYY"
2. THE Profile page SHALL display aggregate statistics: total distance (in km, 1 decimal place), total duration (in hours and minutes), total activities count, events joined count, follower count, and following count
3. THE Profile page SHALL display an activity breakdown chart showing distance distribution by activity type as a horizontal bar for each type with its distance value in km
4. WHEN a user selects "Edit Profile", THE App SHALL display a form allowing updates to display name (between 2 and 50 characters, alphanumeric and spaces only) and avatar image (JPEG or PNG, maximum 5 MB)
5. WHEN a user submits profile edits that satisfy the display name length and character constraints and the avatar format and size constraints, THE App SHALL persist the changes to the Database_Service and update the displayed profile information within 3 seconds
6. IF a user submits profile edits that violate the display name or avatar constraints, THEN THE App SHALL display a validation message indicating which field is invalid and retain the form with the user's entered values
