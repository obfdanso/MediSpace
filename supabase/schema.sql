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
  tier                  text not null default 'free' check (tier in ('free', 'premium')),
  created_at            timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users may edit their name and onboarding flag, but not their plan.
-- The plan is only changed by the server (api/billing) with the secret key.
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, full_name, onboarding_completed) on public.profiles to authenticated;
grant update (id, full_name, onboarding_completed) on public.profiles to authenticated;

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

create index if not exists idx_conversations_user_updated on public.conversations (user_id, updated_at desc);
create index if not exists idx_messages_conversation_created on public.messages (conversation_id, created_at);

-- ── Daily usage (message limits) ──────────────────────────────────────────────
-- Only the server touches this table, using the secret key.
create table if not exists public.daily_usage (
  id             uuid        default gen_random_uuid() primary key,
  user_id        uuid        references auth.users(id) on delete cascade,
  ip_address     text,
  date           date        not null default current_date,
  message_count  integer     not null default 0,
  updated_at     timestamptz default now(),
  constraint uq_user_date unique (user_id, date),
  constraint uq_ip_date   unique (ip_address, date),
  constraint chk_identity check (user_id is not null or ip_address is not null)
);

alter table public.daily_usage enable row level security;
-- No policies on purpose: the browser can't read or write it

create or replace function public.increment_daily_usage_user(p_user_id uuid, p_date date)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into daily_usage (user_id, ip_address, date, message_count)
    values (p_user_id, null, p_date, 1)
  on conflict (user_id, date)
  do update set message_count = daily_usage.message_count + 1, updated_at = now();
end;
$$;

create or replace function public.increment_daily_usage_ip(p_ip text, p_date date)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into daily_usage (user_id, ip_address, date, message_count)
    values (null, p_ip, p_date, 1)
  on conflict (ip_address, date)
  do update set message_count = daily_usage.message_count + 1, updated_at = now();
end;
$$;

-- Only the server may call these
revoke execute on function public.increment_daily_usage_user(uuid, date) from public, anon, authenticated;
revoke execute on function public.increment_daily_usage_ip(text, date) from public, anon, authenticated;
grant execute on function public.increment_daily_usage_user(uuid, date) to service_role;
grant execute on function public.increment_daily_usage_ip(text, date) to service_role;

-- ─── Contact messages ────────────────────────────────────────────────────────
-- Written by the public contact form. Anyone may send one; nobody can read
-- them through the API, so view them in the Supabase dashboard.

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 200),
  email       text not null check (char_length(email) between 3 and 320),
  message     text not null check (char_length(message) between 1 and 5000),
  created_at  timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can send a contact message"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);
