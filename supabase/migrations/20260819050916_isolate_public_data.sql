-- HOTRANK Phase 3B: base relations are private implementation storage.
-- Public clients receive only explicit safe projections below.

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.submissions enable row level security;
alter table public.submissions force row level security;
alter table public.creators enable row level security;
alter table public.creators force row level security;
alter table public.clips enable row level security;
alter table public.clips force row level security;
alter table public.rankings enable row level security;
alter table public.rankings force row level security;
alter table public.follows enable row level security;
alter table public.follows force row level security;
alter table public.ignites enable row level security;
alter table public.ignites force row level security;
alter table public.saves enable row level security;
alter table public.saves force row level security;
alter table public.prompt_unlocks enable row level security;
alter table public.prompt_unlocks force row level security;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  end loop;
end;
$$;

revoke all privileges on table
  public.profiles,
  public.submissions,
  public.creators,
  public.clips,
  public.rankings,
  public.follows,
  public.ignites,
  public.saves,
  public.prompt_unlocks
from public, anon, authenticated;

drop view if exists
  public.public_profiles,
  public.public_creators,
  public.public_clips,
  public.public_rankings,
  public.public_submissions,
  public.public_follow_counts,
  public.public_ignite_counts,
  public.public_save_counts;

create view public.public_profiles
with (security_barrier = true)
as
select
  p.id,
  p.username,
  p.avatar_url,
  p.created_at,
  p.display_name,
  p.handle,
  p.bio,
  p.links
from public.profiles as p;

create view public.public_creators
with (security_barrier = true)
as
select
  c.id,
  c.username,
  c.avatar_url,
  c.badge_status,
  c.created_at
from public.creators as c;

create view public.public_clips
with (security_barrier = true)
as
select
  c.id,
  c.creator_id,
  c.title,
  c.video_url,
  c.thumbnail_url,
  c.ai_score,
  c.created_at,
  c.category,
  c.retention_rate,
  c.engagement_score,
  c.velocity_multiplier,
  c.view_count
from public.clips as c;

create view public.public_rankings
with (security_barrier = true)
as
select
  r.id,
  r.clip_id,
  r.category,
  r.rank_position,
  r.trend_direction,
  r.created_at
from public.rankings as r;

create view public.public_submissions
with (security_barrier = true)
as
select
  s.id,
  s.source_url,
  s.platform,
  s.external_content_id,
  s.embed_url,
  s.preview_thumbnail,
  s.title,
  s.creator_handle,
  s.canonical_url,
  case
    when s.prompt_visibility = 'free' then s.prompt_text
    else null
  end as prompt_text,
  case
    when s.prompt_visibility = 'free' then 'free'::text
    else 'locked'::text
  end as prompt_visibility,
  s.created_at
from public.submissions as s
where s.status = 'approved';

-- Only aggregate interaction projections are public. Raw ownership rows stay
-- private and are reachable through the protected server mutation boundary.
create view public.public_follow_counts
with (security_barrier = true)
as
select following_id, count(*)::bigint as follower_count
from public.follows
group by following_id;

create view public.public_ignite_counts
with (security_barrier = true)
as
select submission_id, count(*)::bigint as ignite_count
from public.ignites
group by submission_id;

create view public.public_save_counts
with (security_barrier = true)
as
select submission_id, count(*)::bigint as save_count
from public.saves
group by submission_id;

revoke all on
  public.public_profiles,
  public.public_creators,
  public.public_clips,
  public.public_rankings,
  public.public_submissions,
  public.public_follow_counts,
  public.public_ignite_counts,
  public.public_save_counts
from public, anon, authenticated, service_role;

grant select on
  public.public_profiles,
  public.public_creators,
  public.public_clips,
  public.public_rankings,
  public.public_submissions,
  public.public_follow_counts,
  public.public_ignite_counts,
  public.public_save_counts
to anon, authenticated;

grant select on
  public.public_profiles,
  public.public_creators,
  public.public_clips,
  public.public_rankings,
  public.public_submissions,
  public.public_follow_counts,
  public.public_ignite_counts,
  public.public_save_counts
to service_role;

comment on view public.public_submissions is
  'Safe approved-content projection; moderation, owner, payment, workflow, and premium prompt fields are intentionally omitted.';
