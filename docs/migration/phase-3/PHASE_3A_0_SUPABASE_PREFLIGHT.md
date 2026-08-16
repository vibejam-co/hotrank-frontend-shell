# HOTRANK Phase 3A-0 — Supabase Account and Project Identification Preflight

## Scope and safety

This preflight is read-only. It inspected local documentation, repository
metadata, legacy source/configuration, and local CLI help only. It did not
log in or out, list remote projects, link a repository, query SQL, apply a
migration, modify Auth/RLS/Storage/Edge Functions, change environment
variables, connect the canonical frontend, access Vercel, or deploy.

## Local project identity evidence

The strongest local candidate is:

- project ref: `csuejshnycgbfvtjbxoq`
- project URL: `https://csuejshnycgbfvtjbxoq.supabase.co`
- primary legacy source: `/Users/Ira/Desktop/HOTRANK`
- corroborating legacy shell: `/Users/Ira/Desktop/hotrank-frontend-shell`

Evidence is consistent across independent local artifacts:

1. `/Users/Ira/Desktop/HOTRANK/supabase/.temp/project-ref` contains the
   candidate ref.
2. `/Users/Ira/Desktop/HOTRANK/.env` contains the corresponding
   `VITE_SUPABASE_URL` hostname. The key value was not read or recorded.
3. `/Users/Ira/Desktop/HOTRANK/check_schema.cjs` contains the same public
   project URL.
4. `/Users/Ira/Desktop/hotrank-frontend-shell/.env.local` contains the same
   public project URL. Its anon-key value was not read or recorded.

This establishes a high-confidence local identity candidate, not proof that
the current authenticated account owns it or that the remote schema is still
current. No other HOTRANK project ref was found in the inspected local
metadata.

## Legacy Supabase artifacts

The primary legacy repository contains a local Supabase configuration with
the project label `HOTRANK`, local API/database/Studio/Auth/Storage services,
Realtime and Edge Runtime enabled, and local Auth redirects. It contains 12
migrations plus a seed file.

Known schema fingerprints from local migrations include:

- `creators`, `clips`, and `rankings`;
- Auth-linked `profiles` and `submissions`;
- `follows`, `ignites`, and `saves`;
- `prompt_unlocks`;
- profile/bootstrap and submission-status functions; and
- Edge Functions named `apify-webhook`, `dodo-checkout`, and `dodo-webhook`.

The legacy shell confirms the public environment contract
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` and uses a direct browser
Supabase client. The canonical frontend does not contain these integrations.

## Canonical repository link and CLI state

- canonical repo Supabase link: `NONE` — no `supabase/` or `.supabase/` link
  metadata exists under `/Users/Ira/Desktop/hotrank-frontend-final`;
- installed Supabase CLI: `2.84.2`;
- current CLI account: an existing default authenticated CLI profile is
  presumed from the prior local audit, but its identity was not queried in
  this phase;
- unrelated account touched: `NO` during this preflight;
- remote projects queried: `NO` during this preflight;
- secret values exposed: `NO`.

The Phase 1 audit recorded that the currently authenticated account exposed
only unrelated WIZUP projects and no HOTRANK project. That prior finding was
not re-queried or broadened here.

## Owner authentication handoff

Owner authentication is required before Phase 3A-1. Supabase CLI 2.84.2
supports named profiles through the global `--profile` flag and supports
non-browser token login. The safest handoff preserves the current default
profile and uses a dedicated `hotrank` profile:

```sh
read -s HOTRANK_SUPABASE_PAT
supabase login --profile hotrank --name hotrank --no-browser --token "$HOTRANK_SUPABASE_PAT"
unset HOTRANK_SUPABASE_PAT
```

The owner must run this action using a personal access token for the account
that owns or can verify the HOTRANK project. The token must not be pasted into
this thread, committed, or written into repository files. This preflight does
not execute the command.

## Phase 3A-1 read-only verification plan

After owner authentication, Phase 3A-1 should use only the named profile and
stop immediately if the candidate ref is absent or belongs to an unexpected
organization:

1. List projects with `supabase projects list --profile hotrank --output json`
   and require an exact match for `csuejshnycgbfvtjbxoq`; record only safe
   project metadata such as ref, name, organization, region, and status.
2. Compare remote migration versions, without applying or repairing anything,
   against the local migration history. Do not export row data.
3. Confirm schema fingerprints using read-only metadata: `profiles`,
   `submissions`, `creators`, `clips`, `rankings`, `follows`, `ignites`,
   `saves`, and `prompt_unlocks` where present.
4. Confirm known Auth and function fingerprints: Auth-linked profile trigger,
   submission status protection, and the named Edge Functions. Verify their
   deployed state without invoking them.
5. Inspect RLS enablement and policies read-only, especially for core content,
   profile, submission, interaction, and prompt-unlock surfaces.
6. Reconcile the local Phase 1 security findings before any adapter or
   frontend connection is considered: self-service admin escalation,
   fail-open Dodo verification, core-table RLS, global ranking writes,
   private prompt exposure, broad submission updates, client-controlled Dodo
   identity/price, webhook replay/business-claim checks, direct browser
   mutations, and session-refresh wiring.

Matching the project ref alone is insufficient. Phase 3A-1 must require the
ref plus multiple schema/migration/Auth/function signals before declaring the
remote project HOTRANK.

## Phase 1 security evidence to carry forward

The local Phase 1 reports identify two P0 blockers and multiple P1 issues. No
remote state is inferred from them, and none is fixed by this preflight:

- P0: user-editable `profiles.is_admin` can undermine moderation authority;
- P0: missing Dodo webhook secret can fail open;
- P1: core content RLS and global ranking-write trust boundary;
- P1: broad public submission reads can expose private prompt fields;
- P1: broad owner updates and client-controlled payment identity/price;
- P1: webhook replay/business-claim validation gaps;
- P1: direct browser mutation boundary and incomplete session refresh; and
- P1: mixed Vite/Next deployment contract.

## External systems

Vercel remains out of scope. No Vercel account, project, environment, domain,
DNS, payment dashboard, or external deployment was inspected or modified.

`EXTERNAL VERIFICATION DEFERRED TO PHASE 3+`
