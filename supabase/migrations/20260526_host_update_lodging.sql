create or replace function public.host_update_lodging(
  target_lodging_id uuid,
  next_title text,
  next_description text,
  next_type public.lodging_type,
  next_city text,
  next_neighborhood text,
  next_approximate_address text,
  next_nearest_hospital text,
  next_capacity integer,
  next_bathroom text,
  next_availability text,
  next_conditions text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.lodgings
    where id = target_lodging_id
    and host_id = auth.uid()
  ) then
    raise exception 'Hospedagem não encontrada para este anfitrião.';
  end if;

  update public.lodgings
  set
    title = next_title,
    description = next_description,
    type = next_type,
    city = next_city,
    neighborhood = next_neighborhood,
    approximate_address = next_approximate_address,
    nearest_hospital = next_nearest_hospital,
    capacity = next_capacity,
    bathroom = next_bathroom,
    availability = next_availability,
    status = 'pending',
    updated_at = now()
  where id = target_lodging_id;

  delete from public.lodging_conditions
  where lodging_id = target_lodging_id;

  insert into public.lodging_conditions (lodging_id, label)
  select target_lodging_id, condition
  from unnest(coalesce(next_conditions, array[]::text[])) as condition
  where nullif(trim(condition), '') is not null;
end;
$$;

grant execute on function public.host_update_lodging(
  uuid,
  text,
  text,
  public.lodging_type,
  text,
  text,
  text,
  text,
  integer,
  text,
  text,
  text[]
) to authenticated;
