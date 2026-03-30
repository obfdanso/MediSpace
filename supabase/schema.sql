-- ============================================================
-- MediSpace Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Profiles ──────────────────────────────────────────────────────────────────
-- Extends auth.users with app-specific data
create table if not exists public.profiles (
  id                    uuid references auth.users(id) on delete cascade primary key,
  full_name             text,
  onboarding_completed  boolean not null default false,
  created_at            timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', null)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Health Profiles ───────────────────────────────────────────────────────────
create table if not exists public.health_profiles (
  id                    uuid default uuid_generate_v4() primary key,
  user_id               uuid references auth.users(id) on delete cascade not null unique,
  date_of_birth         date,
  gender                text check (gender in ('male', 'female', 'non_binary', 'prefer_not_to_say')),
  height_cm             numeric(5, 1),
  weight_kg             numeric(5, 1),
  blood_type            text check (blood_type in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown')),
  existing_conditions   text[] not null default '{}',
  allergies             text[] not null default '{}',
  current_medications   text[] not null default '{}',
  smoking_status        text check (smoking_status in ('never', 'former', 'occasional', 'daily')),
  alcohol_consumption   text check (alcohol_consumption in ('never', 'rarely', 'moderate', 'frequent')),
  exercise_frequency    text check (exercise_frequency in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  primary_health_goal   text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.health_profiles enable row level security;

create policy "Users can view their own health profile"
  on public.health_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own health profile"
  on public.health_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own health profile"
  on public.health_profiles for update
  using (auth.uid() = user_id);

-- ── Conversations ─────────────────────────────────────────────────────────────
create table if not exists public.conversations (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null default 'New Conversation',
  topic       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.conversations enable row level security;

create policy "Users can manage their own conversations"
  on public.conversations for all
  using (auth.uid() = user_id);

-- ── Messages ──────────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id                uuid default uuid_generate_v4() primary key,
  conversation_id   uuid references public.conversations(id) on delete cascade not null,
  role              text not null check (role in ('user', 'assistant')),
  content           text not null,
  created_at        timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Users can manage messages in their conversations"
  on public.messages for all
  using (
    auth.uid() = (
      select user_id from public.conversations
      where id = conversation_id
    )
  );
