# HOTRANK Phase 1 — Security Findings

This is source/configuration inspection only. No destructive testing, external probing, database write, payment write, or deployment action was performed.

## P0 SECURITY

### P0-1 — Self-service administrator escalation

Evidence: `supabase/migrations/20260426000002_profile_identity_layer.sql`, `20260426000003_phase5_rls.sql`, `20260428_moderation_controls.sql`.

`profiles.is_admin` is used as the authorization source for moderation. The profile update policy checks only `auth.uid() = id` and does not restrict mutable columns. A signed-in user can therefore attempt to update their own `is_admin` value through the exposed table API. Because moderation policies and the status-protection trigger trust that flag, this is a privilege-escalation path.

Required disposition: remove client-writable privilege fields; move roles to a protected role/claims model; make moderation mutations server-side; add negative RLS tests before any production reuse.

### P0-2 — Missing Dodo webhook secret becomes successful verification

Evidence: `supabase/functions/dodo-webhook/index.ts` and `mcp/dodo/src/index.ts`.

When `DODO_PAYMENTS_WEBHOOK_SECRET` is missing, verification returns `verified: true`/mock success. The Edge Function can then use the Supabase service-role key to upsert a prompt unlock. If that function were deployed with the service-role key but without the webhook secret, an unauthenticated forged event could grant unlock state.

Required disposition: fail closed when the secret is absent; verify signature, timestamp age, event identity, product/amount, prompt ownership, and idempotency before any service-role write. Do not expose a mock-success path in a deployed endpoint.

## P1 SECURITY

### P1-1 — Core content tables lack explicit RLS enablement

The initial migrations create `creators`, `clips`, and `rankings` but never enable RLS or define policies for them. `recomputeRankings()` performs global reads, updates, deletes, and upserts through a user session. A normal signed-in submission can therefore invoke a global ranking mutation path, and effective PostgREST grants must not be assumed safe without a remote policy audit.

### P1-2 — Global ranking integrity is coupled to user submission

`lib/ingestion.ts`, `app/(app)/submit/actions.ts`, and `lib/ranking.ts` let a user-created request write a clip and recompute the global ranking projection. Scores are partly generated from client-provided values or deterministic URL-derived values. Ranking refresh must be an isolated server job/RPC with approved inputs and an auditable write owner.

### P1-3 — Public submission reads expose private prompt fields

`submissions` has a broad public select policy while the same table stores `prompt_text`, `prompt_visibility`, `prompt_price`, `ai_stack`, and `workflow_notes`. A locked/private prompt cannot rely on UI omission for confidentiality. Use safe public views/RPCs and a separate authorization-checked prompt projection.

### P1-4 — Submission owner update scope is too broad

The owner update policy is row-scoped but not column-scoped. The application can attempt to protect status with a trigger, but source URL, submitter ownership, attribution, prompt fields, and moderation-relevant metadata remain part of a broad direct-table update surface. Add immutable ownership and server-validated update operations.

### P1-5 — Dodo checkout trusts client-controlled identity and price inputs

`dodo-checkout` accepts `videoId` and `promptPriceCents` from the request, does not require a verified user, allows `Access-Control-Allow-Origin: *`, creates a product dynamically, and passes a client-derived user ID into payment metadata. The server must load the canonical prompt and price, require an authenticated user, constrain the origin, and use an idempotent product/checkout record.

### P1-6 — Dodo webhook lacks replay and business-claim checks

The Edge Function checks a signature when configured but does not enforce timestamp age/replay protection, constant-time comparison, a known event ID, a known product/price, prompt visibility, or that the metadata user owns the checkout. The service-role upsert trusts `prompt_id` and `user_id` from event metadata.

### P1-7 — Missing trust boundary in the shell adapter

`hotrank-frontend-shell/src/lib/integrations/hotrank.ts` is a useful interface seed but performs saves, follows, ignites, profile updates, and submission inserts directly from the browser. Its client-side URL allowlist and duplicate probe are not authorization or uniqueness controls.

### P1-8 — Session refresh wiring is incomplete in the legacy Next tree

`utils/supabase/middleware.ts` defines an update helper, but no root Next middleware invoking it was found. This can make cookie/session refresh unreliable. It must be reconciled before reusing the Next server path.

### P1-9 — Mixed Vite/Next deployment contract

The legacy repository declares Vite as its root app while carrying a separate Next app tree, and `vercel.json` rewrites every path to `/`. This can bypass or collapse API/auth route behavior and makes environment ownership ambiguous.

## P2 SECURITY

### P2-1 — Security-definer functions do not set an explicit `search_path`

The `handle_new_user` and `protect_submission_status` functions are `security definer` but do not pin a safe `search_path`. Harden them before reuse.

### P2-2 — Apify webhook is unauthenticated and non-functional

`apify-webhook` returns a mock acknowledgment and does not validate a provider signature, fetch a dataset, normalize it, or persist an idempotent job result. It is not a production ingestion endpoint.

### P2-3 — Mock fallback can obscure payment/configuration failures

The client and Dodo MCP return mock success when configuration or requests fail. This is acceptable for local UI scaffolding only and must be disabled in any environment that can be mistaken for production.

### P2-4 — Storage and external media have no verified ownership policy

No named bucket, upload flow, MIME policy, or media retention policy was found. External `video_url`, thumbnail, and avatar values are accepted as references without a verified storage boundary.

### P2-5 — Environment-name coupling and hardcoded test endpoints

The two legacy systems use both `VITE_*` and `NEXT_PUBLIC_*` Supabase contracts. Dodo is hardcoded to `https://test.dodopayments.com`, while auth redirect settings are local. This is configuration drift, not production evidence.

### P2-6 — No durable audit, notification, or ranking-history model

Moderation, ranking movement, user activity, and payment unlock decisions lack a complete append-only audit/event model. This weakens incident response and rollback evidence.

## Secret-surface result

Environment values, tokens, passwords, private keys, service-role keys, and webhook secrets were not printed. The local legacy repo contains an ignored `.env` and a tracked `.env.example` contract; no secret value is part of this report. The presence of a local environment file is not proof of a valid or current production configuration.

## Security disposition

The legacy backend is not safe to connect to the frozen frontend as-is. P0 findings must be closed before any authenticated invite cohort is connected. P1 findings require a new server-side adapter and RLS/authorization test matrix. P2 findings can be sequenced into the migration waves but cannot be silently carried into production.
