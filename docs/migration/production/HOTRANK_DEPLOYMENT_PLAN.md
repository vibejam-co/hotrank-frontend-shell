# HOTRANK Production Deployment Plan

Status: prepared; no deployment, domain, DNS, Vercel, or Supabase production
mutation was performed.

## Preconditions

1. Owner provides access to the canonical Vercel project that will serve this
   repository. The current visible Vercel account exposes only WIZUP projects;
   no HOTRANK project or Git remote is linked here.
2. Apply the prepared additive moderation migration after a production backup
   and migration review. It adds rights confirmation and private moderation
   audit data; this mission does not apply it remotely.
3. Configure only the canonical runtime names: `HOTRANK_BACKEND_MODE`,
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and the
   server-only `SUPABASE_SERVICE_ROLE_KEY` required by the protected mutation
   boundary. Never expose the last variable to the browser.
4. Confirm the HOTRANK Supabase project and production Google callback for the
   canonical origin.

## Cutover sequence

1. Create/identify the canonical Vercel project and connect the approved
   repository/branch.
2. Set production environment names and values in the owner-controlled Vercel
   project without recording values in Git.
3. Run the production build and route/auth/public-read smoke suite against a
   preview deployment.
4. Apply the reviewed migration and verify profile, pending submission,
   moderation fail-closed, approved-only public projection, and private prompt
   checks.
5. Promote the verified deployment.
6. Point `www.hotrank.xyz` to the canonical deployment and retain the desired
   permanent `www` → apex redirect strategy.
7. Verify apex and www, Auth callback, header/session, public routes, and
   rollback signals before announcing the replacement.

## Rollback

Keep the prior deployment reference and domain configuration documented. If
smoke/auth/publication checks fail, promote the prior known-good deployment and
restore the prior domain alias/redirect configuration. Do not delete the
legacy deployment until the owner completes a retention and rollback review.

## Explicitly out of scope

No DNS switch, Vercel promotion, environment mutation, content migration,
founding creator creation, payment activation, collectibles, or push occurs in
this mission.
