alter table public.profiles
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists family_info text,
  add column if not exists bio text,
  add column if not exists avatar_url text;
