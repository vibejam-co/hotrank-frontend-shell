# HOTRANK Canonical Frontend V1 QA Baseline

Status: Phase 0 baseline plus Phase 0.5 mobile navigation recertification

Captured: 2026-08-14

Audited branch: `main`

Audited HEAD: `328ef8d9b522e176f71064cdee545e9798a9c194`

Runtime: Next.js `15.2.4`, React `19.0.0`, local dev server at
`http://localhost:3007`, Codex in-app browser, viewport PNG screenshots.

## Golden-master captures

The baseline contains 36 deterministic viewport captures: 12 route states at
each of 1440×900, 1024×1180, and 390×844.

Screenshot naming is `{viewport-width}-{route-alias}.png`.

| Route state | Path | Captured state |
| --- | --- | --- |
| home | `/` | default Live page |
| rankings | `/rankings` | default filters |
| clip-landscape | `/clips/echoes-of-tomorrow` | landscape detail, prompt collapsed |
| clip-portrait | `/clips/last-horizon` | portrait detail |
| creators | `/creators` | default category and chart |
| creator-profile | `/creators/adara-voss` | Overview tab |
| submit | `/submit` | initial step, default form values |
| saved | `/saved` | Clips tab |
| saved-prompts | `/saved/prompts` | prompt library |
| activity | `/activity` | default activity feed |
| profile | `/profile` | Saved tab, default profile actions closed |
| search | `/search` | All Results, empty query |

Machine-readable capture evidence is in:

- `browser-results.json` — route/viewport load, content, overflow, image, and
  framework-overlay checks;
- `responsive-results.json` — route-specific spot checks across the complete
  1920, 1728, 1600, 1536, 1440, 1366, 1280, 1024, 834, 820, 768, 430, 412,
  393, 390, 375, and 360px width matrix;
- `interaction-results.json` — Search, clip detail, Saved, Submit, and mobile
  header interaction evidence; and
- `profile-repair-results.json` — before/after evidence for the repaired
  768px profile overflow.

Phase 0.5 focused mobile-navigation evidence is in
`mobile-nav-repair/`, including closed/open captures at 390px, open captures
at 360px and 430px, and `results.json` covering interaction, destination,
history, secondary-route, tablet, desktop, focus, and console checks.

## Expected visual invariants

- no accidental horizontal overflow;
- no clipped controls or inaccessible primary content;
- stable HOTRANK logo scale and brand treatment;
- stable header/navigation geometry;
- legible typography and visible focus treatment;
- format-aware portrait, square, landscape, cinematic, and ultrawide media;
- hero remains dominant on Live;
- rankings remain readable and filterable;
- prompt copy and expansion remain reachable;
- creator identity, Follow, statistics, tabs, work, tools, and workflow remain
  usable;
- Submit fields, preview, and action controls remain reachable;
- profile saved content, collections, follows, and prompt library remain usable;
- Search dialog fits the viewport, retains keyboard support, and returns focus
  to the header trigger.

## Dynamic regions and fixture limits

- Live's relative update text is fixture content and must not be pixel-compared
  as a real-time value.
- Interaction states such as copied prompt, expanded prompt intelligence,
  active tabs, and hover preview require explicit state-specific captures.
- This frontend currently has no configured preview video URL (`demoVideo` is
  `undefined`), so the baseline certifies poster identity and the preview
  controller contract, but does not claim a playing-video visual capture.
- Browser and Next development warnings are not visual content; they are
  recorded separately from page screenshots.

## Engineering commands

```text
npm run typecheck
npm run lint
npm test
npm run build
```

Expected result: typecheck, smoke test, and build complete successfully. Lint
currently completes with existing `@next/next/no-img-element` warnings. Build
currently completes with two existing autoprefixer warnings in
`app/globals.css`.

## Future visual regression foundation

No browser screenshot framework exists in this repository today, so Phase 0
does not add a second test stack. The exact Phase 1 implementation path is:

1. Add the repository-approved Playwright version and browser binaries.
2. Add `playwright.config.ts` with a local `webServer` running
   `npm run dev -- --port 3100`.
3. Add `tests/visual/canonical-v1.spec.ts` with the route table above,
   `page.setViewportSize`, deterministic fixture state, and
   `expect(page).toHaveScreenshot` against this directory.
4. Keep dynamic regions masked or asserted semantically; do not regenerate
   golden masters automatically in a backend PR.
5. Add a CI command equivalent to:

   ```text
   npx playwright test tests/visual/canonical-v1.spec.ts
   ```

6. Require explicit visual-review approval before updating a baseline.

The intended future gate is:

```text
backend PR
    → canonical route screenshots
    → compare against this baseline
    → unexpected material movement
    → fail
```

## Scope boundary

These captures certify the current frontend implementation. They do not
authorize or imply backend reconnection, Supabase changes, Vercel changes,
authentication, payments, deployment, production data migration, DNS, or
legacy frontend adoption.
