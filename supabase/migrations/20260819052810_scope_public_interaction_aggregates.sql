-- Public interaction aggregates must not disclose identifiers for
-- non-public moderation states.

create or replace view public.public_ignite_counts
with (security_barrier = true)
as
select i.submission_id, count(*)::bigint as ignite_count
from public.ignites as i
join public.submissions as s on s.id = i.submission_id
where s.status = 'approved'
group by i.submission_id;

create or replace view public.public_save_counts
with (security_barrier = true)
as
select sv.submission_id, count(*)::bigint as save_count
from public.saves as sv
join public.submissions as s on s.id = sv.submission_id
where s.status = 'approved'
group by sv.submission_id;

revoke all on public.public_ignite_counts, public.public_save_counts
from public, anon, authenticated, service_role;

grant select on public.public_ignite_counts, public.public_save_counts
to anon, authenticated, service_role;
