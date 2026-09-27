-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create goals table
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  goal_type text not null check (goal_type in ('short_term', 'long_term')),
  deadline timestamp with time zone not null,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'abandoned')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create commitments table (weekly goals under long-term goals)
create table public.commitments (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  week_starting date not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'skipped')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create check_ins table (daily check-ins)
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  goal_id uuid not null references public.goals (id) on delete cascade,
  check_in_date date not null,
  what_did_you_do text,
  what_did_you_skip text,
  why text,
  ai_response text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, goal_id, check_in_date)
);

-- Create pivots table (goal change requests with justifications)
create table public.pivots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  goal_id uuid not null references public.goals (id) on delete cascade,
  requested_new_goal text not null,
  reason_1 text not null,
  reason_2 text not null,
  reason_3 text not null,
  ai_decision text not null check (ai_decision in ('approved', 'rejected')),
  ai_reasoning text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.commitments enable row level security;
alter table public.check_ins enable row level security;
alter table public.pivots enable row level security;

-- Create RLS policies
create policy "Users can only see their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can only see their own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can only insert their own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can only update their own goals"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Users can only see their own commitments"
  on public.commitments for select
  using (auth.uid() = user_id);

create policy "Users can only insert their own commitments"
  on public.commitments for insert
  with check (auth.uid() = user_id);

create policy "Users can only update their own commitments"
  on public.commitments for update
  using (auth.uid() = user_id);

create policy "Users can only see their own check-ins"
  on public.check_ins for select
  using (auth.uid() = user_id);

create policy "Users can only insert their own check-ins"
  on public.check_ins for insert
  with check (auth.uid() = user_id);

create policy "Users can only update their own check-ins"
  on public.check_ins for update
  using (auth.uid() = user_id);

create policy "Users can only see their own pivots"
  on public.pivots for select
  using (auth.uid() = user_id);

create policy "Users can only insert their own pivots"
  on public.pivots for insert
  with check (auth.uid() = user_id);

-- Create trigger to create profile on new auth user
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create indexes for performance
create index goals_user_id_idx on public.goals (user_id);
create index commitments_user_id_idx on public.commitments (user_id);
create index commitments_goal_id_idx on public.commitments (goal_id);
create index check_ins_user_id_idx on public.check_ins (user_id);
create index check_ins_goal_id_idx on public.check_ins (goal_id);
create index check_ins_date_idx on public.check_ins (check_in_date);
create index pivots_user_id_idx on public.pivots (user_id);
