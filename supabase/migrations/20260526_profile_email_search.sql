alter table public.profiles
  add column if not exists email text;

update public.profiles profile
set email = auth_user.email
from auth.users auth_user
where profile.id = auth_user.id
and profile.email is null;
