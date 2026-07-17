-- Nithishkumar K portfolio backend
-- Run this entire file in the Supabase SQL Editor.
-- Authentication method: passwordless email OTP.

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.site_profile (
  id integer primary key default 1 check (id = 1),
  name text not null,
  intro text,
  headline text,
  tagline text,
  summary text,
  role text,
  location text,
  email text,
  whatsapp text,
  phone_display text,
  linkedin text,
  github text,
  resume_url text,
  portfolio_version text,
  cgpa text,
  graduation text,
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id text primary key,
  name text not null,
  subtitle text,
  category text,
  status text,
  icon_url text,
  fallback text,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key,
  title text not null,
  kicker text,
  status text,
  summary text,
  tags text[] not null default '{}',
  repo_url text,
  live_url text,
  image_url text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  icon text,
  updated_at timestamptz not null default now()
);

alter table public.projects add column if not exists image_url text;

create table if not exists public.credentials (
  id text primary key,
  title text not null,
  issuer text,
  type text,
  issued text,
  score text,
  description text,
  verification_url text,
  file_url text,
  image_url text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.admins enable row level security;
alter table public.site_profile enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.credentials enable row level security;

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.site_profile, public.skills, public.projects, public.credentials to anon, authenticated;
grant insert, update, delete on public.site_profile, public.skills, public.projects, public.credentials to authenticated;

-- Public read policies.
drop policy if exists "Public can read profile" on public.site_profile;
create policy "Public can read profile"
on public.site_profile for select
to anon, authenticated
using (true);

drop policy if exists "Public can read skills" on public.skills;
create policy "Public can read skills"
on public.skills for select
to anon, authenticated
using (true);

drop policy if exists "Public can read projects" on public.projects;
create policy "Public can read projects"
on public.projects for select
to anon, authenticated
using (true);

drop policy if exists "Public can read credentials" on public.credentials;
create policy "Public can read credentials"
on public.credentials for select
to anon, authenticated
using (true);

-- Administrator write policies.
drop policy if exists "Admins manage profile" on public.site_profile;
create policy "Admins manage profile"
on public.site_profile for all
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "Admins manage skills" on public.skills;
create policy "Admins manage skills"
on public.skills for all
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "Admins manage projects" on public.projects;
create policy "Admins manage projects"
on public.projects for all
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "Admins manage credentials" on public.credentials;
create policy "Admins manage credentials"
on public.credentials for all
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

-- Public storage bucket for resume, certificates, badges, skill logos, and project images.
insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view portfolio assets" on storage.objects;
create policy "Public can view portfolio assets"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'portfolio-assets');

drop policy if exists "Admins upload portfolio assets" on storage.objects;
create policy "Admins upload portfolio assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'portfolio-assets'
  and (select public.is_portfolio_admin())
);

drop policy if exists "Admins update portfolio assets" on storage.objects;
create policy "Admins update portfolio assets"
on storage.objects for update
to authenticated
using (
  bucket_id = 'portfolio-assets'
  and (select public.is_portfolio_admin())
)
with check (
  bucket_id = 'portfolio-assets'
  and (select public.is_portfolio_admin())
);

drop policy if exists "Admins delete portfolio assets" on storage.objects;
create policy "Admins delete portfolio assets"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'portfolio-assets'
  and (select public.is_portfolio_admin())
);

-- After inviting nithishdev29@gmail.com in Authentication > Users,
-- copy that user's UUID and run this separately:
-- insert into public.admins (user_id)
-- values ('PASTE-AUTH-USER-UUID-HERE')
-- on conflict (user_id) do nothing;
