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
   boundary. Keep the server-only `HOTRANK_SUBMISSIONS_OPEN` gate absent or
   `false` until moderation provider and adjudicator activation is verified.
   Never expose server-only variables to the browser.
4. Confirm the HOTRANK Supabase project and configure the production Google
   callback at `https://hotrank.xyz/auth/callback`; retain preview callback
   entries only as owner-approved temporary configuration.

## Cutover sequence

1. Create/identify the canonical Vercel project and connect the approved
   repository/branch.
2. Set production environment names and values in the owner-controlled Vercel
   project without recording values in Git; leave
   `HOTRANK_SUBMISSIONS_OPEN=false`.
3. Run the production build and route/auth/public-read smoke suite against a
   preview deployment. Verify the submit surface is visibly closed and the
   mutation route returns `SUBMISSIONS_CLOSED`.
4. Apply the reviewed migration and verify profile, pending submission,
   moderation fail-closed, approved-only public projection, and private prompt
   checks without opening broad intake.
5. Activate the approved review agent and independent adjudicator, rehearse
   their audit writes, then set `HOTRANK_SUBMISSIONS_OPEN=true` only after the
   provider contract and fail-closed tests pass.
6. Promote the verified deployment.
7. Attach the canonical apex and configure `www.hotrank.xyz` as a permanent
   redirect to `https://hotrank.xyz`; verify both hosts before announcing the
   replacement.
8. Verify apex and www, the canonical Auth callback, header/session, public
   routes, submission gate, and rollback signals before launch.

## Rollback

Keep the prior deployment reference and domain configuration documented. If
smoke, Auth, publication, or moderation checks fail, immediately set
`HOTRANK_SUBMISSIONS_OPEN=false`, promote the prior known-good deployment, and
restore the prior domain alias/redirect configuration. Re-verify the prior
Auth callback and public projections before resuming traffic. Do not delete the
legacy deployment until the owner completes a retention and rollback review.

## Explicitly out of scope

No DNS switch, Vercel promotion, environment mutation, content migration,
founding creator creation, payment activation, collectibles, or push occurs in
this mission.
