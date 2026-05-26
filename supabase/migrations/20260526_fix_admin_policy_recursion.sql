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

drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Admins can read all lodgings" on public.lodgings;
drop policy if exists "Admins can update lodgings" on public.lodgings;
drop policy if exists "Admins can read all stay requests" on public.stay_requests;
drop policy if exists "Admins can update stay requests" on public.stay_requests;

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins can read all lodgings"
  on public.lodgings for select
  using (public.is_admin());

create policy "Admins can update lodgings"
  on public.lodgings for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can read all stay requests"
  on public.stay_requests for select
  using (public.is_admin());

create policy "Admins can update stay requests"
  on public.stay_requests for update
  using (public.is_admin())
  with check (public.is_admin());
