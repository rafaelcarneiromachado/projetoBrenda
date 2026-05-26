create extension if not exists "pgcrypto";

create type public.user_role as enum ('family', 'host', 'admin');
create type public.lodging_type as enum ('room', 'sofa', 'entire_home', 'guest_house', 'mattress', 'other');
create type public.review_status as enum ('pending', 'in_review', 'approved', 'rejected', 'suspended');
create type public.request_status as enum ('pending', 'in_review', 'matched', 'completed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  account_status text not null default 'active' check (account_status in ('active', 'blocked')),
  cep text,
  address text,
  address_number text,
  address_complement text,
  city text,
  state text,
  family_info text,
  bio text,
  avatar_url text,
  role public.user_role not null default 'family',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  state text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  created_at timestamptz not null default now()
);

create table public.lodgings (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  type public.lodging_type not null,
  city text not null,
  neighborhood text not null,
  approximate_address text,
  nearest_hospital text,
  capacity integer not null default 1 check (capacity between 1 and 10),
  bathroom text not null,
  availability text,
  accessibility boolean not null default false,
  available_now boolean not null default false,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lodging_conditions (
  id uuid primary key default gen_random_uuid(),
  lodging_id uuid not null references public.lodgings(id) on delete cascade,
  label text not null
);

create table public.lodging_photos (
  id uuid primary key default gen_random_uuid(),
  lodging_id uuid not null references public.lodgings(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table public.stay_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  responsible_name text not null,
  phone text not null,
  origin_city text not null,
  hospital_name text not null,
  hospital_city text not null,
  arrival_date date not null,
  nights integer not null check (nights > 0),
  guest_type text not null,
  people_count integer not null check (people_count > 0),
  notes text,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.internal_notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  stay_request_id uuid references public.stay_requests(id) on delete cascade,
  lodging_id uuid references public.lodgings(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now(),
  check (
    stay_request_id is not null
    or lodging_id is not null
  )
);

alter table public.profiles enable row level security;
alter table public.hospitals enable row level security;
alter table public.lodgings enable row level security;
alter table public.lodging_conditions enable row level security;
alter table public.lodging_photos enable row level security;
alter table public.stay_requests enable row level security;
alter table public.internal_notes enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;

create policy "Profiles can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Profiles can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Anyone can read approved lodgings"
  on public.lodgings for select
  using (status = 'approved' or auth.uid() = host_id);

create policy "Hosts can insert own lodgings"
  on public.lodgings for insert
  with check (auth.uid() = host_id);

create policy "Hosts can update own pending lodgings"
  on public.lodgings for update
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

create policy "Anyone can read conditions for visible lodgings"
  on public.lodging_conditions for select
  using (
    exists (
      select 1 from public.lodgings
      where lodgings.id = lodging_conditions.lodging_id
      and (lodgings.status = 'approved' or lodgings.host_id = auth.uid())
    )
  );

create policy "Hosts can insert conditions for own lodgings"
  on public.lodging_conditions for insert
  with check (
    exists (
      select 1 from public.lodgings
      where lodgings.id = lodging_conditions.lodging_id
      and lodgings.host_id = auth.uid()
    )
  );

create policy "Anyone can read photos for visible lodgings"
  on public.lodging_photos for select
  using (
    exists (
      select 1 from public.lodgings
      where lodgings.id = lodging_photos.lodging_id
      and (lodgings.status = 'approved' or lodgings.host_id = auth.uid())
    )
  );

create policy "Hosts can insert photos for own lodgings"
  on public.lodging_photos for insert
  with check (
    exists (
      select 1 from public.lodgings
      where lodgings.id = lodging_photos.lodging_id
      and lodgings.host_id = auth.uid()
    )
  );

create policy "Users can read own stay requests"
  on public.stay_requests for select
  using (auth.uid() = requester_id);

create policy "Users can insert own stay requests"
  on public.stay_requests for insert
  with check (auth.uid() = requester_id);

create policy "Users can update own stay requests"
  on public.stay_requests for update
  using (auth.uid() = requester_id)
  with check (auth.uid() = requester_id);

create policy "Hospitals are readable"
  on public.hospitals for select
  using (true);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins can update profile roles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can read all lodgings"
  on public.lodgings for select
  using (public.is_admin());

create policy "Admins can update lodgings"
  on public.lodgings for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can read all lodging conditions"
  on public.lodging_conditions for select
  using (public.is_admin());

create policy "Admins can read all lodging photos"
  on public.lodging_photos for select
  using (public.is_admin());

create policy "Admins can read all stay requests"
  on public.stay_requests for select
  using (public.is_admin());

create policy "Admins can update stay requests"
  on public.stay_requests for update
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('lodging-photos', 'lodging-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do nothing;

create policy "Hosts can upload lodging photos"
  on storage.objects for insert
  with check (
    bucket_id = 'lodging-photos'
    and auth.role() = 'authenticated'
  );

create policy "Authenticated users can read lodging photos"
  on storage.objects for select
  using (
    bucket_id = 'lodging-photos'
    and auth.role() = 'authenticated'
  );

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'profile-avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'profile-avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Anyone can read profile avatars"
  on storage.objects for select
  using (bucket_id = 'profile-avatars');
