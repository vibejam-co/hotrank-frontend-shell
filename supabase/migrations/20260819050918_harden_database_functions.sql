-- HOTRANK Phase 3B: security-definer functions are narrowly scoped, have
-- pinned search paths, and are not callable by browser roles.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  raw_display_name text;
  raw_handle text;
begin
  raw_display_name := coalesce(
    nullif(new.raw_user_meta_data->>'name', ''),
    nullif(new.raw_user_meta_data->>'user_name', ''),
    split_part(coalesce(new.email, new.id::text), '@', 1)
  );

  raw_handle := lower(
    regexp_replace(
      coalesce(
        nullif(new.raw_user_meta_data->>'preferred_username', ''),
        nullif(new.raw_user_meta_data->>'user_name', ''),
        split_part(coalesce(new.email, new.id::text), '@', 1)
      ),
      '[^a-zA-Z0-9_]+',
      '',
      'g'
    )
  );

  insert into public.profiles (id, username, display_name, handle, avatar_url, links)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'user_name', ''), raw_display_name, new.email),
    raw_display_name,
    nullif(raw_handle, ''),
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    '[]'::jsonb
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.protect_submission_status()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private, auth
as $$
declare
  actor_id uuid;
begin
  actor_id := coalesce(
    nullif(current_setting('hotrank.actor_id', true), '')::uuid,
    auth.uid()
  );

  if old.status is distinct from new.status then
    if private.is_admin_actor(actor_id) then
      return new;
    end if;

    if actor_id = old.submitter_id
       and old.status = 'approved'
       and new.status = 'archived' then
      return new;
    end if;

    raise exception 'Only protected administrators may change submission status, except owners archiving an approved submission.';
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.protect_submission_status() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;
grant execute on function public.protect_submission_status() to service_role;
