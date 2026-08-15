# HOTRANK Phase 2.2 Boundary Hardening

## Scope

Phase 2.2 repairs the remaining test-layer P1 from the independent Phase 2.1
recertification. Production UI, domain, adapter, service, CSS, media,
branding, environment, and deployment files are out of scope.

The previous gap was that boundary checks were pattern-based, did not inspect
domain/public declarations for row/schema leakage, and exercised the fixture
adapter directly instead of the public service facade.

## Enforcement

`tests/hotrank-boundary.mjs` now includes a lightweight source resolver and
import graph for the canonical `app/`, `components/`, and domain source tree.
It resolves relative imports, `@/` aliases, TypeScript/JavaScript extensions,
and directory index modules for static imports, exports, dynamic imports, and
CommonJS `require` calls.

The scanner enforces:

- presentation → Supabase, privileged infrastructure, legacy/database, and
  payment prohibitions;
- domain → app/components/CSS/media/React presentation prohibitions;
- raw public row/schema/table/database declarations and generated database
  type imports.

The test also contains non-production negative cases proving that relative
backend imports, alias backend imports, payment imports, domain component
imports, and row/database declarations are rejected.

`tests/hotrank-runtime.mjs` now exercises the public service facade used by
the frontend, including home, rankings, clip, creator known/unknown slugs,
search, profile, activity, saved, saved prompts, creator directory, and
submission operations.

## Verification

Phase 2.2 verification runs through the default `npm test` script. The
service-facade runtime contract, resolver/negative boundary tests, typecheck,
lint, production build, and `git diff --check` pass. The final local browser
regression completed all 156 route/viewport cases with no overflow, runtime
errors, broken assets, or console errors. Existing interaction coverage also
passes.

The Node experimental-loader/module-type notices remain a non-blocking
test-harness P2 warning; they do not affect the product runtime. Existing
`<img>` lint and Autoprefixer build warnings remain unchanged.

External verification remains deferred:

`EXTERNAL VERIFICATION DEFERRED TO PHASE 3+`
