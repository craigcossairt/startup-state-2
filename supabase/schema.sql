-- Paste into the Supabase SQL editor for project jcyiqxdneyamxhkvhfvv.
-- Public read only. Do not add ungated write policies.

create table if not exists public.resources (
  id bigint generated always as identity primary key,
  external_id text,
  title text not null,
  description text,
  communities text[] not null default '{}',
  industries text[] not null default '{}',
  locations text[] not null default '{}',
  topics text[] not null default '{}',
  link text,
  email text
);

create table if not exists public.startups (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  website text,
  linkedin_url text,
  description text,
  full_address text,
  city text,
  region text,
  lat double precision,
  lng double precision,
  sector text not null default 'Other',
  stage text,
  employees_bucket text not null default 'Undisclosed',
  revenue_bucket text not null default 'Undisclosed',
  founding_year integer,
  is_hiring boolean not null default false,
  careers_url text,
  logo_url text,
  og_image_url text
);

alter table public.resources enable row level security;
alter table public.startups enable row level security;

drop policy if exists resources_public_read on public.resources;
create policy resources_public_read on public.resources for select using (true);

drop policy if exists startups_public_read on public.startups;
create policy startups_public_read on public.startups for select using (true);
