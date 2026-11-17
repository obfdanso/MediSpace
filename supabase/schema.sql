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

-- Claims one message from today's allowance in a single atomic step.
-- Returns the new count, or null when the limit is already reached.
create or replace function public.try_use_message(p_user_id uuid, p_ip text, p_date date, p_limit integer)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_count integer;
begin
  if p_user_id is not null then
    insert into daily_usage (user_id, ip_address, date, message_count)
      values (p_user_id, null, p_date, 1)
    on conflict (user_id, date)
    do update set message_count = daily_usage.message_count + 1, updated_at = now()
      where daily_usage.message_count < p_limit
    returning message_count into v_count;
  else
    insert into daily_usage (user_id, ip_address, date, message_count)
      values (null, p_ip, p_date, 1)
    on conflict (ip_address, date)
    do update set message_count = daily_usage.message_count + 1, updated_at = now()
      where daily_usage.message_count < p_limit
    returning message_count into v_count;
  end if;
  return v_count;
end;
$$;

-- Gives a message back when the AI call fails after it was claimed
create or replace function public.refund_message(p_user_id uuid, p_ip text, p_date date)
returns void language plpgsql security definer set search_path = public as $$
begin
  update daily_usage
     set message_count = greatest(message_count - 1, 0), updated_at = now()
   where date = p_date
     and ((p_user_id is not null and user_id = p_user_id)
       or (p_user_id is null and user_id is null and ip_address = p_ip));
end;
$$;

-- Only the server may call these
revoke execute on function public.try_use_message(uuid, text, date, integer) from public, anon, authenticated;
revoke execute on function public.refund_message(uuid, text, date) from public, anon, authenticated;
grant execute on function public.try_use_message(uuid, text, date, integer) to service_role;
grant execute on function public.refund_message(uuid, text, date) to service_role;

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

-- ─── Premium payments ────────────────────────────────────────────────────────
-- Premium lasts until this time; empty or in the past means Free
alter table public.profiles add column if not exists premium_until timestamptz;

-- One row per confirmed payment. The reference is Paystack's, so a payment
-- can never be credited twice.
create table if not exists public.payments (
  reference      text        primary key,
  user_id        uuid        not null references auth.users(id) on delete cascade,
  amount         integer     not null,              -- in pesewas
  currency       text        not null,
  provider       text        not null default 'paystack',
  premium_until  timestamptz not null,
  created_at     timestamptz not null default now()
);

create index if not exists idx_payments_user on public.payments (user_id, created_at desc);

alter table public.payments enable row level security;

drop policy if exists "Users can view their own payments" on public.payments;
create policy "Users can view their own payments"
  on public.payments for select
  using (auth.uid() = user_id);

-- Credits a confirmed payment: adds p_days of Premium on top of any time left.
-- Returns the new end date. Calling it again with the same reference changes
-- nothing and returns the date from the first time.
create or replace function public.credit_premium(
  p_reference text, p_user_id uuid, p_amount integer, p_currency text, p_days integer
) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  v_until timestamptz;
begin
  select premium_until into v_until from payments where reference = p_reference;
  if found then return v_until; end if;

  -- Lock the profile so two credits for the same user can't overlap
  select greatest(coalesce(premium_until, now()), now()) + make_interval(days => p_days)
    into v_until
    from profiles where id = p_user_id
    for update;
  if v_until is null then
    raise exception 'profile % not found', p_user_id;
  end if;

  insert into payments (reference, user_id, amount, currency, premium_until)
    values (p_reference, p_user_id, p_amount, p_currency, v_until)
  on conflict (reference) do nothing;

  if not found then
    -- Another request credited this payment first
    select premium_until into v_until from payments where reference = p_reference;
    return v_until;
  end if;

  update profiles set premium_until = v_until, tier = 'premium' where id = p_user_id;
  return v_until;
end;
$$;

revoke execute on function public.credit_premium(text, uuid, integer, text, integer) from public, anon, authenticated;
grant execute on function public.credit_premium(text, uuid, integer, text, integer) to service_role;
