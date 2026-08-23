-- HOTRANK production foundation: additive rights and moderation audit data.
-- This migration is prepared for the deployment gate and is not applied by
-- this local certification mission.

alter table public.submissions
  add column if not exists rights_confirmed boolean not null default false,
  add column if not exists moderation_decision text,
  add column if not exists review_ruleset_version text,
  add column if not exists reviewed_at timestamptz;

alter table public.submissions
  drop constraint if exists submissions_moderation_decision_check;

alter table public.submissions
  add constraint submissions_moderation_decision_check
  check (moderation_decision is null or moderation_decision in ('APPROVED', 'NEEDS_CHANGES', 'REJECTED', 'ESCALATED'));

create table if not exists private.submission_moderation_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  decision text not null check (decision in ('APPROVED', 'NEEDS_CHANGES', 'REJECTED', 'ESCALATED')),
  review_ruleset_version text not null,
  review_method text not null check (review_method in ('deterministic', 'review_agent', 'independent_adjudicator')),
  mechanical_checks jsonb not null default '[]'::jsonb,
  agent_assessment jsonb,
  confidence numeric,
  reason_codes text[] not null default '{}',
  reviewed_at timestamptz not null default now()
);

revoke all on table private.submission_moderation_reviews from public, anon, authenticated;
grant select, insert on table private.submission_moderation_reviews to service_role;

create or replace function public.hotrank_create_submission_v2(
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
  p_workflow_notes_included boolean,
  p_rights_confirmed boolean
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  created_id uuid;
begin
  if p_actor_id is null or p_rights_confirmed is not true then
    raise exception 'authenticated rights declaration is required';
  end if;

  insert into public.submissions (
    source_url, platform, external_content_id, embed_url,
    preview_thumbnail, creator_notes, submitter_id, status, title,
    creator_handle, canonical_url, prompt_text, prompt_visibility,
    prompt_price, ai_stack, workflow_notes, recipe_included,
    ai_stack_included, workflow_notes_included, rights_confirmed,
    moderation_decision, reviewed_at
  ) values (
    p_source_url, p_platform, p_external_content_id, p_embed_url,
    p_preview_thumbnail, p_creator_notes, p_actor_id, 'pending', p_title,
    p_creator_handle, p_canonical_url, p_prompt_text,
    coalesce(p_prompt_visibility, 'free'), p_prompt_price,
    coalesce(p_ai_stack, '[]'::jsonb), p_workflow_notes,
    coalesce(p_recipe_included, false), coalesce(p_ai_stack_included, false),
    coalesce(p_workflow_notes_included, false), true, null, null
  )
  returning id into created_id;

  return created_id;
end;
$$;

create or replace function public.hotrank_record_moderation_review(
  p_actor_id uuid,
  p_submission_id uuid,
  p_decision text,
  p_review_ruleset_version text,
  p_review_method text,
  p_mechanical_checks jsonb,
  p_agent_assessment jsonb,
  p_confidence numeric,
  p_reason_codes text[]
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  next_status text;
begin
  if not private.is_admin_actor(p_actor_id) then
    raise exception 'moderation requires protected administrator authority';
  end if;
  if p_decision not in ('APPROVED', 'NEEDS_CHANGES', 'REJECTED', 'ESCALATED') then
    raise exception 'invalid moderation decision';
  end if;
  next_status := case p_decision when 'APPROVED' then 'approved' when 'REJECTED' then 'rejected' else 'pending' end;

  insert into private.submission_moderation_reviews (
    submission_id, decision, review_ruleset_version, review_method,
    mechanical_checks, agent_assessment, confidence, reason_codes
  ) values (
    p_submission_id, p_decision, p_review_ruleset_version, p_review_method,
    coalesce(p_mechanical_checks, '[]'::jsonb), p_agent_assessment,
    p_confidence, coalesce(p_reason_codes, '{}')
  );

  update public.submissions
  set status = next_status,
      moderation_decision = p_decision,
      review_ruleset_version = p_review_ruleset_version,
      reviewed_at = now()
  where id = p_submission_id;

  if not found then raise exception 'submission does not exist'; end if;
end;
$$;

revoke all on function public.hotrank_create_submission_v2(uuid, text, text, text, text, text, text, text, text, text, text, text, integer, jsonb, text, boolean, boolean, boolean, boolean) from public, anon, authenticated;
grant execute on function public.hotrank_create_submission_v2(uuid, text, text, text, text, text, text, text, text, text, text, text, integer, jsonb, text, boolean, boolean, boolean, boolean) to service_role;
revoke all on function public.hotrank_record_moderation_review(uuid, uuid, text, text, text, jsonb, jsonb, numeric, text[]) from public, anon, authenticated;
grant execute on function public.hotrank_record_moderation_review(uuid, uuid, text, text, text, jsonb, jsonb, numeric, text[]) to service_role;
