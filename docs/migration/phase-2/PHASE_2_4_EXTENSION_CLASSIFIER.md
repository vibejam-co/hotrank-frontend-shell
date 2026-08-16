# HOTRANK Phase 2.4 Explicit-Extension Classifier Closure

## Previous P1

Phase 2.3 recursively traversed local imports and re-exports, but its
legacy/database classifier recognized path segments only when they ended at a
directory boundary. A terminal source path such as `lib/backend.ts` or
`lib/data.ts` could therefore evade the same rule that correctly rejected
`lib/backend/client.ts` or `lib/data`.

## Root Cause and Normalization Strategy

`tests/hotrank-boundary.mjs` now canonicalizes both the original import
specifier and the resolved relative source path before classification. The
normalization uses path-aware recognized source extensions (`.ts`, `.tsx`,
`.js`, and `.jsx`) and removes only a terminal recognized extension. It does
not perform arbitrary substring replacement, so unrelated names are not
rewritten accidentally.

Classification therefore treats extensionless and explicit-extension forms of
the same module identity equivalently while preserving normal explicit
extension imports as legal when their module path is architectural-safe.

## Adversarial Coverage

The isolated tests cover:

- relative and alias direct imports of explicit backend/data modules;
- `export * from "./backend.ts"`;
- named `export { ... } from "./backend.ts"`;
- explicit-extension multi-hop and alias multi-hop graphs; and
- equivalent forbidden targets ending in `.ts`, `.tsx`, `.js`, and `.jsx`.

The existing Phase 2.3 direct, re-export, multi-hop, cyclic, and clean service
graph cases remain in place. The clean positive graph now also uses explicit
extensions through the service, domain, adapter-contract, fixture, and
approved fixture-to-data edges.

## Final Verification

The architecture guard remains part of the default `npm test` command. Phase
2.4 verification includes the service contract, typecheck, lint, production
build, `git diff --check`, and the existing browser regression/spot checks.
Production presentation and runtime files remain out of scope.

External verification remains deferred:

`EXTERNAL VERIFICATION DEFERRED TO PHASE 3+`
