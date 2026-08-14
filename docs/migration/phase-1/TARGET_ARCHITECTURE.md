# HOTRANK Phase 1 — Recommended Target Architecture

## Boundary

```text
Canonical HOTRANK Frontend V1
        ↓
Typed domain services and use cases
        ↓
Server-side adapters / route handlers / validated actions
        ↓
Supabase views, RPCs, tables, and protected Edge Functions
        ↓
Legacy data only through an explicit reconciliation adapter
```

The frontend remains presentation-only. Backend replacement, schema reconciliation, and security hardening must be invisible to the canonical routes and components.

## Domain layer

Use canonical domain objects, not database rows:

- `Clip`: id, title, media/source references, creator, ranking score, movement, category, tags, description, prompt summary.
- `Creator`: stable identity, display name, handle, avatar, bio, follower count, ranked clip count, ownership state.
- `RankingEntry`: clip plus rank, score, previous rank, movement, ranking snapshot/time.
- `Prompt`: visibility, prompt text/access state, AI stack, workflow/recipe metadata, attribution.
- `SavedItem`: user-owned saved clip or prompt reference, optional collection reference.
- `Submission`: source URL, normalized metadata, creator/submitter, rights declaration, review status, timestamps.
- `UserProfile`: auth-linked identity, profile fields, roles, invite state.
- `ActivityItem`: typed event projection for saves, follows, submissions, approvals, and ranking moments.

All mappers should be total over missing/legacy fields and should reject unsafe states rather than leaking raw rows into UI props.

## Service interfaces

The first stable interface set should cover only canonical capabilities:

- `getLiveRanking()` and `getRankings(filter)`
- `getClip(id)`
- `getCreators()` and `getCreator(slugOrId)`
- `getCurrentUser()` and `getUserProfile(id)`
- `getSavedItems(userId)` and `setSavedItem(input)`
- `getActivity(userId)`
- `followCreator(input)`
- `submitClip(input)`
- `getSubmission(id)` / `getOwnedSubmissions(userId)`
- `getPromptAccess(clipId, userId)`

Collections, saved prompts, notifications, and payment unlocks should not be added to the beta contract until the canonical UI and Invite-30 scope require them.

## Recommended persistence shape

1. Treat `profiles` as the auth-linked user identity and creator-facing profile boundary. Reconcile or retire the duplicate `creators` identity rather than exposing both to the UI.
2. Treat `submissions` as the source-of-truth content intake record, with immutable submitter ownership and server-validated normalized source metadata.
3. Use a safe public clip/read projection for approved content. Keep moderation and private prompt columns out of public reads.
4. Use `rankings` as a generated current projection owned by a trusted server job/RPC. Add a history/snapshot model only when movement/history cannot be derived safely.
5. Keep `saves` and `follows` as user-owned relations with exact RLS policies and server-side authorization tests. Add collections only when the canonical saved surface needs them.
6. Keep prompt/recipe data behind an explicit access policy. Invite-30 can support free/private metadata without payment; locked/premium access remains a non-billing presentation state until a later approved phase.
7. Use external source URLs and embeds for the first invite cohort. Introduce managed storage only with named buckets, MIME/size limits, ownership paths, signed/private access, and retention policy.

## Trust boundaries

- Browser code may hold only public Supabase configuration and session state.
- Every write goes through a server-side validated action, route, RPC, or narrowly scoped RLS policy.
- Service-role keys are limited to server/Edge functions and never enter client bundles, logs, or error responses.
- Moderation roles are protected claims/role records, not user-editable profile columns.
- Ranking writes are owned by a trusted job or RPC and are never a side effect of an ordinary user submission transaction.
- Payment webhooks fail closed, validate signed event freshness/idempotency/business claims, and write only after server-side reconciliation.
- Public reads use safe views or explicit columns; private prompts, user data, moderation notes, and payment records are never exposed through broad table selects.

## Frontend compatibility rule

Phase 2+ work may add data fetching behind the canonical routes, but must preserve the locked DOM/layout/typography/spacing/navigation/responsive contract and must use the domain mappers. No legacy UI component or CSS asset crosses the boundary.
