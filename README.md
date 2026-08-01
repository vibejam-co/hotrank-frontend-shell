# HOTRANK Frontend Shell

Premium, front-end-only React + TypeScript shell for HOTRANK’s cinematic AI-video ranking experience.

## Run locally

```bash
npm install
npm run dev
```

## Routes included

- `/` — live rankings homepage
- `/rankings` — filters, ranked chart, movement, heat score, mini rails
- `/clip/clip-1` — clip detail view
- `/creators` — creator discovery
- `/creator/eliot` — creator profile view
- `/submit` — four-step submission shell with preview and success modal
- `/saved` — watchlist state
- `/profile` — account overview placeholder surface
- `/activity` — notifications/activity surface

## Integration boundary

The UI consumes `Clip`, `Creator`, and `Adapter` interfaces from `src/types.ts`. The current `src/lib/adapters/mockAdapter.ts` is the only data source used by the shell. Replace that adapter’s methods with backend calls later; keep page components consuming the same typed objects.

Interaction state is intentionally local: saved clips, selected clip, filters, route state, and modal state. No backend logic, authentication, ranking logic, ingestion logic, or business rules are included.

## Design system

Tokens and reusable styling live in `src/styles.css`: near-black editorial surfaces, ivory display typography, restrained HOTRANK pink, hairline borders, ranking numerals, heat treatment, responsive rails, and accessible focus states. `src/App.tsx` contains the reusable shell primitives used across screens: `ClipCard`, `Leaderboard`, `Rail`, `Movement`, `ModalLayer`, and the layout/page surfaces.
