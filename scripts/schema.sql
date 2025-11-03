-- Schema for Supabase (Postgres)
-- Run in Supabase SQL Editor. Safe to re-run (uses IF NOT EXISTS where possible).

-- Extensions
create extension if not exists pgcrypto;

-- Profiles (linked to Supabase Auth users)
create table if not exists profiles (
  id uuid primary key references auth.users(id),
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Tutorial instances
create table if not exists tutorial_instances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  input_text text not null,
  title text,
  description text,
  tags text[],
  difficulty text,
  progress numeric default 0,
  completed boolean default false,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Steps
create table if not exists steps (
  id uuid primary key default gen_random_uuid(),
  tutorial_id uuid references tutorial_instances(id) on delete cascade,
  ord int not null,
  title text,
  summary text,
  detail text,
  detail_prompt text,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Items
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  tutorial_id uuid references tutorial_instances(id) on delete cascade,
  name text,
  qty text,
  note text
);

-- Badges
create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  key text unique,
  title text,
  description text,
  icon_url text,
  created_at timestamptz default now()
);

-- User badges
create table if not exists user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  badge_id uuid references badges(id),
  awarded_at timestamptz default now(),
  source_tutorial uuid references tutorial_instances(id)
);

-- AI responses audit
create table if not exists ai_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  tutorial_id uuid references tutorial_instances(id),
  step_id uuid references steps(id),
  model text,
  prompt text,
  response jsonb,
  created_at timestamptz default now()
);

-- Helpful indexes
create index if not exists idx_steps_tutorial_id_ord on steps(tutorial_id, ord);
create index if not exists idx_items_tutorial_id on items(tutorial_id);
create index if not exists idx_tutorial_instances_user_id_created_at on tutorial_instances(user_id, created_at desc);


