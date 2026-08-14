# HOTRANK Phase 1 — Data Classification

No data was deleted, migrated, queried from a remote database, or rewritten in this phase.

## Classification

| Class | Data | Evidence/location | Treatment |
|---|---|---|---|
| A — SAFE TO PRESERVE | Verified approved clips, creator-owned content, canonical creator profiles, explicit attribution and rights records | Legacy schema supports `submissions`, `profiles`, `creators`, and approved status; actual remote rows were not available | Preserve only after identity, ownership, status, and duplicate reconciliation |
| B — SYSTEM DATA, PRESERVE | Auth identities, profile ownership links, follow/save relationships, ranking configuration/projections, moderation roles, migration history, audit/activity records if later found | `auth.users`, `profiles`, `follows`, `saves`, `rankings`, `profiles.is_admin`, migrations | Preserve by controlled export/snapshot; never treat as presentation content |
| C — DEMO/PLACEHOLDER, CANDIDATE FOR PURGE | Canonical frontend static arrays/local media, legacy `supabase/seed.sql`, `lib/mock-data.ts`, `src/data/mockData.ts`, shell mock adapter/data, `example.com/demo/...` URLs, initials/pravatar fallbacks, mock Dodo checkout responses | `/Users/Ira/Desktop/hotrank-frontend-final/lib/data.ts`; `/Users/Ira/Desktop/HOTRANK/supabase/seed.sql`; legacy mock files; shell adapter | Candidate for a deliberate content reset only after owner review and a preserved snapshot |
| D — UNKNOWN, HUMAN REVIEW REQUIRED | Current remote Supabase rows, whether `clips` or `submissions` is authoritative, duplicate content across both models, remote prompt unlocks, live invitation/account state, production Vercel project state | External Supabase project was not visible to the authenticated CLI; no HOTRANK Vercel project was visible | Quarantine from automated purge or migration until an owner-authorized export and schema comparison exists |
| E — LEGALLY/SENSITIVELY IMPORTANT, NEVER AUTO-DELETE | User PII, auth/account records, creator rights/ownership declarations, takedown/removal history, prompt content, payment/customer identifiers, unlock records, secrets, OAuth configuration, webhook credentials | `auth.users`, profile/submission fields, `prompt_unlocks`, environment contracts, payment/webhook code | Preserve under access control; secrets stay in a secret manager and should be rotated if exposure is suspected |

## Content findings

- The canonical frontend is presentation-only and currently uses static/demo data. Its profile, creator, clip, saved, activity, and submit fixtures are not production records.
- The legacy SQL seed is explicitly demo data: fictional handles, fixed UUIDs, `example.com` media URLs, and generated scores.
- The legacy repository contains a real schema shape for submissions and interactions, but repository evidence cannot prove that any remote rows are real, current, or safe to reset.
- No production customer/subscription table was found. `prompt_unlocks` is the only payment-adjacent table found, and its live contents are unknown.
- No named Supabase Storage bucket or upload path was found. External media URLs should be treated as references, not owned assets.

## Reset rule

The requested fresh presentation-ready content start should purge only Class C after a human-approved inventory and backup. Class A, B, D, and E require explicit reconciliation or preservation decisions; Phase 1 performs none of them.
