# HOTRANK Phase 3A-1 — Remote Supabase Forensics

Date: 2026-08-18
Scope: read-only remote Supabase metadata and local legacy reconciliation.
Project: `HOTRANK` / `csuejshnycgbfvtjbxoq`
Organization: `HotRank AI` / `oswgjjphugeqvilmmupn`

## Executive verdict

The remote identity is correct and the remote migration history matches all
12 local HOTRANK migrations. The project is not safe to connect to the frozen
canonical frontend yet. The remote database confirms both Phase 1 P0 findings:
self-service admin escalation through `profiles.is_admin`, and the Dodo webhook
fail-open path when its secret is absent. Core `clips`, `creators`, and
`rankings` tables have RLS disabled. The active deployed Edge Functions are
`dodo-checkout` and `dodo-webhook`; the expected `apify-webhook` is not
deployed.

Recommended strategy: repair the existing HOTRANK project under a human
Phase 3B gate. This preserves the existing Auth/profile relationships and
avoids an unnecessary account migration, but no purge or frontend connection
is safe until recovery, P0, and P1 gates are closed.

## Safety and local state

- Inherited `SUPABASE_ACCESS_TOKEN` was present and used without printing,
  persisting, or recording its value.
- Default/WIZUP credentials were not used.
- Repository: `/Users/Ira/Desktop/hotrank-frontend-final`.
- Branch: `main`.
- Starting HEAD: `91f7237b7c891462742cc5e7b3f8da160a06e5db`.
- Canonical tag commit: `hotrank-frontend-v1-lock` →
  `1e63e4a7e3b5603c5453c6a79ced27dff9ad33aa`.
- Canonical repository Supabase link: `NONE`.
- Pre-existing dirty/untracked files were preserved; only the two Phase 3
  documentation artifacts are in scope for this phase.

## Local expectation versus remote reality

| Area | Local expectation | Remote reality | Result |
|---|---|---|---|
| Identity | HOTRANK, ref `csuejshnycgbfvtjbxoq`, HotRank AI | Exact match; `eu-west-1` / West EU (Ireland) | MATCH |
| Application tables | `profiles`, `submissions`, `creators`, `clips`, `rankings`, `follows`, `ignites`, `saves`, `prompt_unlocks` | All nine public tables exist | MATCH |
| Public views | None required by legacy inventory | No public views or materialized views | MATCH |
| Functions/triggers | Profile bootstrap and submission-status protection | `handle_new_user()`, `protect_submission_status()`, both security-definer; expected triggers exist | MATCH, security review required |
| Edge Functions | `apify-webhook`, `dodo-checkout`, `dodo-webhook` | Only `dodo-checkout` and `dodo-webhook` active | MISMATCH: `apify-webhook` absent |
| Migrations | 12 files plus seed | 12 applied versions with matching names/order | MATCH |
| Storage | No named application bucket expected | 0 buckets, 0 objects | MATCH/EMPTY |

The full safe metadata inventory is in
[`REMOTE_SUPABASE_TRUTH.json`](./REMOTE_SUPABASE_TRUTH.json).

## Schema findings

The remote schema contains the two legacy content models. `submissions` is a
link-first, prompt-bearing intake table. `clips` and `rankings` form a separate
content/ranking projection, while `creators` is a separate identity table.
`profiles` is Auth-linked and also carries the `is_admin` authorization field.
Interactions use composite keys and point at Auth users or submissions.

The remote schema has no public read views to separate safe approved content
from private prompt/moderation fields. `submissions` includes `prompt_text`,
`prompt_visibility`, `prompt_price`, `ai_stack`, and `workflow_notes`.

## RLS forensics

RLS is enabled on `profiles`, `submissions`, `follows`, `ignites`, `saves`, and
`prompt_unlocks`. RLS is disabled on `clips`, `creators`, and `rankings`.

The remote policy source confirms the known risks:

- `profiles` permits a user to update their own row with a broad `UPDATE`
  policy; no column restriction removes `is_admin` from that write surface.
- Admin submission policies trust `profiles.is_admin`.
- `submissions` is publicly selectable, including prompt-bearing columns.
- Owner submission updates have no `WITH CHECK` expression and are not
  column-scoped.
- `clips` and `rankings` have no RLS boundary at all.

No exploit or mutation was attempted.

## P0 security classifications

### Admin escalation P0 — CONFIRMED REMOTELY

`profiles.is_admin` exists as a non-null boolean. The remote policy
`Users can update their own profile` uses `auth.uid() = id` for both `USING`
and `WITH CHECK`, without protecting privileged columns. Admin submission
policies query that field. This is a self-service privilege-escalation path.

### Dodo fail-open — CONFIRMED

The deployed `dodo-webhook` source returns `{ verified: true, mock: true }`
when `DODO_PAYMENTS_WEBHOOK_SECRET` is absent. The active function then accepts
eligible payment-shaped events and can upsert `prompt_unlocks` with the
service-role key. Signature freshness, replay, event, product, amount,
ownership, and idempotency checks are not enforced. The webhook is also
deployed with `verify_jwt: true`, which must be reconciled with external Dodo
delivery before any payment use.

## Auth

Remote Auth configuration safely confirmed email/password enabled, Google OAuth
enabled, signup not disabled, phone auth disabled, TOTP MFA enabled, custom
OAuth disabled, and no other external provider enabled. The remote `auth.users`
trigger `on_auth_user_created` calls `handle_new_user()`. Exact site URL and
redirect allow-list values were intentionally omitted from the artifact; the
legacy source still contains local/internal redirect assumptions that require
adapter review. No users, identities, emails, or Auth rows were read.

## Edge Functions

Active remote functions:

- `dodo-checkout`, version 8, JWT verification enabled.
- `dodo-webhook`, version 8, JWT verification enabled.

`apify-webhook` is not deployed. The local implementation is only a mock
acknowledgement and is not a production ingestion endpoint. No function was
invoked or deployed.

## Migration history

Remote `supabase_migrations.schema_migrations` contains the exact 12 local
versions from `initial_schema` through `prompt_unlocks`; no missing, remote-only,
or ordering drift was observed. Migration history is therefore classified
**local and remote match**.

## Data presence and classification

Only aggregate counts were read:

| Relation | Count | Classification |
|---|---:|---|
| `profiles` | 9 | B — system data / preserve |
| `submissions` | 8 | D — unknown; prompt-bearing and owner review required |
| `follows` | 4 | B — system data / preserve |
| `ignites` | 6 | B — system data / preserve |
| `saves` | 3 | B — system data / preserve |
| `clips` | 0 | D — empty |
| `creators` | 0 | D — empty |
| `rankings` | 0 | D — empty |
| `prompt_unlocks` | 0 | E — sensitive system relation; never auto-delete |

There are no observed buckets or Storage objects. Aggregate metadata cannot
establish whether the eight submissions are real, demo, placeholder, or
legally sensitive. No Class C purge candidate was confirmed. **No purge is
permitted.**

## Backup and recovery

The read-only backup listing returned no physical backups and `pitr_enabled:
false`. Recovery is **BACKUP NOT VERIFIED**. Hard gate:

> NO REMOTE DATA PURGE UNTIL BACKUP/RECOVERY IS VERIFIED

## Canonical domain compatibility

- `Clip`: ADAPT — remote `clips` exists but is empty and lacks the complete
  canonical presentation contract.
- `Creator`: ADAPT — remote `creators` exists but is empty and is duplicated by
  Auth-linked `profiles`.
- `RankingEntry`: ADAPT — `rankings` is a current projection with no history.
- `Prompt`: ADAPT — prompt data is embedded in `submissions`, not a separate
  entity or safe public projection.
- `SavedItem`: ADAPT — `saves` points to submissions and needs a domain mapper.
- `Submission`: ADAPT — link-first fields exist, but writes/status/ownership
  require a server-side boundary.
- `UserProfile`: ADAPT — `profiles` is usable as the identity boundary only
  after role-field hardening.
- `ActivityItem`: NOT PRESENT — no activity/event projection was observed.

## Security priority map and Phase 3B queue

P0: remove client-writable admin authority; fail closed and fully validate the
Dodo webhook.
P1: enable and redesign core-table RLS; isolate ranking writes; protect prompt
fields; harden submission updates; move browser mutations server-side; fix
Dodo checkout/webhook identity, price, origin, replay, and business claims;
reconcile webhook JWT delivery; complete session/deployment review.
P2: pin security-definer `search_path`; replace Apify placeholder; remove mock
success paths; define Storage/media policy; add audit and ranking history.

Ordered repair queue:

1. Verify recovery and establish a rollback gate.
2. Remove client-writable `is_admin`; add negative escalation tests.
3. Fail closed and harden Dodo; reconcile external webhook delivery.
4. Enable/rewrite core RLS and protected server write paths.
5. Split safe public content from private prompt/moderation fields.
6. Harden submission ownership/status and ranking projection writes.
7. Fix checkout/webhook replay and business-claim validation.
8. Define Storage/media and audit policy.
9. Run security, advisor, and Invite-30 regression verification before
   connecting the frontend.

## Backend strategy

**OPTION A — REPAIR EXISTING HOTRANK SUPABASE** is recommended with medium
confidence. Exact project identity, complete migration parity, existing Auth
bootstrap, and existing user/profile relationships favor controlled repair
over an account/data migration into a replacement project. This is a strategy
recommendation only; no repair was performed. The recommendation is conditional
on closing P0s and verifying recovery first.

## Canonical frontend protection

The fixture adapter remains active. The canonical frontend remains disconnected
from Supabase; no runtime Supabase URL/key was added, and no canonical source,
CSS, media, or branding was changed. Vercel, payments, DNS, and deployment
remain untouched.

## Phase boundary

Phase 3A-1 is complete. Phase 3B must not begin without a human strategy gate.
