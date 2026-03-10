-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 6: Task Responsibility Workflow Extensions
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Extend Participants Table with Status
do $$ begin
  if not exists (select 1 from pg_type where typname = 'participant_status') then
    create type participant_status as enum ('PENDING', 'ACCEPTED', 'REJECTED');
  end if;
end $$;

alter table public.participants 
add column if not exists status participant_status default 'PENDING' not null;

-- 2. Notifications Table
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
      'CHANGES_REQUESTED'
    );
  end if;
end $$;

create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete cascade not null,
  sender_id uuid references public.users(id) on delete cascade not null,
  type notification_type not null,
  message text not null,
  is_read boolean default false not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications" on public.notifications for select using (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications" on public.notifications for update using (auth.uid() = user_id);

-- 3. Attachments Table
create table if not exists public.attachments (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  url text not null,
  file_type text,
  size_bytes integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.attachments enable row level security;

drop policy if exists "Attachments are viewable by task participants" on public.attachments;
create policy "Attachments are viewable by task participants" on public.attachments 
for select using (
  exists (
    select 1 from public.participants 
    where task_id = attachments.task_id and user_id = auth.uid()
  )
);

drop policy if exists "Participants can upload attachments" on public.attachments;
create policy "Participants can upload attachments" on public.attachments for insert with check (
  exists (
    select 1 from public.participants 
    where task_id = attachments.task_id and user_id = auth.uid()
  )
);

-- 4. Enable Realtime
-- Note: These might error if already added, but Supabase UI handles publication updates well.
-- We wrap them in a safety block just in case.
do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when others then 
  raise notice 'Table public.notifications already in publication';
end $$;

do $$ begin
  alter publication supabase_realtime add table public.attachments;
exception when others then 
  raise notice 'Table public.attachments already in publication';
end $$;
