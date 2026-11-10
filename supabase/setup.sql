-- ============================================================================
-- Tom's Space — backend setup for Supabase
--
-- Run this ONCE: Supabase dashboard → SQL Editor → New query → paste → Run.
--
-- BEFORE YOU RUN IT: replace REPLACE_WITH_YOUR_LOGIN_EMAIL (one place, below)
-- with the email you will sign in with as the owner. Until you do, nobody —
-- including you — can add or delete anything (it fails closed, on purpose).
--
-- What it sets up
--   * a `projects` table that holds every library entry
--   * a public `portfolio` storage bucket for screenshots and videos
--   * rules: EVERYONE can view; ONLY the owner email can add, edit or delete
-- ============================================================================

-- ---------- Who is the owner? ----------------------------------------------

create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = lower('REPLACE_WITH_YOUR_LOGIN_EMAIL')
$$;

-- ---------- Table ------------------------------------------------------------

create table if not exists public.projects (
  id          uuid primary key,
  category    text not null check (category in ('frontend', 'ux', 'story')),
  name        text not null check (char_length(name) between 1 and 80),
  description text not null default '' check (char_length(description) <= 600),
  tools       text[] not null default '{}',
  live_url    text not null default '',
  github_url  text not null default '',
  image_path  text not null,
  video_path  text,
  created_at  timestamptz not null default now()
);

create index if not exists projects_category_created_idx
  on public.projects (category, created_at desc);

alter table public.projects enable row level security;

drop policy if exists "Anyone can view projects" on public.projects;
create policy "Anyone can view projects"
  on public.projects for select
  using (true);

drop policy if exists "Owner can add projects" on public.projects;
create policy "Owner can add projects"
  on public.projects for insert
  to authenticated
  with check (public.is_owner());

drop policy if exists "Owner can edit projects" on public.projects;
create policy "Owner can edit projects"
  on public.projects for update
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

drop policy if exists "Owner can delete projects" on public.projects;
create policy "Owner can delete projects"
  on public.projects for delete
  to authenticated
  using (public.is_owner());

-- ---------- Storage (screenshots + videos) -----------------------------------
-- Public bucket: anyone with a file's link can view it, which is what lets
-- visitors watch your videos. 52428800 bytes = 50 MB per file, the free-plan cap.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio',
  'portfolio',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Owner can upload portfolio files" on storage.objects;
create policy "Owner can upload portfolio files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio' and public.is_owner());

drop policy if exists "Owner can replace portfolio files" on storage.objects;
create policy "Owner can replace portfolio files"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio' and public.is_owner())
  with check (bucket_id = 'portfolio' and public.is_owner());

drop policy if exists "Owner can delete portfolio files" on storage.objects;
create policy "Owner can delete portfolio files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio' and public.is_owner());
