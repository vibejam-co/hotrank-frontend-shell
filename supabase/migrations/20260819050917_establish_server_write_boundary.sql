-- HOTRANK Phase 3B: the only application mutation path exposed to the API is
-- server-only RPC. Browser roles receive no table DML or function execution.

create unique index if not exists rankings_clip_category_uidx
  on public.rankings (clip_id, category);

create or replace function public.hotrank_update_profile(
  p_actor_id uuid,
  p_profile_id uuid,
  p_username text,
  p_display_name text,
  p_handle text,
  p_avatar_url text,
  p_bio text,
  p_links jsonb
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  if p_actor_id is null or p_profile_id is null then
    raise exception 'profile actor and target are required';
  end if;

  if p_actor_id <> p_profile_id and not private.is_admin_actor(p_actor_id) then
    raise exception 'profile update is not authorized';
  end if;

  update public.profiles
  set username = p_username,
      display_name = p_display_name,
      handle = p_handle,
      avatar_url = p_avatar_url,
      bio = p_bio,
      links = coalesce(p_links, '[]'::jsonb)
  where id = p_profile_id;

  if not found then
    raise exception 'profile does not exist';
  end if;
end;
$$;

create or replace function public.hotrank_create_submission(
  p_actor_id uuid,
  p_source_url text,
  p_platform text,
  p_external_content_id text,
  p_embed_url text,
  p_preview_thumbnail text,
  p_creator_notes text,
  p_title text,
  p_creator_handle text,
  p_canonical_url text,
  p_prompt_text text,
  p_prompt_visibility text,
  p_prompt_price integer,
  p_ai_stack jsonb,
  p_workflow_notes text,
  p_recipe_included boolean,
  p_ai_stack_included boolean,
  p_workflow_notes_included boolean
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  created_id uuid;
begin
  if p_actor_id is null then
    raise exception 'submission actor is required';
  end if;

  insert into public.submissions (
    source_url, platform, external_content_id, embed_url,
    preview_thumbnail, creator_notes, submitter_id, status, title,
    creator_handle, canonical_url, prompt_text, prompt_visibility,
    prompt_price, ai_stack, workflow_notes, recipe_included,
    ai_stack_included, workflow_notes_included
  ) values (
    p_source_url, p_platform, p_external_content_id, p_embed_url,
    p_preview_thumbnail, p_creator_notes, p_actor_id, 'pending', p_title,
    p_creator_handle, p_canonical_url, p_prompt_text,
    coalesce(p_prompt_visibility, 'free'), p_prompt_price,
    coalesce(p_ai_stack, '[]'::jsonb), p_workflow_notes,
    coalesce(p_recipe_included, false), coalesce(p_ai_stack_included, false),
    coalesce(p_workflow_notes_included, false)
  )
  returning id into created_id;

  return created_id;
end;
$$;

create or replace function public.hotrank_update_submission(
  p_actor_id uuid,
  p_submission_id uuid,
  p_embed_url text,
  p_preview_thumbnail text,
  p_creator_notes text,
  p_title text,
  p_creator_handle text,
  p_canonical_url text,
  p_prompt_text text,
  p_prompt_visibility text,
  p_prompt_price integer,
  p_ai_stack jsonb,
  p_workflow_notes text,
  p_recipe_included boolean,
  p_ai_stack_included boolean,
  p_workflow_notes_included boolean
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_actor_id is null or p_submission_id is null then
    raise exception 'submission actor and target are required';
  end if;

  update public.submissions
  set embed_url = p_embed_url,
      preview_thumbnail = p_preview_thumbnail,
      creator_notes = p_creator_notes,
      title = p_title,
      creator_handle = p_creator_handle,
      canonical_url = p_canonical_url,
      prompt_text = p_prompt_text,
      prompt_visibility = coalesce(p_prompt_visibility, prompt_visibility),
      prompt_price = p_prompt_price,
      ai_stack = coalesce(p_ai_stack, '[]'::jsonb),
      workflow_notes = p_workflow_notes,
      recipe_included = coalesce(p_recipe_included, false),
      ai_stack_included = coalesce(p_ai_stack_included, false),
      workflow_notes_included = coalesce(p_workflow_notes_included, false)
  where id = p_submission_id
    and submitter_id = p_actor_id
    and status = 'pending';

  if not found then
    raise exception 'only the owner of a pending submission may edit it';
  end if;
end;
$$;

create or replace function public.hotrank_moderate_submission(
  p_actor_id uuid,
  p_submission_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  if not private.is_admin_actor(p_actor_id) then
    raise exception 'moderation requires protected administrator authority';
  end if;

  perform set_config('hotrank.actor_id', p_actor_id::text, true);
  update public.submissions
  set status = p_status
  where id = p_submission_id;

  if not found then
    raise exception 'submission does not exist';
  end if;
end;
$$;

create or replace function public.hotrank_claim_creator(
  p_actor_id uuid,
  p_creator_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  if p_actor_id is null or p_creator_id is null then
    raise exception 'creator actor and target are required';
  end if;

  update public.creators
  set user_id = p_actor_id
  where id = p_creator_id
    and (user_id is null or private.is_admin_actor(p_actor_id));

  if not found then
    raise exception 'creator is unavailable for this ownership claim';
  end if;
end;
$$;

create or replace function public.hotrank_save_submission(
  p_actor_id uuid,
  p_submission_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not exists (
    select 1 from public.submissions
    where id = p_submission_id and status = 'approved'
  ) then
    raise exception 'only approved submissions may be saved';
  end if;

  insert into public.saves (user_id, submission_id)
  values (p_actor_id, p_submission_id)
  on conflict do nothing;
end;
$$;

create or replace function public.hotrank_remove_save(
  p_actor_id uuid,
  p_submission_id uuid
)
returns void
language sql
security definer
set search_path = pg_catalog, public
as $$
  delete from public.saves
  where user_id = p_actor_id and submission_id = p_submission_id;
$$;

create or replace function public.hotrank_follow_profile(
  p_actor_id uuid,
  p_following_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_actor_id is null or p_following_id is null or p_actor_id = p_following_id then
    raise exception 'invalid follow relationship';
  end if;

  if not exists (select 1 from public.profiles where id = p_following_id) then
    raise exception 'follow target does not exist';
  end if;

  insert into public.follows (follower_id, following_id)
  values (p_actor_id, p_following_id)
  on conflict do nothing;
end;
$$;

create or replace function public.hotrank_unfollow_profile(
  p_actor_id uuid,
  p_following_id uuid
)
returns void
language sql
security definer
set search_path = pg_catalog, public
as $$
  delete from public.follows
  where follower_id = p_actor_id and following_id = p_following_id;
$$;

create or replace function public.hotrank_add_ignite(
  p_actor_id uuid,
  p_submission_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not exists (
    select 1 from public.submissions
    where id = p_submission_id and status = 'approved'
  ) then
    raise exception 'only approved submissions may be ignited';
  end if;

  insert into public.ignites (user_id, submission_id)
  values (p_actor_id, p_submission_id)
  on conflict do nothing;
end;
$$;

create or replace function public.hotrank_remove_ignite(
  p_actor_id uuid,
  p_submission_id uuid
)
returns void
language sql
security definer
set search_path = pg_catalog, public
as $$
  delete from public.ignites
  where user_id = p_actor_id and submission_id = p_submission_id;
$$;

create or replace function public.hotrank_upsert_ranking(
  p_actor_id uuid,
  p_clip_id uuid,
  p_category text,
  p_rank_position integer,
  p_trend_direction text
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  ranking_id uuid;
begin
  if not private.is_admin_actor(p_actor_id) then
    raise exception 'ranking administration requires protected administrator authority';
  end if;

  insert into public.rankings (clip_id, category, rank_position, trend_direction)
  values (p_clip_id, p_category, p_rank_position, p_trend_direction)
  on conflict (clip_id, category) do update
  set rank_position = excluded.rank_position,
      trend_direction = excluded.trend_direction
  returning id into ranking_id;

  return ranking_id;
end;
$$;

create or replace function public.hotrank_delete_ranking(
  p_actor_id uuid,
  p_ranking_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  if not private.is_admin_actor(p_actor_id) then
    raise exception 'ranking administration requires protected administrator authority';
  end if;

  delete from public.rankings where id = p_ranking_id;
end;
$$;

create or replace function public.hotrank_grant_admin(
  p_actor_id uuid,
  p_target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, private
as $$
begin
  if not private.is_admin_actor(p_actor_id) then
    raise exception 'administrator grants require protected administrator authority';
  end if;

  insert into private.admin_users (user_id)
  values (p_target_user_id)
  on conflict (user_id) do nothing;
end;
$$;

create or replace function public.hotrank_revoke_admin(
  p_actor_id uuid,
  p_target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, private
as $$
begin
  if not private.is_admin_actor(p_actor_id) then
    raise exception 'administrator revocation requires protected administrator authority';
  end if;

  delete from private.admin_users where user_id = p_target_user_id;
end;
$$;

do $$
declare
  function_row record;
begin
  for function_row in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname like 'hotrank_%'
  loop
    execute format('revoke all on function %s from public, anon, authenticated', function_row.signature);
    execute format('grant execute on function %s to service_role', function_row.signature);
  end loop;
end;
$$;
