drop policy if exists "Hosts can read matched requests for own lodgings"
  on public.stay_requests;

create policy "Hosts can read matched requests for own lodgings"
  on public.stay_requests for select
  using (
    status = 'matched'
    and exists (
      select 1
      from public.lodgings
      where lodgings.id = stay_requests.lodging_id
      and lodgings.host_id = auth.uid()
    )
  );

drop policy if exists "Matched participants can read connection profiles"
  on public.profiles;

create policy "Matched participants can read connection profiles"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.stay_requests
      join public.lodgings on lodgings.id = stay_requests.lodging_id
      where stay_requests.status = 'matched'
      and (
        (
          stay_requests.requester_id = auth.uid()
          and profiles.id = lodgings.host_id
        )
        or (
          lodgings.host_id = auth.uid()
          and profiles.id = stay_requests.requester_id
        )
      )
    )
  );
