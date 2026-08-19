# HOTRANK Phase 3A-1 — High Independent Certification

Date: 2026-08-19
Audited repository: `/Users/Ira/Desktop/hotrank-frontend-final`
Branch: `main`
Audited HEAD: `5ccf1a3df5d7e0ce5844f4fd37ddb705c6f66686`
Canonical frontend tag: `hotrank-frontend-v1-lock` → `1e63e4a7e3b5603c5453c6a79ced27dff9ad33aa`

## Verdict

**PASS — Phase 3A-1 forensic certification only.**

The Medium report's load-bearing remote findings were independently
reconciled against fresh read-only remote metadata, local migration/source
evidence, and the canonical frontend boundary. The project remains unsafe to
connect to the canonical frontend. P0 findings remain open and Phase 3B has
not started.

This PASS certifies the quality and boundary compliance of the forensic phase;
it is not a production-readiness approval.

## Independent checks performed

### Project identity and access

- `supabase projects list -o json` was run with the inherited
  `SUPABASE_ACCESS_TOKEN`; its value was never printed, logged, persisted,
  transformed, or recorded.
- The exact project was visible: `HOTRANK`, ref
  `csuejshnycgbfvtjbxoq`, org ID `oswgjjphugeqvilmmupn`, region `eu-west-1`,
  status `ACTIVE_HEALTHY`.
- A separate read-only organization metadata check matched org ID
  `oswgjjphugeqvilmmupn` to `HotRank AI`.
- The repository was not linked. No default/WIZUP credential source was used;
  the inherited token environment variable was the only credential source.

### Schema, policy, and aggregate checks

Fresh metadata SQL verified the existence and material shape of:
`profiles`, `submissions`, `creators`, `clips`, `rankings`, `follows`,
`ignites`, `saves`, and `prompt_unlocks`.

The RLS split was independently confirmed:

- RLS enabled: `profiles`, `submissions`, `follows`, `ignites`, `saves`,
  `prompt_unlocks`.
- RLS disabled: `clips`, `creators`, `rankings`.

The fresh policy result confirmed broad public submission reads, broad
self-profile updates, owner submission updates without `WITH CHECK`, and
admin submission policies that trust `profiles.is_admin`.

Only aggregate counts were read: profiles 9, submissions 8, follows 4,
ignites 6, saves 3, clips 0, creators 0, rankings 0, and prompt_unlocks 0.
No row contents, emails, identities, prompts, or other private values were
read or exported.

### Admin escalation

**CONFIRMED.** Fresh metadata verified that:

1. `profiles.is_admin` exists as a non-null boolean.
2. `authenticated` has table-level `UPDATE` on `profiles`.
3. The self-update policy is `auth.uid() = id` for both `USING` and
   `WITH CHECK`, without a protected-column boundary.
4. Moderation policy and trigger authorization consult `profiles.is_admin`.

No update, exploit, impersonation, or escalation attempt was made.

### Dodo legacy surface

**CONFIRMED P0 legacy attack surface.** Fresh read-only function metadata
confirmed active deployed `dodo-checkout` and `dodo-webhook` functions,
version 8, with JWT verification enabled. `apify-webhook` is not deployed.
The deployed entrypoint paths match the inspected legacy source.

The inspected Dodo source confirms privileged legacy behavior:

- `dodo-webhook` can use `SUPABASE_SERVICE_ROLE_KEY` to upsert
  `prompt_unlocks`.
- Missing `DODO_PAYMENTS_WEBHOOK_SECRET` returns verified/mock success.
- Event metadata drives `prompt_id` and `user_id` without sufficient
  signature freshness, replay, product, amount, ownership, or idempotency
  validation.
- `dodo-checkout` has a mock-success path, accepts client-controlled
  `videoId` and price, uses wildcard CORS, and creates products/checkouts
  through the legacy Dodo path.

The owner decision supersedes any prior repair-oriented wording: Dodo is
permanently retired. It must not be hardened or preserved for future
production use. `prompt_unlocks` may remain as historical schema/data, but it
must not depend on Dodo going forward.

### Migration history

Fresh remote metadata returned the exact 12 migration IDs represented by the
12 local migration files, in matching order. No missing, remote-only, or
ordering drift was found.

### Backup and recovery

**BACKUP NOT VERIFIED** remains evidence-supported. The fresh read-only backup
metadata reported `pitr_enabled: false`, no listed backups, and no physical
backup data. No backup was created, restored, or rehearsed during this audit.
The hard gate remains: no purge or destructive reconciliation before an
owner-approved recovery/rollback proof exists.

### Canonical frontend isolation

The fixture adapter remains the active runtime boundary:
`lib/hotrank/services/index.ts` selects the fixture adapter, and the fixture
adapter is the only intentional bridge to `lib/data.ts`.

The audited HEAD contains no Supabase client, runtime Supabase URL/key,
payment integration, or backend adapter implementation in the canonical
frontend. No CSS, media, branding, or presentation source was changed by this
certification. Pre-existing unrelated worktree changes, including the dirty
`lib/data.ts` and untracked media/QA files, were preserved untouched.

The canonical frontend remains disconnected from Supabase. Phase 3A-1 did not
connect it, deploy it, or change Vercel, DNS, Auth, Storage, or payments.

## Medium report review

### Confirmed

The following Medium findings are materially accurate:

- project identity, region, and active/healthy status;
- all nine material public tables and their schema fingerprints;
- RLS enabled/disabled split;
- self-service admin escalation through `profiles.is_admin`;
- active Dodo function inventory and privileged fail-open legacy path;
- exact 12-migration parity;
- aggregate data presence and the prohibition on purge;
- `BACKUP NOT VERIFIED` recovery gate;
- absent Storage application buckets/objects;
- fixture adapter activity and frontend/backend isolation.

### Rejected or corrected

- The Medium report's future-oriented Dodo language is rejected. Dodo is not
  a repair candidate. Its active deployed surface remains a P0 until safely
  disabled/removed in a separately authorized phase.
- The Medium repair queue's “fail closed and harden Dodo” step is replaced by
  retirement/removal and revocation of the privileged Dodo surface.
- The Medium report's recommendation of existing-project repair is retained
  only as a controlled backend-remediation strategy. It must include Dodo
  retirement and must not imply preserving the Dodo checkout/webhook
  architecture.

No unsupported Medium conclusion was found that changes the forensic
verdict. The Medium artifact did not expose private row contents or secret
values, and the primary investigation did not cross the remote write boundary
based on the evidence reviewed.

## Severity review

### P0

1. **Client-writable admin authority — CONFIRMED.** A user-scoped profile
   update boundary can write the `is_admin` field used by moderation
   authorization.
2. **Deployed Dodo privileged legacy surface — CONFIRMED.** The active
   webhook has service-role write capability and a fail-open verification path.
   Dodo remains P0 until retirement/removal.

### P1

- RLS disabled on `clips`, `creators`, and `rankings`.
- Public submission reads expose prompt-bearing/private fields.
- Submission owner updates are too broad and lack a `WITH CHECK` boundary.
- Ranking mutation authority is not isolated from ordinary browser/user flows.
- Legacy browser mutation paths lack a typed server-side authorization
  boundary.
- Legacy Dodo checkout/webhook identity, amount, origin, replay, and business
  claims are unsafe, but their disposition is retirement rather than repair.
- Auth/session/deployment contract review remains incomplete before any
  frontend connection.

### P2

- Security-definer functions lack an explicit safe `search_path`.
- Apify source is a placeholder and is not deployed.
- Mock-success paths and legacy test endpoints remain unsafe infrastructure.
- Storage ownership/media policy is undefined.
- Audit/history infrastructure is incomplete.

No new P0 or P1 was discovered beyond the Medium report. The material
severity correction is the Dodo future disposition: its security severity was
already P0, but its recommended treatment must be retirement/removal.

## Backend strategy review

**High recommendation: OPTION A — controlled remediation of the existing
HOTRANK Supabase project, with explicit Dodo retirement.**

Confidence: **MEDIUM**.

Existing Auth/profile relationships, exact migration parity, and the known
small aggregate footprint favor preserving the project identity over an
unverified account/data migration. The recommendation is conditional on a
recovery/rollback proof, owner review of the eight unknown prompt-bearing
submissions, closure of both P0s, and a new server-side/RLS design. It does
not authorize a remote change, frontend connection, purge, or payment
provider selection.

Option B remains a valid later escape hatch if recovery cannot be proven,
legacy contamination cannot be bounded, or the human strategy gate judges
the security debt and rollback risk unacceptable. Option C applies until that
decision is made; no replacement Supabase project is created in this phase.

## Dodo decision and Phase 3B queue

Dodo future status: **PERMANENTLY RETIRED.**

Dodo Phase 3B action: **safely disable/remove the deployed Dodo checkout and
webhook surface, revoke its privileged path/secrets, and preserve
`prompt_unlocks` only as historical data if justified. Do not harden Dodo and
do not select a replacement payment provider in this phase.**

Recommended Phase 3B order, not executed here:

1. Establish owner-approved recovery/export and rollback gates; no purge.
2. Remove client-writable admin authority and move roles to protected claims
   or role records; add negative escalation tests.
3. Retire/remove Dodo functions, routes, secrets, and privileged write paths;
   preserve historical `prompt_unlocks` only if justified.
4. Repair core RLS and policy boundaries.
5. Separate safe public content from private prompt/moderation data.
6. Establish server-side typed write boundaries.
7. Harden submission ownership/status and ranking authority.
8. Define Storage, media, audit, and history architecture.
9. Run security, authorization, recovery, and Invite-30 verification.
10. Only after those gates, consider connecting the canonical frontend.

## Remote-write and exposure certification

- Remote writes during certification: **NONE**.
- Rows modified: **NO**.
- Schema modified: **NO**.
- RLS modified: **NO**.
- Auth modified: **NO**.
- Storage modified: **NO**.
- Edge Functions modified: **NO**.
- Dodo invoked: **NO**.
- Payment transaction: **NO**.
- Private row data exported: **NO**.
- Secret values exposed or recorded: **NO**.
- Phase 3B started: **NO**.

## Certification result

**PHASE 3A-1 HIGH VERDICT: PASS**
**PHASE 3A-1 CERTIFIED: YES**
**READY FOR HUMAN PHASE 3B STRATEGY GATE: YES — gate only; no execution authorization**

The human strategy gate remains mandatory. Stop here.
