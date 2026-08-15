# HOTRANK Phase 2.1 Repair Addendum

## Scope

This addendum records the bounded repair of Phase 2 at `54ec8db`. It does not
start Phase 3 and does not connect Supabase, Vercel, auth, payments, DNS, or
production systems.

The independent Phase 2 audit found three P1 defects: the home hero had been
remapped from the canonical `2.39:1` ratio to `16:9`, portrait workflow
newlines were collapsed into one paragraph, and the architecture test could
be bypassed with relative/dynamic imports and did not exercise adapter
contracts. It also recorded unsafe ratio assertions and an ignored creator
slug as P2 findings.

## Repairs

- The fixture adapter preserves the canonical home hero ratio at the domain
  mapping boundary.
- Portrait workflow content is represented as typed `workflowLines` and
  rendered as explicit React line breaks; no raw HTML is used.
- Media-ratio mapping is exhaustive and rejects unsupported values without an
  unsafe assertion.
- `getCreator(slug)` returns the matching fixture profile and `null` for an
  unknown slug.
- Boundary tests inspect static, dynamic, and CommonJS import forms; enforce
  presentation/backend and domain/presentation direction; detect broader
  database-shaped type leakage; and assert runtime adapter invariants.

## Verification

The rerun completed with `npm run typecheck`, `npm run lint`, `npm test`,
`npm run build`, and `git diff --check` passing. The runtime adapter contract
and strengthened boundary tests pass. The exact 156-case route/viewport
matrix completed with no persistent overflow, runtime error, or broken asset;
one initial mobile search image miss cleared after the normal load settle.
Focused interaction checks passed for mobile navigation/Escape, search
keyboard navigation, Copy Prompt, prompt expansion, and the fresh browser tab
reported zero console errors. Existing lint `<img>` and build Autoprefixer
warnings remain documented as pre-existing.

External account verification remains deferred:

`EXTERNAL VERIFICATION DEFERRED TO PHASE 3+`
