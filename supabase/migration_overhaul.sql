-- =============================================
-- FitCarousell Overhaul Migration
-- Adds: chat, offers, spotlight, ratings, groups, challenges, advertisements
-- =============================================

-- =============================================
-- 1. SCHEMA MODIFICATIONS TO EXISTING TABLES
-- =============================================

-- Add status and sold_to columns to listings
alter table public.listings
  add column status text not null default 'active' check (status in ('active', 'sold')),
  add column sold_to uuid references public.profiles(id);

-- =============================================
-- 2. NEW TABLES
-- =============================================

-- ===== CHAT THREADS =====
create table public.chat_threads (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(listing_id, buyer_id)
);

-- ===== CHAT MESSAGES =====
create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  thread_id uuid references public.chat_threads(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (char_length(content) between 1 and 1000),
  message_type text not null default 'text' check (message_type in ('text', 'offer', 'offer_accepted', 'offer_declined', 'system')),
  read boolean default false,
  created_at timestamptz default now()
);

-- ===== OFFERS =====
create table public.offers (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric(10, 2) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now()
);

-- ===== LISTING SPOTLIGHTS =====
create table public.listing_spotlights (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null unique,
  activated_at timestamptz default now(),
  expires_at timestamptz not null
);

-- ===== SELLER RATINGS =====
create table public.seller_ratings (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  score integer not null check (score between 1 and 5),
  review text check (char_length(review) <= 500),
  created_at timestamptz default now(),
  unique(listing_id, buyer_id)
);

-- ===== GROUPS =====
create table public.groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null check (char_length(name) between 1 and 100),
  description text check (char_length(description) <= 200),
  created_by uuid references public.profiles(id) on delete set null,
  member_count integer default 0,
  created_at timestamptz default now()
);

-- ===== GROUP MEMBERS =====
create table public.group_members (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- ===== GROUP EVENTS =====
create table public.group_events (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  merchant_id uuid references public.profiles(id) on delete cascade not null,
  title text not null check (char_length(title) <= 100),
  description text check (char_length(description) <= 500),
  date date not null,
  time time,
  location text check (char_length(location) <= 200),
  created_at timestamptz default now()
);

-- ===== CHALLENGES =====
create table public.challenges (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null check (char_length(title) <= 100),
  goal text not null check (char_length(goal) <= 300),
  start_date date not null,
  end_date date not null,
  created_at timestamptz default now(),
  check (end_date > start_date)
);

-- ===== ADVERTISEMENTS =====
create table public.advertisements (
  id uuid default uuid_generate_v4() primary key,
  merchant_id uuid references public.profiles(id) on delete cascade not null,
  title text not null check (char_length(title) <= 100),
  image text not null,
  link_type text not null check (link_type in ('listing', 'event')),
  link_id uuid not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =============================================

alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
alter table public.offers enable row level security;
alter table public.listing_spotlights enable row level security;
alter table public.seller_ratings enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_events enable row level security;
alter table public.challenges enable row level security;
alter table public.advertisements enable row level security;

-- =============================================
-- 4. RLS POLICIES
-- =============================================

-- CHAT THREADS
create policy "Users can view their own chat threads"
  on chat_threads for select using (
    auth.uid() = buyer_id or auth.uid() = seller_id
  );

create policy "Users can create chat threads as buyer"
  on chat_threads for insert with check (auth.uid() = buyer_id);

-- CHAT MESSAGES
create policy "Users can view messages in their threads"
  on chat_messages for select using (
    exists (
      select 1 from chat_threads
      where chat_threads.id = chat_messages.thread_id
        and (chat_threads.buyer_id = auth.uid() or chat_threads.seller_id = auth.uid())
    )
  );

create policy "Users can send messages in their threads"
  on chat_messages for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from chat_threads
      where chat_threads.id = thread_id
        and (chat_threads.buyer_id = auth.uid() or chat_threads.seller_id = auth.uid())
    )
  );

create policy "Users can update read status in their threads"
  on chat_messages for update using (
    exists (
      select 1 from chat_threads
      where chat_threads.id = chat_messages.thread_id
        and (chat_threads.buyer_id = auth.uid() or chat_threads.seller_id = auth.uid())
    )
  );

-- OFFERS
create policy "Offer participants can view offers"
  on offers for select using (
    auth.uid() = buyer_id
    or exists (
      select 1 from listings
      where listings.id = offers.listing_id and listings.seller_id = auth.uid()
    )
  );

create policy "Users can create offers"
  on offers for insert with check (auth.uid() = buyer_id);

create policy "Sellers can update offer status"
  on offers for update using (
    exists (
      select 1 from listings
      where listings.id = offers.listing_id and listings.seller_id = auth.uid()
    )
  );

-- LISTING SPOTLIGHTS
create policy "Spotlights are viewable by everyone"
  on listing_spotlights for select using (true);

create policy "Merchants can spotlight own listings"
  on listing_spotlights for insert with check (
    exists (
      select 1 from listings
      where listings.id = listing_id and listings.seller_id = auth.uid()
    )
    and exists (
      select 1 from profiles where id = auth.uid() and role = 'merchant'
    )
  );

-- SELLER RATINGS
create policy "Ratings are viewable by everyone"
  on seller_ratings for select using (true);

create policy "Buyers can create ratings"
  on seller_ratings for insert with check (
    auth.uid() = buyer_id
    and auth.uid() != seller_id
  );

-- GROUPS
create policy "Groups are viewable by everyone"
  on groups for select using (true);

create policy "Authenticated users can create groups"
  on groups for insert with check (auth.uid() = created_by);

create policy "Group creators can update their groups"
  on groups for update using (auth.uid() = created_by);

-- GROUP MEMBERS
create policy "Group members are viewable by everyone"
  on group_members for select using (true);

create policy "Users can join groups"
  on group_members for insert with check (auth.uid() = user_id);

create policy "Users can leave groups"
  on group_members for delete using (auth.uid() = user_id);

-- GROUP EVENTS
create policy "Group events are viewable by everyone"
  on group_events for select using (true);

create policy "Merchants can create group events"
  on group_events for insert with check (
    auth.uid() = merchant_id
    and exists (select 1 from profiles where id = auth.uid() and role = 'merchant')
  );

create policy "Merchants can update own group events"
  on group_events for update using (auth.uid() = merchant_id);

-- CHALLENGES
create policy "Challenges are viewable by everyone"
  on challenges for select using (true);

create policy "Users can create challenges"
  on challenges for insert with check (auth.uid() = created_by);

create policy "Challenge creators can update challenges"
  on challenges for update using (auth.uid() = created_by);

-- ADVERTISEMENTS
create policy "Active advertisements are viewable by everyone"
  on advertisements for select using (true);

create policy "Merchants can create advertisements"
  on advertisements for insert with check (
    auth.uid() = merchant_id
    and exists (select 1 from profiles where id = auth.uid() and role = 'merchant')
  );

create policy "Merchants can update own advertisements"
  on advertisements for update using (auth.uid() = merchant_id);

create policy "Merchants can delete own advertisements"
  on advertisements for delete using (auth.uid() = merchant_id);

-- =============================================
-- 5. INDEXES
-- =============================================

create index idx_chat_threads_buyer on chat_threads(buyer_id);
create index idx_chat_threads_seller on chat_threads(seller_id);
create index idx_chat_threads_listing on chat_threads(listing_id);
create index idx_chat_messages_thread on chat_messages(thread_id, created_at);
create index idx_chat_messages_unread on chat_messages(thread_id, read) where read = false;
create index idx_offers_listing on offers(listing_id);
create index idx_offers_buyer on offers(buyer_id);
create index idx_spotlight_expires on listing_spotlights(expires_at);
create index idx_seller_ratings_seller on seller_ratings(seller_id);
create index idx_group_members_user on group_members(user_id);
create index idx_group_members_group on group_members(group_id);
create index idx_group_events_group on group_events(group_id);
create index idx_challenges_group on challenges(group_id);
create index idx_advertisements_merchant on advertisements(merchant_id);
create index idx_advertisements_active on advertisements(is_active) where is_active = true;

-- =============================================
-- 6. ENABLE SUPABASE REALTIME
-- =============================================

alter publication supabase_realtime add table chat_messages;

-- =============================================
-- 7. TRIGGERS & FUNCTIONS
-- =============================================

-- Increment member_count when a user joins a group
create or replace function public.handle_join_group()
returns trigger as $$
begin
  update groups set member_count = member_count + 1 where id = new.group_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_group_joined
  after insert on group_members
  for each row execute function handle_join_group();

-- Decrement member_count when a user leaves a group
create or replace function public.handle_leave_group()
returns trigger as $$
begin
  update groups set member_count = greatest(0, member_count - 1) where id = old.group_id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_group_left
  after delete on group_members
  for each row execute function handle_leave_group();
