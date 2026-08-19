-- Supabase creates broad default ACLs for new views in this project. Revoke
-- them explicitly after view creation and re-grant read-only access.

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
to anon, authenticated, service_role;
