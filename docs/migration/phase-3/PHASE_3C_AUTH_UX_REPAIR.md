# HOTRANK Phase 3C Auth UX Repair

## Original issue

The approved header displayed a static demo avatar to unauthenticated visitors and had no account menu or sign-out control. This made the header imply a signed-in state that was not true.

## Root cause

`components/header.tsx` rendered `/media/creator-liora.png` directly and did not consume the existing Phase 3C session boundary.

## Files changed

- `components/account-control.tsx` — session-backed loading, unauthenticated, authenticated, menu, and sign-out states.
- `components/header.tsx` — replaces the static avatar with `AccountControl`.
- `app/auth/sign-in/page.tsx` — smallest sign-in entry surface, connected to `POST /api/auth/sign-in`.
- `app/globals.css` — compact account menu, loading placeholder, sign-in, and sign-in form styling.

## Session source of truth

The browser calls `GET /api/auth/session`. A successful response with a user controls authenticated UI. Null, non-OK, or failed responses fail closed to the unauthenticated `Sign in` state. The account control uses only the returned user id and email; it does not use fixture data, localStorage, profile authorization fields, or client-side database reads.

## Authentication behavior

- Unauthenticated: the static demo avatar is absent and `Sign in` is shown.
- Loading: a reserved, subtle account-sized placeholder prevents a fake-user flash and major header shift.
- Authenticated: a deterministic initial fallback is shown from the real session email, with Profile, Saved, and Sign Out in a compact keyboard-accessible menu.
- Sign out: `POST /api/auth/sign-out` is used; the UI clears immediately and returns to `Sign in` without a hard refresh.

## Security boundary

No privileged secrets, server-only modules, database schema, RLS policy, Auth users, remote rows, Dodo, or payment systems were changed. No client component imports a protected Supabase service module.

## Verification

- `npm run typecheck` — PASS.
- `npm test` — PASS: targeted smoke, runtime, architecture boundary, Phase 3B security, Phase 3C integration, and parity contracts.
- `node tests/phase-3c-auth-ux.mjs` — PASS: static demo avatar removal, session/sign-in/sign-out boundaries, menu semantics, and client secret negative check.
- `npm run build` — PASS. Existing Next.js image/autoprefixer warnings remain non-blocking.
- Route smoke — PASS: `/`, `/rankings`, `/creators`, `/submit`, `/saved`, `/profile`, `/search`, and `/auth/sign-in` returned 200. `/api/auth/session` returned 503 in fixture mode and failed closed.
- Visual QA — source/diff inspection completed; no browser visual automation was available in this workspace. Header geometry and canonical content layout were not otherwise changed.

## Git checkpoint status

The pre-existing protected worktree files remain untouched and unstaged. Only the four Auth UX repair files listed above are in scope for a manual owner checkpoint.
