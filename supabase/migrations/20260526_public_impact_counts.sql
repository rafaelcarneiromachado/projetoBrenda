create or replace function public.public_impact_counts()
returns table (
  available_lodgings bigint,
  lodging_requests bigint,
  registered_users bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*) from public.lodgings where status = 'approved') as available_lodgings,
    (select count(*) from public.stay_requests) as lodging_requests,
    (select count(*) from public.profiles where account_status = 'active') as registered_users;
$$;

grant execute on function public.public_impact_counts() to anon, authenticated;
