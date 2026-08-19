# HOTRANK Phase 3B — Security Remediation

Date: 2026-08-19
Project: HOTRANK / `csuejshnycgbfvtjbxoq`
Organization: HotRank AI / `oswgjjphugeqvilmmupn`

## Scope and result

Phase 3B hardened the exact HOTRANK Supabase project. The canonical frontend
was not connected, redesigned, or behaviorally changed. The fixture adapter
remains the runtime source.

The remote project identity was verified as HOTRANK in `eu-west-1`. The
separate WIZUP project shown by account listing was not queried or modified.

## Recovery gate

Supabase physical backups were unavailable and PITR was disabled. The approved
change set therefore excludes row mutation entirely. Existing rows were
verified by aggregate counts before and after remediation:

- profiles: 9
- submissions: 8
- follows: 4
- ignites: 6
- saves: 3
- prompt_unlocks: 0
- clips, creators, rankings: 0
- Storage buckets and objects: 0

The deployed Dodo function bundles were downloaded to protected temporary
storage outside Git before retirement. No private row contents were exported.
The pre-change schema/policy/function fingerprint was recorded in
`PHASE_3B_REMOTE_TRUTH.json`. Rollback is through inverse SQL and, if ever
needed, redeployment from the protected function bundles. The limitation is
that there is no provider-managed point-in-time restore for this project.

## Admin authority

`profiles.is_admin` is preserved for historical compatibility but is no longer
an authorization source. Existing marked administrators were copied into the
RLS-protected `private.admin_users` relation. A trigger rejects new or changed
legacy `is_admin` values. Admin grants and revocations use server-only RPCs.

All browser roles have no base-table privileges, and no policy trusts the
client-mutable legacy field. The negative matrix confirmed that browser roles
cannot update profiles or execute moderation/ranking RPCs.

## Dodo retirement

`dodo-checkout` and `dodo-webhook` were deleted from the HOTRANK project. Both
former function URLs return HTTP 404. The two HOTRANK Dodo runtime secret names
were removed. No payment request, checkout, webhook, or transaction was
invoked. Historical `prompt_unlocks` schema/data was preserved and has no new
Dodo write path.

Account-level Dodo credential revocation cannot be performed through the
authorized HOTRANK Supabase environment; it remains an external owner action.
It does not block the removal of the deployed HOTRANK attack surface.

## RLS and public/private separation

RLS is enabled and forced on all nine application tables:

`profiles`, `submissions`, `creators`, `clips`, `rankings`, `follows`,
`ignites`, `saves`, and `prompt_unlocks`.

Base-table browser privileges are revoked. Public presentation reads use
explicit SELECT-only projections. The submission projection includes only
approved public content and returns prompt text only for free prompts. It
excludes submitter identity, moderation status, creator notes, prompt price,
AI stack, workflow notes, payment history, and Dodo identifiers. Raw saves,
follows, and ignites remain private; only deliberate aggregate count views are
public.

The first remote verification exposed broad default ACLs on newly-created
views. A repair migration explicitly revoked those ACLs and re-granted SELECT
only. A subsequent scope repair restricted public save/ignite aggregates to
approved submissions. The final remote ACL and projection checks passed.

## Server-side mutation boundary

Protected server-only RPCs cover profile edits, submission creation and
owner-scoped edits, moderation, creator claims, saves, follows, ignites,
ranking projection administration, and protected admin grants/revocations.
Browser roles have no execute privilege on these RPCs and no direct table DML.
Ranking writes are only available through protected administrator authority.

The canonical frontend service layer was not changed to call these functions.
Phase 3C is explicitly not started.

## Database functions

`handle_new_user()` retains required Auth bootstrap behavior, uses a pinned
`search_path`, and uses user metadata only for profile presentation fields—not
authorization. `protect_submission_status()` retains owner archive behavior,
uses protected administrator authority, supports server mutation context, and
has a pinned `search_path`. Browser execution was revoked for both functions.

Remote verification found zero security-definer functions without a pinned
search path.

## Storage/media contract

Storage is intentionally still empty. No production media was uploaded.

Future contract:

- `hotrank-public-media`: public read only for moderated/finalized media;
  writes only through server-issued ownership-bound upload authority.
- `hotrank-private-submissions`: private source/workflow uploads; reads,
  signed URLs, and deletion are server-authorized.
- Object paths are generated server-side and include the owning user and an
  opaque object identifier; client-supplied paths are not trusted.
- Ownership metadata is recorded with the submission/creator owner and is
  checked on upload, read, replacement, and deletion.
- Moderation/takedown can make public objects inaccessible without deleting
  historical submission records; deletion is admin/server-only and auditable.

These buckets are documented only and were not created in Phase 3B.

## Verification

Passed:

- TypeScript typecheck
- unit/runtime/boundary tests
- Phase 3B static security-negative tests
- production build
- lint (existing `<img>` performance warnings only)
- transactional exact-project migration dry run
- remote RLS, ACL, view-column, function, Auth-trigger, migration-history,
  count, Dodo absence, and Storage checks
- fixture-adapter verification

The documented agent-browser skill is available, but its executable is not
installed in this managed workspace. The local dev server booted successfully;
representative desktop/tablet/mobile visual automation could not be run. The
production build route smoke checks returned HTTP 200 for representative
routes, and the existing final-lock captures were preserved. No presentation
files were modified by Phase 3B.

The Supabase CLI `db lint` and `migration list` commands could not run because
the repository was not linked with a database password. Equivalent exact-
project remote SQL verification was performed through the Management API with
the inherited `SUPABASE_ACCESS_TOKEN`; the Supabase connector/advisor path was
permission-denied.

## Boundary certification

- Supabase adapter active in frontend: **NO**
- Fixture adapter active: **YES**
- Canonical presentation modified by Phase 3B: **NO**
- Vercel, DNS, and WIZUP touched: **NO**
- Payment provider introduced: **NO**
- Production media uploaded: **NO**
- Data rows deleted: **0**

The canonical frontend remains frozen and Phase 3C remains out of scope.
