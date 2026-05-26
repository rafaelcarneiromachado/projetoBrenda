alter table public.stay_requests
  add column if not exists lodging_id uuid references public.lodgings(id) on delete set null;
