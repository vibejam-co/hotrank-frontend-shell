# HOTRANK Phase 1 — Invite-30 Requirements

Target: approximately 30 real AI creators in a private, invite-only cohort. This is a requirements map, not an implementation plan.

## Must exist before invitations

### Access and identity

- Supabase Auth with verified email/OAuth redirect configuration for the actual beta origin.
- An invitation record or allowlist with one-time token, expiry, revocation, inviter/source, acceptance time, and user linkage.
- Protected onboarding that creates exactly one owned `UserProfile`/creator identity with unique handle and editable profile fields.
- A safe role model separating creator, member, moderator, and admin; no client-writable privilege fields.
- Account recovery, sign-out, session refresh, and an owner-approved support path.

### Creator and content ownership

- Source URL validation for the supported platforms, canonical URL normalization, duplicate detection enforced by the database/server, and clear failure states.
- Submission fields for title, source/media references, creator attribution, ownership/rights declaration, creator notes, and timestamps.
- Pending/approved/rejected/archived lifecycle with content removal and takedown handling.
- A creator can view and edit only allowed fields on their own pending content; approved content changes require a review path.

### Editorial and ranking

- A moderator/admin queue with auditable approve/reject/archive actions and protected role checks.
- Rankings sourced only from approved content, with deterministic score inputs and a trusted ranking refresh boundary.
- Current rank, score, movement, and ranking snapshot time sufficient for the frozen live/rankings/detail surfaces.
- A rollback switch to pause new submissions or unpublish content without deleting source records.

### User state and prompt attribution

- Authenticated saves and follows with owner-scoped mutations and tested multi-user isolation.
- Prompt/recipe attribution fields tied to the creator and submission, with free/private visibility rules that do not leak private text.
- Invite-30 may show locked/premium presentation, but must not charge or grant access from a mock checkout.

### Operations and legal readiness

- Snapshot/backup procedure before any content reset or migration.
- Error monitoring, audit records for invites/submissions/moderation, and minimal privacy-conscious analytics: invite accepted, onboarding completed, submission created, review decision, clip view, save, follow, and error.
- Creator terms/rights language, attribution policy, removal/takedown process, privacy policy, and a support owner.
- Test accounts for member, creator, moderator, and admin roles plus RLS/authorization regression tests.

## Can wait until public launch

- Open signup and self-serve creator onboarding.
- Public discovery/search expansion, SEO/OG metadata, and public sharing optimization.
- Full collections, saved prompts, notifications, and rich activity history if not required by the frozen V1 surfaces.
- Automated Apify ingestion, scheduled high-volume ranking jobs, and media transcoding/managed uploads.
- Payment checkout, creator payouts, tax handling, refunds, and revenue splits.
- Large-scale abuse tooling, rate-limit tuning, moderation queues, analytics dashboards, and public creator growth systems.
- Vercel production/domain cutover, DNS changes, and public launch runbooks.

## Invite-30 acceptance gate

Do not invite creators until a signed-out/signed-in/creator/moderator/admin matrix passes, no P0 security finding remains, all Class D remote data is reconciled, and the canonical frontend regression suite passes at the locked route/viewport set.
