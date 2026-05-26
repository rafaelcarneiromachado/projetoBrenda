drop policy if exists "Admins can read all lodging conditions" on public.lodging_conditions;
drop policy if exists "Admins can read all lodging photos" on public.lodging_photos;

create policy "Admins can read all lodging conditions"
  on public.lodging_conditions for select
  using (public.is_admin());

create policy "Admins can read all lodging photos"
  on public.lodging_photos for select
  using (public.is_admin());
