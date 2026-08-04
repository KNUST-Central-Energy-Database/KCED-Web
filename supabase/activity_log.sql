-- Activity log for the dashboard "Recent Activity" feed.
-- Populated by triggers so events from BOTH the web portal and the mobile
-- app land here without either client doing anything.
--
-- Run this in the Supabase SQL editor.

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('service_request', 'work_order', 'asset', 'user')),
  entity_id text not null,
  action text not null check (action in ('created', 'status_changed')),
  -- Display snapshot (issue / title / asset code / name) so the feed
  -- survives the source row being renamed or deleted.
  title text not null,
  -- For status_changed: the new status.
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_created_at_idx
  on public.activity_log (created_at desc);

alter table public.activity_log enable row level security;

-- Only logged-in dashboard users can read the feed. No insert policy:
-- rows are only written by the SECURITY DEFINER trigger functions below,
-- which bypass RLS (so e.g. anonymous service-request submissions still log).
create policy "Authenticated read"
  on public.activity_log for select
  to authenticated
  using (true);

-- ── service_requests ────────────────────────────────────────────────────────

create or replace function public.log_service_request_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into activity_log (entity_type, entity_id, action, title)
    values ('service_request', new.id::text, 'created', coalesce(new.issue, 'Untitled request'));
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into activity_log (entity_type, entity_id, action, title, detail)
    values ('service_request', new.id::text, 'status_changed', coalesce(new.issue, 'Untitled request'), new.status::text);
  end if;
  return new;
end;
$$;

drop trigger if exists service_request_activity on public.service_requests;
create trigger service_request_activity
  after insert or update on public.service_requests
  for each row execute function public.log_service_request_activity();

-- ── work_orders ─────────────────────────────────────────────────────────────

create or replace function public.log_work_order_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into activity_log (entity_type, entity_id, action, title)
    values ('work_order', new.id::text, 'created', coalesce(new.title, 'Untitled work order'));
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into activity_log (entity_type, entity_id, action, title, detail)
    values ('work_order', new.id::text, 'status_changed', coalesce(new.title, 'Untitled work order'), new.status::text);
  end if;
  return new;
end;
$$;

drop trigger if exists work_order_activity on public.work_orders;
create trigger work_order_activity
  after insert or update on public.work_orders
  for each row execute function public.log_work_order_activity();

-- ── assets ──────────────────────────────────────────────────────────────────

create or replace function public.log_asset_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into activity_log (entity_type, entity_id, action, title)
  values ('asset', new.id::text, 'created', coalesce(new.asset_code, 'New asset'));
  return new;
end;
$$;

drop trigger if exists asset_activity on public.assets;
create trigger asset_activity
  after insert on public.assets
  for each row execute function public.log_asset_activity();

-- ── users ───────────────────────────────────────────────────────────────────

create or replace function public.log_user_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into activity_log (entity_type, entity_id, action, title)
  values ('user', new.id::text, 'created', coalesce(new.full_name, new.email, 'New user'));
  return new;
end;
$$;

drop trigger if exists user_activity on public.users;
create trigger user_activity
  after insert on public.users
  for each row execute function public.log_user_activity();
