# HOTRANK Phase 3C Google Auth Integration

Date: 2026-08-21
Scope: Google OAuth capability implementation before authenticated LIVE-B.

## Requirement

Add one `Continue with Google` entry point alongside the approved email/password
sign-in flow. Google existing-user sign-in and permitted new-user registration
must be delegated to Supabase Auth; no separate registration system or manual
Auth-user creation is introduced.

## Architecture

- Google OAuth starts in `app/auth/sign-in/page.tsx`.
- The browser-safe `createSupabaseBrowserClient()` from
  `lib/supabase/client.ts` calls `supabase.auth.signInWithOAuth` with provider
  exactly `google`.
- The redirect target is derived from `window.location.origin` and points to
  the exact `/auth/callback` path; localhost is not hardcoded as the production
  redirect architecture.
- `app/auth/callback/route.ts` exchanges the OAuth authorization code with
  `exchangeCodeForSession(code)` using a response-bound server client. The
  callback returns the same redirect response whose `cookies.set` receives the
  Supabase auth mutations, preserving the session across the redirect. It also
  preserves the existing local-only `next` validation, rejecting absolute and
  protocol-relative external destinations.
- The existing middleware/proxy refresh path and `GET /api/auth/session`
  remain the session source of truth.
- The existing `AccountControl` and `POST /api/auth/sign-out` apply equally to
  email/password and Google-created sessions; no Google-specific header state
  exists.

## UX behavior

The approved sign-in card and email/password controls remain in place. Google is
a neutral secondary button with a restrained G mark, a separator, controlled
loading text, disabled duplicate submission state, concise failure text, and
visible keyboard focus. Desktop and 390px mobile checks showed one card, equal
button widths, no horizontal overflow, and no header drift.

## Existing and new users

Supabase Auth determines whether the Google identity signs in an existing linked
user or creates a permitted new Auth user. This implementation does not create
users, reset passwords, assign admin authority, or invent profile ownership.
Provider-side profile bootstrap remains governed by the existing Supabase Auth
and database configuration.

## External provider configuration

No dashboard or Google Console changes were made. The owner must ensure the
exact application callback is present in Supabase Auth URL Configuration:

`http://localhost:3000/auth/callback`

For a deployed application, add that deployment's exact origin-specific
callback using the same path. The Supabase-managed Google provider callback, if
provider setup requires it, is:

`https://csuejshnycgbfvtjbxoq.supabase.co/auth/v1/callback`

No client secret, service-role key, access token, database password, or other
credential is recorded here. Google provider enablement was previously observed
in the existing HOTRANK runtime truth; no privileged recheck was attempted.

## Security

- Email/password authentication preserved.
- OAuth tokens are handled by Supabase Auth and the PKCE callback exchange; the
  application does not parse or store tokens manually.
- Open redirects remain blocked.
- Header authentication remains based on `/api/auth/session`.
- Sign-out remains the existing `/api/auth/sign-out` boundary.
- No database migrations, RLS changes, admin grants, Dodo, payments, storage
  writes, Edge Function changes, Auth-user mutations, or remote row mutations.
- Browser bundle scan found no privileged secret names.

## Session persistence repair

The prior callback created a Supabase server client whose cookie mutations were
not attached to the redirect response, then returned a newly created redirect.
That could complete OAuth while leaving the next `/api/auth/session` request
unauthenticated. The surgical repair binds Supabase `setAll` directly to the
redirect response and treats an exchange error as a controlled failure.

The callback now emits only safe structured server diagnostics during owner
retest: code/cookie presence booleans, exchange success, cookie-write attempted,
and sanitized error name/status/code/message. It never logs OAuth codes, cookie
values, tokens, JWTs, passwords, or raw session data.

## Verification

- `npm run typecheck` — PASS.
- `npm test` — PASS.
- `node tests/phase-3c-google-auth.mjs` — PASS.
- `npm run build` — PASS with existing non-blocking image/autoprefixer warnings.
- Route smoke — PASS: `/`, `/rankings`, `/creators`, `/submit`, `/saved`,
  `/activity`, `/profile`, `/search`, and `/auth/sign-in` returned HTTP 200.
- Explicit Supabase read API — PASS: representative `home`, `rankings`,
  `creators`, `activity`, `profile`, `saved`, `search`, and `submission` reads
  returned data envelopes without fixture-mode fallback.
- Safe public projections — PASS: `public_profiles`, `public_creators`,
  `public_clips`, `public_rankings`, `public_submissions`,
  `public_follow_counts`, `public_ignite_counts`, and `public_save_counts`
  each returned HTTP 200 from the exact HOTRANK project using the
  browser-safe key.
- Diagnostic invalid-code probe — controlled `AuthPKCECodeVerifierMissingError`
  with `pkce_code_verifier_not_found`; this probe intentionally had no
  browser-created verifier and is not evidence of an owner OAuth-flow result.
- Callback probe — PASS: `next=https://evil.example` normalized to local `/`.
- Callback cookie-boundary contract — PASS: exchange errors are handled and
  the response carrying cookie mutations is returned.
- Visual QA — PASS by browser DOM/layout inspection at desktop and 390px mobile;
  browser viewport was restored afterward.
- Owner credentials were not entered and LIVE-B was not started.
- Owner clean Google OAuth retest remains required before declaring the
  exchange, verifier receipt, cookie write, and session persistence gates
  passed.

## Git checkpoint

Only the Google Auth source, focused test, and this certification artifact are
in scope. The pre-existing protected worktree remains untouched and unstaged.

Suggested checkpoint: `feat(hotrank): add google authentication`
