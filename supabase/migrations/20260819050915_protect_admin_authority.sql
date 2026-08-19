-- HOTRANK Phase 3B: preserve legacy profile state while moving authorization
-- to a server-controlled relation. This migration intentionally does not
-- delete or rewrite existing profile rows.

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table if not exists private.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now()
);

alter table private.admin_users enable row level security;
alter table private.admin_users force row level security;
revoke all on table private.admin_users from public, anon, authenticated;

-- Preserve every previously marked administrator without continuing to trust
-- the client-writable legacy column as an authorization source of truth.
insert into private.admin_users (user_id)
select id
from public.profiles
where is_admin is true
on conflict (user_id) do nothing;

create or replace function private.is_admin_actor(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, private
as $$
  select exists (
    select 1
    from private.admin_users
    where user_id = p_user_id
  );
$$;

revoke all on function private.is_admin_actor(uuid) from public, anon, authenticated;
grant execute on function private.is_admin_actor(uuid) to service_role;

create or replace function private.prevent_legacy_admin_mutation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if tg_op = 'INSERT' and coalesce(new.is_admin, false) then
    raise exception 'profiles.is_admin is legacy state and cannot be assigned';
  end if;

  if tg_op = 'UPDATE' and old.is_admin is distinct from new.is_admin then
    raise exception 'profiles.is_admin is legacy state and cannot be changed';
  end if;

  return new;
end;
$$;

revoke all on function private.prevent_legacy_admin_mutation() from public, anon, authenticated;

drop trigger if exists profiles_legacy_admin_guard on public.profiles;
create trigger profiles_legacy_admin_guard
before insert or update on public.profiles
for each row execute function private.prevent_legacy_admin_mutation();

comment on column public.profiles.is_admin is
  'Legacy compatibility field only; authorization is sourced from private.admin_users.';
