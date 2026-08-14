# HOTRANK Phase 1 — Legacy Frontend Denylist

The canonical frontend is frozen. The following legacy presentation layers must not be copied, imported, or used as a styling/layout authority in later phases.

## Denylisted repositories and paths

### `/Users/Ira/Desktop/HOTRANK`

- `src/App.tsx` route shell and route-switch composition.
- `src/index.css`, Tailwind classes, premium CSS classes, and legacy design tokens.
- `src/pages/*`, including dashboard, rankings, creator, profile, submit, login, signup, activity, and saved screens.
- `src/components/premium/*`, `src/components/shared/*`, and legacy ranking/creator/profile cards.
- `src/components/auth/*`, `src/components/ui/*`, `src/components/profile/*`, and legacy navigation/account shells.
- `src/components/premium/PremiumShell.tsx`, `src/components/premium/ranking/*`, `src/components/premium/clips/*`, and old responsive rules.
- `app/(app)/layout.tsx`, legacy Next pages, and the old command-surface bodywork.
- `src/data/mockData.ts`, `src/data/mockCreators.ts`, `lib/mock-data.ts`, and any fixed demo content used to make the old UI look populated.
- `public` legacy logos, avatars, thumbnails, and presentation media unless separately re-licensed and explicitly approved as content assets.

### `/Users/Ira/Desktop/hotrank-frontend-shell`

- `src/App.tsx` and its history-API route shell.
- `src/styles.css` and all shell-specific classes/tokens.
- `src/data/mockData.ts`, `src/lib/adapters/mockAdapter.ts`, and mock media/content.
- Shell page components, cards, modal layouts, navigation, auth screens, profile screens, and responsive behavior.

### Adjacent snapshot

`/Users/Ira/Desktop/hotrank-latest-preview` is a prior static presentation snapshot. It is not an infrastructure donor and is denylisted for layout, CSS, tokens, navigation, cards, media, and responsive code as well.

## Explicitly permitted reuse

The only legacy frontend-adjacent material worth carrying forward is the *idea* of a typed repository/service boundary represented by `hotrank-frontend-shell/src/lib/integrations/hotrank.ts`. Its raw database types, direct browser writes, Heat Score implementation, and UI imports still require adaptation and review.

## Contamination checks for future work

Reject a change if it:

- imports a legacy page, shell, card, logo, CSS file, token file, or responsive utility;
- copies legacy class names or layout wrappers into canonical routes;
- passes raw `submissions`, `clips`, `profiles`, or `rankings` rows into canonical components;
- reintroduces static creator/clip fixtures into a production data path;
- changes canonical DOM structure, typography, spacing, navigation, or breakpoint behavior without an approved frontend design change.

Frontend contamination risk is **HIGH** because both legacy repositories contain polished but rejected presentation systems that can make an adapter integration appear faster while silently violating the canonical V1 contract.
