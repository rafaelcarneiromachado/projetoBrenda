drop policy if exists "Admins can update profile roles" on public.profiles;

create policy "Admins can update profile roles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());
