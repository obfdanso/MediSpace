-- Run once in the Supabase SQL editor. Lets credit_premium create a missing
-- profile instead of failing, so a paid webhook doesn't retry forever.

create or replace function public.credit_premium(
  p_reference text, p_user_id uuid, p_amount integer, p_currency text, p_days integer
) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  v_until timestamptz;
begin
  select premium_until into v_until from payments where reference = p_reference;
  if found then return v_until; end if;

  -- A paying user whose profile row never got made gets one now; a deleted
  -- account can't be credited, so say so and let the caller stop retrying
  insert into profiles (id)
    select p_user_id where exists (select 1 from auth.users where id = p_user_id)
  on conflict (id) do nothing;

  -- Lock the profile so two credits for the same user can't overlap
  select greatest(coalesce(premium_until, now()), now()) + make_interval(days => p_days)
    into v_until
    from profiles where id = p_user_id
    for update;
  if v_until is null then
    raise exception 'account_missing: %', p_user_id;
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
