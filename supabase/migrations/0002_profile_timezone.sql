-- =============================================================================
-- Carry the signup timezone onto the profile.
--
-- Check-ins are keyed by calendar date, so a user in Sydney whose profile says
-- UTC gets the wrong "today" for a third of every day. The browser knows the
-- right answer at signup; this makes sure it survives.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, timezone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'timezone', ''), 'UTC')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
