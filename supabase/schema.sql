-- =============================================
-- TribeFit Database Schema (Supabase/PostgreSQL)
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- 1. CREATE ALL TABLES FIRST
-- =============================================

-- ===== PROFILES =====
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null check (char_length(display_name) between 2 and 50),
  role text not null check (role in ('individual', 'merchant')),
  avatar_url text,
  created_at timestamptz default now()
);

-- ===== ACTIVITIES =====
create table public.activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('Run', 'Cycle', 'Swim', 'Walk')),
  distance numeric(7, 2) not null check (distance > 0),
  duration integer not null check (duration > 0),
  pace numeric(6, 2),
  date date not null,
  created_at timestamptz default now()
);

-- ===== EVENTS =====
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  merchant_id uuid references public.profiles(id) on delete cascade not null,
  title text not null check (char_length(title) <= 100),
  description text check (char_length(description) <= 500),
  date date not null,
  time time,
  location text check (char_length(location) <= 200),
  max_participants integer not null check (max_participants between 2 and 1000),
  event_type text not null,
  participant_count integer default 0,
  cover_image_url text,
  created_at timestamptz default now()
);

-- ===== EVENT PARTICIPANTS =====
create table public.event_participants (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique(event_id, user_id)
);

-- ===== MARKETPLACE LISTINGS =====
create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  title text not null check (char_length(title) <= 100),
  description text check (char_length(description) <= 500),
  price numeric(10, 2) not null check (price > 0),
  category text not null,
  condition text not null check (condition in ('Brand New', 'Like New', 'Good', 'Fair')),
  image text default '📦',
  created_at timestamptz default now()
);

-- ===== FEED POSTS =====
create table public.feed_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  activity_id uuid references public.activities(id) on delete cascade,
  caption text check (char_length(caption) <= 300),
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamptz default now()
);

-- ===== LIKES =====
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.feed_posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

-- ===== COMMENTS =====
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.feed_posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz default now()
);

-- ===== FOLLOWS =====
create table public.follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

-- =============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =============================================

alter table public.profiles enable row level security;
alter table public.activities enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.listings enable row level security;
alter table public.feed_posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;

-- =============================================
-- 3. RLS POLICIES (all tables exist now)
-- =============================================

-- PROFILES
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- ACTIVITIES
create policy "Users can view own activities"
  on activities for select using (auth.uid() = user_id);

create policy "Anyone can view shared activities"
  on activities for select using (
    exists (select 1 from feed_posts where feed_posts.activity_id = activities.id)
  );

create policy "Users can insert own activities"
  on activities for insert with check (auth.uid() = user_id);

create policy "Users can delete own activities"
  on activities for delete using (auth.uid() = user_id);

-- EVENTS
create policy "Events are viewable by everyone"
  on events for select using (true);

create policy "Merchants can create events"
  on events for insert with check (
    auth.uid() = merchant_id
    and exists (select 1 from profiles where id = auth.uid() and role = 'merchant')
  );

create policy "Merchants can update own events"
  on events for update using (auth.uid() = merchant_id);

-- EVENT PARTICIPANTS
create policy "Participants viewable by everyone"
  on event_participants for select using (true);

create policy "Users can join events"
  on event_participants for insert with check (auth.uid() = user_id);

create policy "Users can leave events"
  on event_participants for delete using (auth.uid() = user_id);

-- LISTINGS
create policy "Listings are viewable by everyone"
  on listings for select using (true);

create policy "Merchants can create listings"
  on listings for insert with check (
    auth.uid() = seller_id
    and exists (select 1 from profiles where id = auth.uid() and role = 'merchant')
  );

create policy "Merchants can update own listings"
  on listings for update using (auth.uid() = seller_id);

create policy "Merchants can delete own listings"
  on listings for delete using (auth.uid() = seller_id);

-- FEED POSTS
create policy "Feed posts are viewable by everyone"
  on feed_posts for select using (true);

create policy "Users can create own feed posts"
  on feed_posts for insert with check (auth.uid() = user_id);

create policy "Users can delete own feed posts"
  on feed_posts for delete using (auth.uid() = user_id);

-- LIKES
create policy "Likes are viewable by everyone"
  on likes for select using (true);

create policy "Users can like posts"
  on likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike posts"
  on likes for delete using (auth.uid() = user_id);

-- COMMENTS
create policy "Comments are viewable by everyone"
  on comments for select using (true);

create policy "Users can create comments"
  on comments for insert with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on comments for delete using (auth.uid() = user_id);

-- FOLLOWS
create policy "Follows are viewable by everyone"
  on follows for select using (true);

create policy "Users can follow others"
  on follows for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on follows for delete using (auth.uid() = follower_id);

-- =============================================
-- 4. INDEXES
-- =============================================

create index idx_activities_user_id on activities(user_id);
create index idx_activities_date on activities(date desc);
create index idx_events_date on events(date);
create index idx_listings_category on listings(category);
create index idx_feed_posts_created on feed_posts(created_at desc);
create index idx_feed_posts_user on feed_posts(user_id);
create index idx_comments_post on comments(post_id);
create index idx_likes_post on likes(post_id);
create index idx_follows_follower on follows(follower_id);
create index idx_follows_following on follows(following_id);

-- =============================================
-- 5. TRIGGERS & FUNCTIONS
-- =============================================

-- Increment likes_count when a like is added
create or replace function public.handle_new_like()
returns trigger as $$
begin
  update feed_posts set likes_count = likes_count + 1 where id = new.post_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_like_added
  after insert on likes
  for each row execute function handle_new_like();

-- Decrement likes_count when a like is removed
create or replace function public.handle_remove_like()
returns trigger as $$
begin
  update feed_posts set likes_count = greatest(0, likes_count - 1) where id = old.post_id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_like_removed
  after delete on likes
  for each row execute function handle_remove_like();

-- Increment comments_count
create or replace function public.handle_new_comment()
returns trigger as $$
begin
  update feed_posts set comments_count = comments_count + 1 where id = new.post_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_comment_added
  after insert on comments
  for each row execute function handle_new_comment();

-- Increment participant_count when joining
create or replace function public.handle_join_event()
returns trigger as $$
begin
  update events set participant_count = participant_count + 1 where id = new.event_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_event_joined
  after insert on event_participants
  for each row execute function handle_join_event();
