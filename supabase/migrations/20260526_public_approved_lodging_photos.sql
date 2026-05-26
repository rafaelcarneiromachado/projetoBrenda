drop policy if exists "Anyone can read approved lodging photos" on storage.objects;

create policy "Anyone can read approved lodging photos"
  on storage.objects for select
  using (
    bucket_id = 'lodging-photos'
    and exists (
      select 1
      from public.lodgings
      where lodgings.id::text = split_part(storage.objects.name, '/', 2)
      and lodgings.status = 'approved'
    )
  );
