# HOTRANK Phase 1 — Legacy System Inventory

Date: 2026-08-14  
Scope: read-only repository and local configuration forensics.  
Authority: the frozen canonical frontend at `/Users/Ira/Desktop/hotrank-frontend-final`.

## Systems found

| Classification | Repository | Remote | Branch | HEAD | Last meaningful commit | Stack | Forensic role |
|---|---|---|---|---|---|---|---|
| Canonical, not legacy | `/Users/Ira/Desktop/hotrank-frontend-final` | none shown locally | `main` | `1e63e4a7e3b5603c5453c6a79ced27dff9ad33aa` | 2026-08-14, `fix(hotrank): activate canonical mobile navigation` | Next 15.2.4, React 19, TypeScript | Frozen presentation authority; no backend integration present |
| Legacy HOTRANK system 1 | `/Users/Ira/Desktop/HOTRANK` | `https://github.com/vibejam-co/HotRank-AI.git` | `feature/hotrank-premium-shell-integration` | `c2dcd636e7dd9d9c44f19e434662ddbe92ce4dde` | 2026-08-01, `Complete HOTRANK premium shell and route hardening` | Vite 6, React 19, Tailwind 4, Supabase Auth/Postgres/RLS, Edge Functions, Dodo MCP | Primary backend, schema, auth, ingestion, moderation, payment, and deployment donor |
| Legacy HOTRANK system 2 | `/Users/Ira/Desktop/hotrank-frontend-shell` | `https://github.com/vibejam-co/hotrank-frontend-shell.git` | `feature/hotrank-shell-backend-integration` | `2ff67ea60945a1a255a9e7f59880ce5b05585b2d` | 2026-08-02, `phase 23 align private surface data` | Vite, React, TypeScript, direct browser Supabase client | Adapter-integrated shell; useful service boundary, but its presentation layer is rejected |

The two legacy systems are the two repositories above. `/Users/Ira/Desktop/hotrank-latest-preview` was also present, but it is a prior static Next presentation snapshot with no remote, Supabase dependency, API route, or backend marker. It is not counted as a third infrastructure system and is presentation reference only.

The legacy `/Users/Ira/Desktop/HOTRANK` worktree had a pre-existing modification to `supabase/.temp/cli-latest`. It was not touched. WIZUP and RIOT repositories were excluded from this inventory.

## Legacy system 1: `/Users/Ira/Desktop/HOTRANK`

### Database and Supabase

- `supabase/config.toml` defines a local Supabase project named `HOTRANK`, local API/DB/Studio/Auth/Storage services, Realtime enabled, and a 50 MiB local storage limit. No named application storage bucket is configured.
- Twelve migrations and one seed file are present.
- The schema contains two competing content models:
  - the original `creators`, `clips`, and `rankings` tables;
  - the later `profiles`, `submissions`, `follows`, `ignites`, `saves`, and `prompt_unlocks` tables.
- The seed is explicitly demo-oriented: synthetic creator handles, initials as avatar values, `example.com/demo/...` clip URLs, and fixed UUIDs.
- No separate `collections`, `activity`, `notifications`, or ranking-history tables were found.

### Authentication and profiles

- Supabase Auth is the provider.
- Email/password and Google OAuth flows exist in the legacy UI and adapter.
- `app/auth/callback/route.ts` exchanges the OAuth code for a session and constrains the `next` path to an internal path.
- `utils/supabase/server.ts` and `utils/supabase/middleware.ts` contain server-cookie/session helpers. A root Next `middleware.ts` that invokes the refresh helper was not found.
- `profiles` is bootstrapped by an `auth.users` trigger. Later migrations add `display_name`, `handle`, `bio`, `links`, and `is_admin`.

### Content and submission paths

- The newer `submissions` record is link-first and includes source URL, platform, external ID, embed URL, thumbnail, creator notes, creator handle, canonical URL, status, prompt fields, AI-stack JSON, and workflow notes.
- The older `clips` path accepts a URL plus client-supplied title, category, thumbnail, view count, retention, engagement, and velocity values.
- `app/api/ingest/route.ts` requires a signed-in user, but `lib/ingestion.ts` derives deterministic metrics from the submitted URL rather than fetching or verifying source metrics. It writes a `clips` row and recalculates global rankings.
- The newer submit server action also writes directly to `clips` and then recalculates rankings.
- No unique source URL constraint was found in the migrations.
- Moderation states are `pending`, `approved`, `rejected`, and later `archived`. Status protection is implemented by a database trigger, with an admin exception and an owner-archive exception.

### Ranking, relationships, and prompts

- `rankings` is a current projection with one row per clip; no history table was found.
- Ranking recomputation is implemented in application code and updates `clips.ai_score`, deletes the current ranking projection, then upserts the new ranking rows.
- `follows`, `saves`, and `ignites` use composite primary keys. Their intended user-owned insert/delete policies are present.
- Prompts are columns on `submissions`, not a separate entity. Visibility values are `free`, `locked`, and `private`; structured AI-stack and workflow fields are present.
- `prompt_unlocks` stores a user, submission, Dodo payment ID, and amount. It has a user-select policy but no client insert policy, implying a service-role webhook write.

### Server functions and integrations

- `app/api/ingest/route.ts` is a signed-in ingestion endpoint.
- `supabase/functions/apify-webhook/index.ts` is a placeholder. It reads environment names, does not authenticate a webhook, and returns `{ status: "received", mock: true }` without persisting data.
- `supabase/functions/dodo-checkout/index.ts` creates a test-mode Dodo product and checkout, or returns a mock when the secret is missing.
- `supabase/functions/dodo-webhook/index.ts` verifies a Dodo signature when configured, then uses the Supabase service-role key to upsert `prompt_unlocks`.
- No cron configuration or scheduled ranking job was found.
- The Dodo MCP under `mcp/dodo` is test-mode only and has mock fallbacks.

### Deployment and environment contract

- `vercel.json` contains a catch-all rewrite to `/`, which is incompatible with preserving distinct Next route/API behavior without review.
- The repository contains Vite as the declared root application while also containing a separate Next `app/` tree and Next server helpers. This is an architectural split, not a safe deployment contract.
- Environment names found, with values intentionally omitted:
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`: browser Supabase connection.
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: server-helper/browser-compatible Supabase connection for the Next tree.
  - `APP_URL`: application origin contract.
  - `VITE_DODO_CHECKOUT_ENDPOINT`: browser-to-checkout endpoint.
  - `DODO_PAYMENTS_SECRET_KEY`: server/MCP Dodo test/live secret.
  - `DODO_PAYMENTS_WEBHOOK_SECRET`: Dodo webhook verification secret.
  - `APIFY_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: Edge ingestion/webhook integration names.
  - `GEMINI_API_KEY`: legacy AI Studio dependency.

### Storage and media

No application upload code, bucket policy, or `storage.from(...).upload(...)` path was found. Media is represented by external source/embed/thumbnail URLs, initials, or static assets. Storage service enablement in local config is not evidence of a production bucket.

## Legacy system 2: `/Users/Ira/Desktop/hotrank-frontend-shell`

- This repository is a Vite/React shell with a direct browser Supabase client and no migrations, Edge Functions, API routes, Vercel project metadata, or server trust boundary.
- `src/lib/integrations/hotrank.ts` is the valuable part: typed repositories for auth, rankings, clips, creators, saves, follows, ignites, submissions, and profile reads/writes.
- The adapter reads `submissions`, `profiles`, `saves`, and `ignites`, derives counts, and computes a client-side Heat Score. It inserts submissions directly through the anon client after client-side URL validation and duplicate probing.
- Required public environment names are `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; the local shell receipt says live Supabase values were unavailable.
- Its route shell, mock data, CSS, responsive logic, and page components are legacy presentation and belong on the denylist.

## External relationship checks

- Vercel CLI authentication was available, but the visible team projects were `wizupxyz` and `lumina-intuitive-healing`; visible domains were `wizup.xyz` and `aishanur.com`. No HOTRANK project or `hotrank.xyz` domain was visible.
- Supabase CLI authentication was available only enough to list two WIZUP projects. No HOTRANK project was visible, and the canonical directory is not linked to a Supabase project.
- The local legacy repository contains Supabase temp metadata and a project-ref file, but this does not prove current remote ownership, schema parity, or production state.
- No external payment dashboard or authenticated Dodo account was available.

## Inventory conclusion

`/Users/Ira/Desktop/HOTRANK` is the infrastructure donor, but it is not production-credible without security remediation and schema reconciliation. `/Users/Ira/Desktop/hotrank-frontend-shell` demonstrates a useful adapter boundary, but its direct browser mutation model and presentation are not canonical. The safest path is to preserve concepts and audited data contracts behind a new typed boundary, not to transplant either frontend.
