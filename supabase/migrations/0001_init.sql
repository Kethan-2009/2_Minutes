-- =============================================================================
-- Two Minutes — initial schema
--
-- Ground rule: every table carries user_id and has row level security ON with
-- owner-only policies. There is no "read all" path, no service-role query in
-- the app, and no analytics table that shadows what people write.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles — one row per auth user
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  timezone    text not null default 'UTC',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are updatable by their owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles are insertable by their owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create the profile the moment the auth user exists, so no screen has to
-- handle "signed in but no profile yet".
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- goals — one primary goal per "mission". Users may have several active.
-- -----------------------------------------------------------------------------

create table if not exists public.goals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  title          text not null,
  why            text,
  horizon        text not null check (horizon in ('short_term', 'long_term')),
  duration_weeks integer check (duration_weeks is null or duration_weeks > 0),
  starts_on      date not null default current_date,
  ends_on        date,
  status         text not null default 'active'
                 check (status in ('active', 'completed', 'abandoned')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- A long-term goal is defined by its duration; a short-term one is not.
  constraint long_term_goals_have_a_duration
    check (horizon <> 'long_term' or duration_weeks is not null)
);

create index if not exists goals_user_status_idx
  on public.goals (user_id, status);

alter table public.goals enable row level security;

create policy "goals are owned by their user"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- commitments — 1-3 weekly commitments per goal, written by the user
-- -----------------------------------------------------------------------------

create table if not exists public.commitments (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  goal_id          uuid not null references public.goals (id) on delete cascade,
  title            text not null,
  target_per_week  integer not null default 1 check (target_per_week > 0),
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists commitments_user_active_idx
  on public.commitments (user_id, is_active);
create index if not exists commitments_goal_idx
  on public.commitments (goal_id);

alter table public.commitments enable row level security;

create policy "commitments are owned by their user"
  on public.commitments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger commitments_set_updated_at
  before update on public.commitments
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- check_ins — one per user per day
-- -----------------------------------------------------------------------------

create table if not exists public.check_ins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  entry_date  date not null default current_date,
  completed_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index if not exists check_ins_user_date_idx
  on public.check_ins (user_id, entry_date desc);

alter table public.check_ins enable row level security;

create policy "check-ins are owned by their user"
  on public.check_ins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger check_ins_set_updated_at
  before update on public.check_ins
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- check_in_messages — the conversation itself. The most sensitive table here.
-- -----------------------------------------------------------------------------

create table if not exists public.check_in_messages (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  check_in_id  uuid not null references public.check_ins (id) on delete cascade,
  role         text not null check (role in ('user', 'assistant')),
  content      text not null,
  created_at   timestamptz not null default now()
);

create index if not exists check_in_messages_check_in_idx
  on public.check_in_messages (check_in_id, created_at);

alter table public.check_in_messages enable row level security;

create policy "check-in messages are owned by their user"
  on public.check_in_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- commitment_progress — what actually happened, per commitment, per check-in
-- -----------------------------------------------------------------------------

create table if not exists public.commitment_progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  commitment_id uuid not null references public.commitments (id) on delete cascade,
  check_in_id   uuid not null references public.check_ins (id) on delete cascade,
  status        text not null check (status in ('done', 'partial', 'skipped')),
  note          text,
  created_at    timestamptz not null default now(),
  unique (commitment_id, check_in_id)
);

create index if not exists commitment_progress_user_idx
  on public.commitment_progress (user_id, created_at desc);

alter table public.commitment_progress enable row level security;

create policy "commitment progress is owned by its user"
  on public.commitment_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- pivot_requests — a change of goal before the deadline, and the reasoning
-- -----------------------------------------------------------------------------

create table if not exists public.pivot_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  goal_id     uuid not null references public.goals (id) on delete cascade,
  -- Answers to the three understanding questions, keyed by question id.
  answers     jsonb not null default '{}'::jsonb,
  reflection  text,
  outcome     text check (outcome in ('pivoted', 'stayed', 'undecided')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists pivot_requests_goal_idx
  on public.pivot_requests (goal_id, created_at desc);

alter table public.pivot_requests enable row level security;

create policy "pivot requests are owned by their user"
  on public.pivot_requests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger pivot_requests_set_updated_at
  before update on public.pivot_requests
  for each row execute function public.set_updated_at();
