-- ============================================================
-- Premium payments (Paystack, 30-day passes)
-- Run once in the Supabase SQL Editor. Safe to run again.
-- ============================================================

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

-- Demo upgrades from before real payments don't carry over
update public.profiles set tier = 'free' where tier = 'premium' and premium_until is null;
