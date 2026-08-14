# Responsive and Interaction Defects

Audited: 2026-08-14 at `328ef8d9b522e176f71064cdee545e9798a9c194`

## Closed P1 — mobile primary navigation disclosure was inert

- Route: every canonical route with the shared header.
- Viewports: 430, 412, 393, 390, 375, and 360px.
- Original reproduction: open any route at a mobile width; the primary `.nav`
  was hidden by the mobile media rule, and the visible `Open menu` button had
  no click handler or disclosure surface.
- Repair: the existing hamburger now controls a conditional, near-black menu
  sheet containing only the canonical `LIVE`, `RANKINGS`, `CREATORS`, and
  `SUBMIT` destinations. The closed header remains unchanged.
- Verified actual: tap open, close affordance, Escape, outside interaction,
  focus return, keyboard focus styling, route navigation, browser back/forward,
  and menu closure after navigation all work at the required mobile widths.
- Evidence: `mobile-nav-repair/results.json`, `390-closed.png`,
  `390-open.png`, `360-open.png`, and `430-open.png`.

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
