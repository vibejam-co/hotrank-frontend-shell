# HOTRANK Production Readiness

Date: 2026-08-23
Current code checkpoint: `47bbb52`

## Product truth

The canonical application is the frozen HOTRANK editorial shell for ranking AI
clips. Authenticated Profile and Saved surfaces now read through the server
read API, so authenticated identity is not replaced by the Lena Marlowe demo
fixture. Empty remote account state is honest.

Creator identity has a server-bound claim boundary. Submission intake binds the
authenticated actor, validates required metadata and rights, starts pending,
and cannot accept browser-selected moderation or ranking status.

The prepared moderation system uses deterministic checks, narrow review-agent
and independent-adjudicator interfaces, concise audit facts, and fail-closed
ESCALATED behavior. Provider activation is still an owner gate.

Public projections expose approved content only and mask locked/private prompt
text. Ranking reads are separate from moderation decisions and browser users do
not receive direct table DML.

## Readiness checks

- Auth/Google/session: PASS from Phase 3C-LIVE-B.
- Real profile identity boundary: PASS in code/tests; authenticated owner retest
  evidence is recorded in Phase 3C-LIVE-B, with final preview verification still
  required after deployment access is established.
- Creator identity boundary: PASS, server actor-bound claim RPC.
- Submission boundary: PASS in code/tests; additive migration is prepared,
  not remotely applied.
- Moderation foundation: PASS as provider-neutral fail-closed foundation.
- Private prompt protection: PASS.
- Approved-only ranking/publication boundary: PASS.
- Legal launch surfaces: drafts prepared; owner legal review required.
- PostHog: specification only; not installed and not a deployment blocker.
- HOTRANK Supabase project match: PASS.
- Active Dodo runtime: ABSENT from canonical app.
- WIZUP fallback: ABSENT from canonical runtime.
- Client privileged secret exposure: NONE.

## Remaining gates

P0 deployment gate: canonical Vercel project/domain ownership and access are
not discoverable from this repository/account. `hotrank.xyz` currently
redirects to `www.hotrank.xyz`, whose legacy Vercel deployment is not one of
the visible HOTRANK canonical projects.

P1: apply/rehearse the prepared moderation migration, activate an approved
review provider before broad public submissions, complete legal review, and
perform a preview authenticated runtime retest.

## Verification

`npm run typecheck`, `npm test`, `npm run lint`, and the focused Phase
3B/3C/Phase 4 boundary tests pass. The eight Supabase public projections each
returned HTTP 200 with the browser-safe key, and the explicit Supabase-mode
read API returned successfully for home, rankings, creators, clip detail,
activity, profile, saved, saved prompts, search, and submission resources.
Production build and representative route smoke pass. Responsive visual smoke
passes at desktop, tablet, and mobile widths with no horizontal overflow; the
tablet hero/header overflow was repaired in `47bbb52`. Client bundle and
browser-entrypoint privileged-secret scans are clean, and OAuth diagnostic
noise is absent. No remote mutations, deployment, DNS change, payment
operation, or push occurred.
