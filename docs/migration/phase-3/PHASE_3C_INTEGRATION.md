# HOTRANK Phase 3C — Integration Record

## Implemented

- Pinned `@supabase/supabase-js`, `@supabase/ssr`, and `server-only` packages.
- Added strict exact-project runtime configuration for
  `csuejshnycgbfvtjbxoq`.
- Added request-scoped SSR/browser Supabase client utilities and session
  refresh middleware for Auth routes.
- Added secure Auth callback, sign-in, sign-out, and current-user endpoints.
- Added an asynchronous server adapter contract while preserving the
  synchronous fixture contract used by the frozen presentation.
- Implemented the read-only Supabase adapter over Phase 3B public projections.
- Implemented server-only protected RPC mutation adapter and one typed API
  boundary for profile, submission, creator, save, follow, ignite, moderation,
  and ranking actions.
- Added explicit `HOTRANK_BACKEND_MODE=fixture|supabase` selection. Missing
  mode means fixture; invalid mode fails closed. Supabase mode never falls
  back to fixture or another project.
- Added empty-state/parity tests, boundary tests, secret-name scans, and
  projection/private-prompt assertions.

## Runtime activation

The canonical visual surface remains on fixture mode by default. This is
intentional and reversible: current public environment configuration contains
no browser-safe Supabase URL/key, so Supabase mode fails closed rather than
silently using WIZUP, a local project, a service credential, or fixture data.
To activate the adapter in a development environment, provide the exact
HOTRANK public URL/key and set `HOTRANK_BACKEND_MODE=supabase`; mutation
endpoints additionally require the server-only `SUPABASE_SERVICE_ROLE_KEY`.
No environment file or secret value was created or committed.

## Auth/session boundary

Server code calls `auth.getUser()` for authenticated decisions. The browser
client, where used, accepts only the publishable key. No client metadata,
`profiles.is_admin`, or `getSession()` result is used for authorization.
Protected routes return a controlled 503 when mandatory configuration is
absent.

## Scope exclusions

No remote migration, row mutation, Auth deletion, content reset, media upload,
Dodo operation, WIZUP operation, Vercel deployment, DNS change, or payment
integration occurred. The Supabase MCP project introspection connector was
permission-denied in this managed session; the checked-in Phase 3B migration
and remote-truth artifacts were therefore used as the authoritative contract.
