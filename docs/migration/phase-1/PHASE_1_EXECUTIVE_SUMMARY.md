# HOTRANK Phase 1 — Executive Summary

## Outcome

Phase 1 completed as a read-only infrastructure-forensics pass. Two legacy HOTRANK systems were identified:

1. `/Users/Ira/Desktop/HOTRANK` — the primary Supabase/Auth/Postgres/Edge/API/Dodo donor.
2. `/Users/Ira/Desktop/hotrank-frontend-shell` — a Vite shell with a useful typed integration boundary that depends on the first repository.

`/Users/Ira/Desktop/hotrank-latest-preview` was separately recognized as a static presentation snapshot, not a third backend system. WIZUP and RIOT were not touched.

## Decision summary

- Keep the typed adapter boundary as an architectural seed.
- Adapt the legacy `submissions`, profile, ranking projection, saves, follows, prompt metadata, and Auth concepts behind a new trusted domain layer.
- Rebuild ranking history, activity, notifications, collections, saved prompts, secure moderation roles, ingestion, managed storage, analytics, deployment linkage, and any production payment path.
- Retire legacy UI/CSS/layout/navigation/logo/cards/responsive logic, catch-all Vercel rewrite, mock data, and test-mode payment behavior from canonical production paths.

## Data summary

- Canonical frontend arrays/media and legacy SQL/mock fixtures are Class C demo/placeholder candidates.
- Auth/profile/relationship/migration/security data must be preserved as system data.
- Content, rights/attribution, prompt, payment, and customer records are sensitive and never auto-deleted.
- Remote Supabase rows and the authoritative relationship between `clips` and `submissions` remain Class D unknown until an owner-authorized export is available.

## Security summary

Two P0 findings block integration: self-service admin escalation through `profiles.is_admin`, and fail-open Dodo webhook verification when the webhook secret is missing. P1 findings include missing RLS on core tables, global ranking writes coupled to user submissions, public exposure of private prompt columns, broad submission updates, client-controlled checkout identity/price, and a direct browser mutation boundary.

## External verification

External verification is blocked for HOTRANK specifically. Authenticated Vercel access shows only `wizupxyz` and `lumina-intuitive-healing` plus `wizup.xyz` and `aishanur.com`. Authenticated Supabase listing shows only WIZUP projects. No HOTRANK project, `hotrank.xyz` domain, payment dashboard, or production schema state was verified. Later work requires owner-provided HOTRANK Supabase project/org access, Vercel team/project access, `hotrank.xyz` registrar/DNS access, auth-provider configuration, and payment-provider dashboard access if monetization is approved.

## Phase 1 safety result

- Canonical source code was not modified.
- Legacy repositories were not modified.
- No database migration or remote query/write was run.
- No Supabase, Vercel, payment, or DNS write occurred.
- No secret value was printed.
- Existing canonical worktree changes were preserved.

The next safe step is Phase 2: backend isolation layer and typed domain adapters, with no direct legacy UI reuse and no production integration until the P0 findings are closed.
