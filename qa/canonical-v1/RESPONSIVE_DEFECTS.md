# Responsive and Interaction Defects

Audited: 2026-08-14 at `328ef8d9b522e176f71064cdee545e9798a9c194`

## Open P1 — mobile primary navigation disclosure is inert

- Route: every canonical route with the shared header.
- Viewports: 430, 412, 393, 390, 375, and 360px.
- Reproduction: open any route at a mobile width; the primary `.nav` is hidden
  by the mobile media rule, and the visible `Open menu` button has no click
  handler or disclosure surface.
- Expected: a keyboard- and touch-accessible control reveals the same primary
  navigation destinations (`LIVE`, `RANKINGS`, `CREATORS`, `SUBMIT`).
- Actual: the button is present and labeled but inert; primary navigation is
  not available from the shared mobile header.
- Smallest repair surface: add the already-implied responsive menu disclosure
  state and preserve the current link labels, order, typography, and geometry.
  Do not redesign the header or introduce legacy navigation. This is deferred
  because the intended disclosure composition is not present in the canonical
  implementation and needs an approved frontend interaction decision.

## Closed P1 — profile horizontal overflow at tablet/mobile boundary

- Reproduction before repair: `/profile` at 768px measured
  `scrollWidth=810` against `viewport=768`; profile action controls extended
  beyond the viewport.
- Repair: the tablet-only `.profile-identity` rule now allows the middle grid
  track to shrink with `minmax(0,1fr)` while preserving the mobile single-column
  rule.
- Verification: `/profile` was rechecked at all 17 required widths from
  360px through 1920px with zero overflow and no broken images.
- Evidence: `defects/profile-768-before.png`,
  `defects/profile-768-after.png`, `defects/profile-390-after.png`, and
  `profile-repair-results.json`.

## Closed P1 — Search ArrowDown advanced two results

- Cause: the input handler and window-level handler both processed the same
  keyboard event.
- Repair: the window-level handler now ignores events whose target is the
  search input; Escape/focus-return behavior remains handled and verified.
- Verification: one ArrowDown from the header search entry selects
  `Chasing Currents`, and Escape returns focus to `Open search`.

## QA limitations, not classified defects

- Desktop hover-preview playback was not exercised with a playing video because
  the current fixture intentionally sets `demoVideo` to `undefined`. Poster
  identity, reduced-motion handling, visibility handling, and the single-active
  preview controller are present in the implementation and covered by smoke
  assertions.
- Lint `<img>` warnings and CSS autoprefixer warnings are existing P2 hygiene
  items; they did not block rendering, build, or the route/viewport checks.
