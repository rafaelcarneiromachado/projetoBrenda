alter table public.profiles
  add column if not exists email text;

alter table public.profiles
  add column if not exists account_status text not null default 'active'
  check (account_status in ('active', 'blocked'));

update public.profiles profile
set
  email = coalesce(profile.email, auth_user.email),
  full_name = coalesce(
    nullif(profile.full_name, ''),
    auth_user.raw_user_meta_data ->> 'full_name',
    auth_user.raw_user_meta_data ->> 'name'
  )
from auth.users auth_user
where profile.id = auth_user.id;

create or replace function public.admin_promote_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Apenas moderadores podem promover usuários.';
  end if;

  update public.profiles
  set role = 'admin'
  where id = target_user_id;
end;
$$;

create or replace function public.admin_set_account_status(
  target_user_id uuid,
  next_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Apenas moderadores podem alterar status de conta.';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'Você não pode bloquear a própria conta administrativa.';
  end if;

  if next_status not in ('active', 'blocked') then
    raise exception 'Status de conta inválido.';
  end if;

  update public.profiles
  set account_status = next_status
  where id = target_user_id;
end;
$$;
