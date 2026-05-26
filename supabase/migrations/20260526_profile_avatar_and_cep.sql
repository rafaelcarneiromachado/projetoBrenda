alter table public.profiles
  add column if not exists cep text;

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do nothing;

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
