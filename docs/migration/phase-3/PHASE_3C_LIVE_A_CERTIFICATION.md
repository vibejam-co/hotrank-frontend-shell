# HOTRANK Phase 3C-LIVE-A — Real Supabase Runtime Certification

Date: 2026-08-21  
Scope: read-only public Supabase runtime, real adapter reads, unauthenticated Auth transport, and header Auth UX.

## Verdict

**PASS — READY FOR LIVE-B OWNER GATE: YES.**

The corrected browser-safe publishable key was accepted by the exact HOTRANK
project. No privileged credential, database password, Management API, remote
mutation, Auth-user mutation, Storage write, Edge Function operation, Dodo, or
payment operation was used.

## Source control

- Starting HEAD: `be0c789f8cfdccea46f8d8dd616095497b0ee547`
- Final HEAD: `be0c789f8cfdccea46f8d8dd616095497b0ee547`
- Branch: `main`
- Auth UX checkpoint: `be0c789 fix(hotrank): connect header auth state and sign out`
- Canonical frontend tag: `hotrank-frontend-v1-lock` at `1e63e4a7e3b5603c5453c6a79ced27dff9ad33aa`
- Source files modified by this certification: none
- Certification artifacts updated: this file and `PHASE_3C_LIVE_A_RUNTIME_TRUTH.json`

The protected dirty worktree (`lib/data.ts`, `.DS_Store`, `public/media/*`,
`qa/final-lock/*`, and `qa/surgical-brand-rising/*`) was preserved.

## Runtime evidence

| Check | Result |
|---|---|
| `HOTRANK_BACKEND_MODE=supabase` | PASS |
| Exact project URL | PASS — `https://csuejshnycgbfvtjbxoq.supabase.co` |
| Browser-safe publishable key | PASS — accepted by the actual project; value not recorded |
| `public_profiles` | HTTP 200; 9 rows |
| `public_creators` | HTTP 200; 0 rows |
| `public_clips` | HTTP 200; 0 rows |
| `public_rankings` | HTTP 200; 0 rows |
| `public_submissions` | HTTP 200; 7 rows |
| `public_follow_counts` | HTTP 200; 2 rows |
| `public_ignite_counts` | HTTP 200; 3 rows |
| `public_save_counts` | HTTP 200; 3 rows |
| Canonical Supabase adapter reads | PASS — real `/api/hotrank/read` responses in explicit Supabase mode |
| Fixture fallback | NONE observed in explicit Supabase read responses |
| Empty-state truth | PASS — empty remote clips, creators, and rankings remained empty at projection level |
| Private prompt rows | 0 locked/non-free rows returned with non-null prompt text |
| Private submission fields | NONE present in public projection keys |
| Base-table access | PASS protected — representative base tables returned HTTP 401 |

The first cold `/api/hotrank/read?resource=home` request exceeded the local
development compilation window; after compilation completed, the same real
adapter request returned HTTP 200. Rankings, creators, and search adapter
reads returned HTTP 200 as well.

## Auth transport and header UX

- `GET /api/auth/session` without a session: HTTP 200 with `{ "user": null }`.
- Invalid sign-in: controlled HTTP 401 with generic `Sign-in failed`.
- Sign-out without a session: HTTP 200 with `{ "ok": true }`.
- Auth callback open-redirect input: normalized to the local `/` path.
- Header Auth UX: `AccountControl` consumes the session endpoint; SSR shows a
  reserved loading state, and no static/demo avatar is rendered.
- Browser bundle forbidden-secret scan: PASS; no privileged secret names found.

Authenticated LIVE-B testing was not performed.

## Regression and route smoke

- `npm run typecheck`: PASS
- `npm test`: PASS
- `npm run build`: PASS; existing non-blocking image/autoprefixer warnings only
- Route smoke PASS (HTTP 200): `/`, `/rankings`, `/creators`, `/submit`,
  `/saved`, `/activity`, `/profile`, `/search`
- Real read API smoke PASS: `home`, `rankings`, `creators`, and `search`
- Visual QA: source/diff inspection and SSR header-state inspection completed;
  browser visual automation was unavailable. No canonical UI material drift.

## Remote safety ledger

| Operation | Count |
|---|---:|
| Remote migrations | 0 |
| Remote row mutations | 0 |
| Remote row deletions | 0 |
| Auth users created/deleted | 0 |
| Storage writes | 0 |
| Edge Function operations | 0 |
| Payment operations | 0 |

## Remaining gates

- P0: none for LIVE-A.
- P1: none for LIVE-A. LIVE-B remains a separate owner-authenticated gate.

**Phase 3C-LIVE-A verdict: CERTIFIED. READY FOR LIVE-B OWNER GATE: YES.**
