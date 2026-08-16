# HOTRANK Phase 2.3 Transitive Boundary Closure

## Scope

Phase 2.3 closes the remaining Phase 2 architecture-guard P1. The repair is
test-harness-only: no presentation, domain behavior, adapter behavior,
fixture content, service behavior, backend, environment, or deployment files
are changed.

## Root Cause

Phase 2.2 resolved each import edge and classified its immediate target, but it
did not continue through a resolved local module. A clean-looking barrel could
therefore re-export a forbidden Supabase, payment, or legacy implementation
without the originating presentation module being rejected.

## Recursive Traversal Design

`tests/hotrank-boundary.mjs` now walks every resolved local dependency from a
canonical entry module. The existing relative, `@/` alias, extension, index,
static import, export, dynamic import, and `require()` resolution behavior is
preserved. Traversal follows local modules in deterministic source order and
reports the dependency chain alongside the forbidden category.

The approved fixture adapter → `lib/data.ts` edge remains legal because the
fixture adapter is the intentional Phase 2 data boundary. Other presentation
reachability into legacy/database, payment, or privileged paths remains
forbidden.

## Cycle Protection and Re-Exports

Traversal uses normalized source paths with both an active traversal set and a
completed visited set. Cyclic modules terminate without arbitrary depth limits,
while dependencies reachable elsewhere in the cycle are still inspected.

Static `export * from` and `export { ... } from` statements are parsed as graph
edges alongside imports. This prevents a safe-looking barrel from hiding a
forbidden dependency.

## Adversarial Coverage

The isolated in-memory cases cover:

- direct forbidden import;
- single-hop re-export;
- multi-hop payment dependency;
- alias re-export;
- relative re-export;
- cyclic graph with a forbidden dependency; and
- clean service → domain/adapter → fixture graph.

The production source tree is not modified to manufacture failures.

## Verification

The strengthened architecture guard is part of the default `npm test` command.
Phase 2.3 verification also includes typecheck, lint, production build, and
`git diff --check`. The existing service-facade contract and 156-case browser
regression remain required gates. External verification remains deferred:

`EXTERNAL VERIFICATION DEFERRED TO PHASE 3+`
