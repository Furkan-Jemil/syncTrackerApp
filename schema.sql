-- ─────────────────────────────────────────────────────────────────────────────
-- SyncTracker Database Schema
-- Run this entire script in your Supabase SQL Editor to initialize the DB.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table (Mirror of Auth.Users)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note: In a real production app, you might want an auth trigger to auto-populate this.
-- For now, the app inserts into GoTrue, so we'll enable RLS and let the API sync it if needed.
alter table public.users enable row level security;

-- Policies for Users
drop policy if exists "Users are viewable by everyone" on public.users;
create policy "Users are viewable by everyone" on public.users for select using (true);

drop policy if exists "Users can insert their own profile" on public.users;
create policy "Users can insert their own profile" on public.users for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update VLAN their own profile" on public.users for update using (auth.uid() = id);

-- 2. Tasks Table
do $$ begin
  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type task_status as enum ('ACTIVE', 'IN_REVIEW', 'COMPLETED', 'ARCHIVED');
  end if;
end $$;

create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  assigned_by_id uuid references public.users(id) not null,
  responsible_owner_id uuid references public.users(id) not null,
  status task_status default 'ACTIVE' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Tasks
alter table public.tasks enable row level security;

drop policy if exists "Tasks are viewable by authenticated users" on public.tasks;
create policy "Tasks are viewable by authenticated users" on public.tasks for select using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can create tasks" on public.tasks;
create policy "Authenticated users can create tasks" on public.tasks for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update tasks" on public.tasks;
create policy "Authenticated users can update tasks" on public.tasks for update using (auth.role() = 'authenticated');

-- 3. Participants Table
do $$ begin
  if not exists (select 1 from pg_type where typname = 'participant_role') then
    create type participant_role as enum ('ASSIGNER', 'RESPONSIBLE', 'CONTRIBUTOR', 'HELPER', 'REVIEWER', 'OBSERVER');
  end if;
  if not exists (select 1 from pg_type where typname = 'sync_status') then
    create type sync_status as enum ('IN_SYNC', 'NEEDS_UPDATE', 'BLOCKED', 'HELP_REQUESTED');
  end if;
end $$;

create table if not exists public.participants (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete cascade not null,
  role participant_role not null,
  sync_status sync_status default 'IN_SYNC' not null,
  accepted_at timestamp with time zone,
  last_sync_at timestamp with time zone default timezone('utc'::text, now()),
  total_time_logged integer default 0 not null,
  help_request_count integer default 0 not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, task_id)
);

-- Enable RLS for Participants
alter table public.participants enable row level security;

drop policy if exists "Participants are viewable by everyone" on public.participants;
create policy "Participants are viewable by everyone" on public.participants for select using (true);

drop policy if exists "Authenticated users can join as participants" on public.participants;
create policy "Authenticated users can join as participants" on public.participants for insert with check (auth.role() = 'authenticated');

drop policy if exists "Participants can update their own status" on public.participants;
create policy "Participants can update their own status" on public.participants for update using (auth.uid() = user_id);

-- 4. Milestones Table
create table if not exists public.milestones (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  title text not null,
  "order" integer not null,
  completed_at timestamp with time zone,
  completed_by uuid references public.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Milestones
alter table public.milestones enable row level security;

drop policy if exists "Milestones are viewable by task participants" on public.milestones;
create policy "Milestones are viewable by task participants" on public.milestones for select using (
  exists (
    select 1 from public.participants 
    where task_id = milestones.task_id and user_id = auth.uid()
  )
);

drop policy if exists "Participants can update milestones" on public.milestones;
create policy "Participants can update milestones" on public.milestones for update using (
  exists (
    select 1 from public.participants 
    where task_id = milestones.task_id and user_id = auth.uid()
  )
);

-- 5. Time Entries Table
create table if not exists public.time_entries (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  duration_minutes integer not null,
  description text,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Time Entries
alter table public.time_entries enable row level security;

drop policy if exists "Time entries are viewable by project participants" on public.time_entries;
create policy "Time entries are viewable by project participants" on public.time_entries for select using (
  exists (
    select 1 from public.participants 
    where task_id = time_entries.task_id and user_id = auth.uid()
  )
);

drop policy if exists "Users can log their own time" on public.time_entries;
create policy "Users can log their own time" on public.time_entries for insert with check (auth.uid() = user_id);

-- 6. Sync Logs Table
do $$ begin
  if not exists (select 1 from pg_type where typname = 'sync_log_type') then
    create type sync_log_type as enum (
      'RESPONSIBILITY_ACCEPTED',
      'PARTICIPANT_JOINED',
      'SYNC_STATUS_CHANGED',
      'HELP_REQUESTED',
      'MILESTONE_COMPLETED',
      'TIME_LOGGED',
      'RESPONSIBILITY_TRANSFERRED',
      'NOTE_ADDED'
    );
  end if;
end $$;

create table if not exists public.sync_logs (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  type sync_log_type not null,
  message text not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Sync Logs
alter table public.sync_logs enable row level security;

drop policy if exists "Sync logs are viewable by project participants" on public.sync_logs;
create policy "Sync logs are viewable by project participants" on public.sync_logs for select using (
  exists (
    select 1 from public.participants 
    where task_id = sync_logs.task_id and user_id = auth.uid()
  )
);
drop policy if exists "Participants can create sync logs" on public.sync_logs;
create policy "Participants can create sync logs" on public.sync_logs for insert with check (
  exists (
    select 1 from public.participants 
    where task_id = sync_logs.task_id and user_id = auth.uid()
  )
);

-- 7. Notifications Table
do $$ begin
  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type notification_type as enum (
      'TASK_ASSIGNED',
      'TASK_ACCEPTED',
      'TASK_REJECTED',
      'HELPER_REQUESTED',
      'HELPER_ACCEPTED',
      'TASK_COMPLETED',
      'REVIEW_REQUESTED',
      'CHANGES_REQUESTED',
      'WORK_SUBMITTED'
    );
  end if;
end $$;

create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete cascade,
  sender_id uuid references public.users(id) on delete set null,
  type notification_type not null,
  message text not null,
  is_read boolean default false not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Notifications
alter table public.notifications enable row level security;

drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications" on public.notifications for select using (auth.uid() = user_id);

drop policy if exists "Authenticated users can create notifications" on public.notifications;
create policy "Authenticated users can create notifications" on public.notifications for insert with check (auth.role() = 'authenticated');

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications" on public.notifications for update using (auth.uid() = user_id);

-- 8. Attachments Table
create table if not exists public.attachments (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  url text not null,
  type text default 'file',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Attachments
alter table public.attachments enable row level security;

drop policy if exists "Attachments viewable by task participants" on public.attachments;
create policy "Attachments viewable by task participants" on public.attachments for select using (
  exists (
    select 1 from public.participants
    where task_id = attachments.task_id and user_id = auth.uid()
  )
);

drop policy if exists "Authenticated users can create attachments" on public.attachments;
create policy "Authenticated users can create attachments" on public.attachments for insert with check (auth.role() = 'authenticated');
