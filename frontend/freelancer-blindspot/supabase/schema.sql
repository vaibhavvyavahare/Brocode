-- Supabase schema for Freelancer Blindspot
-- Run this in the Supabase SQL Editor.

create extension if not exists "uuid-ossp";

-- Optional per-user global settings/profile table.
create table if not exists public.settings (
  id uuid primary key references auth.users(id) on delete cascade,
  rate_floor numeric not null default 500,
  currency text not null default '₹',
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  client text not null,
  type text not null,
  model text not null,
  price numeric not null default 0,
  "hourlyRate" numeric not null default 0,
  "budgetHours" numeric not null default 0,
  "meetUrl" text,
  threshold numeric not null default 500,
  created_at timestamptz not null default now(),
  constraint projects_model_check check (model in ('fixed', 'hourly'))
);

create table if not exists public.sessions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  "nbCategory" text,
  hours numeric not null,
  note text,
  "startedAt" timestamptz not null,
  "endedAt" timestamptz not null,
  created_at timestamptz not null default now(),
  constraint sessions_type_check check (type in ('billable', 'nonbillable')),
  constraint sessions_hours_check check (hours > 0),
  constraint sessions_time_window_check check ("endedAt" >= "startedAt")
);

-- Backfill compatibility for pre-existing tables in Supabase projects.
alter table public.projects add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.projects add column if not exists title text;
alter table public.projects add column if not exists client text;
alter table public.projects add column if not exists type text;
alter table public.projects add column if not exists model text;
alter table public.projects add column if not exists price numeric default 0;
alter table public.projects add column if not exists "hourlyRate" numeric default 0;
alter table public.projects add column if not exists "budgetHours" numeric default 0;
alter table public.projects add column if not exists "meetUrl" text;
alter table public.projects add column if not exists threshold numeric default 500;
alter table public.projects add column if not exists created_at timestamptz default now();

alter table public.sessions add column if not exists project_id uuid references public.projects(id) on delete cascade;
alter table public.sessions add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.sessions add column if not exists type text;
alter table public.sessions add column if not exists "nbCategory" text;
alter table public.sessions add column if not exists hours numeric;
alter table public.sessions add column if not exists note text;
alter table public.sessions add column if not exists "startedAt" timestamptz;
alter table public.sessions add column if not exists "endedAt" timestamptz;
alter table public.sessions add column if not exists created_at timestamptz default now();

alter table public.settings add column if not exists id uuid references auth.users(id) on delete cascade;
alter table public.settings add column if not exists rate_floor numeric default 500;
alter table public.settings add column if not exists currency text default '₹';
alter table public.settings add column if not exists created_at timestamptz default now();

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists sessions_project_id_idx on public.sessions(project_id);
create index if not exists sessions_user_id_idx on public.sessions(user_id);
create index if not exists sessions_started_at_idx on public.sessions("startedAt");

alter table public.projects enable row level security;
alter table public.sessions enable row level security;
alter table public.settings enable row level security;

-- Projects policies
drop policy if exists "Users can view their own projects" on public.projects;
create policy "Users can view their own projects"
on public.projects for select
using (auth.uid() = user_id);

drop policy if exists "Users can create projects" on public.projects;
create policy "Users can create projects"
on public.projects for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own projects" on public.projects;
create policy "Users can update their own projects"
on public.projects for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own projects" on public.projects;
create policy "Users can delete their own projects"
on public.projects for delete
using (auth.uid() = user_id);

-- Sessions policies
drop policy if exists "Users can view their own sessions" on public.sessions;
create policy "Users can view their own sessions"
on public.sessions for select
using (auth.uid() = user_id);

drop policy if exists "Users can create sessions" on public.sessions;
create policy "Users can create sessions"
on public.sessions for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own sessions" on public.sessions;
create policy "Users can update their own sessions"
on public.sessions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own sessions" on public.sessions;
create policy "Users can delete their own sessions"
on public.sessions for delete
using (auth.uid() = user_id);

-- Settings policies
drop policy if exists "Users can view their own settings" on public.settings;
create policy "Users can view their own settings"
on public.settings for select
using (auth.uid() = id);

drop policy if exists "Users can create their own settings" on public.settings;
create policy "Users can create their own settings"
on public.settings for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their own settings" on public.settings;
create policy "Users can update their own settings"
on public.settings for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can delete their own settings" on public.settings;
create policy "Users can delete their own settings"
on public.settings for delete
using (auth.uid() = id);
