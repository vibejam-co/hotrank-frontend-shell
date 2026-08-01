# HOTRANK Frontend Shell

Isolated premium frontend shell for HOTRANK’s cinematic AI-video ranking experience.

This repository is the canonical frontend publication target. The legacy `/Users/Ira/Desktop/HOTRANK` repository is a read-only backend and contract donor; its `.git` directory, legacy UI, and frontend tree must not be copied into this repository.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required public browser variables in `.env.local`:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

Never commit `.env.local` or secret credentials. The anon/publishable key is intended for browser use; service-role keys do not belong in this application.

## Development and validation

- Development: `npm run dev`
- Production build: `npm run build`
- Typecheck: `npx tsc --noEmit`
- Diff hygiene: `git diff --check`
- Preview locally: `npm run preview`

This package currently does not define separate `lint` or `test` scripts.

## Routes

- `/` — live rankings homepage
- `/rankings` — rankings explorer
- `/clip/:id` — clip detail and quick view
- `/creators` — creator discovery
- `/creator/:id` — creator profile
- `/submit` — four-stage submission shell
- `/saved` — watchlist
- `/profile` — current-user profile surface
- `/activity` — activity and notifications
- `/login` and `/signup` — authentication surfaces

## Deployment boundary

Production deployment, domain changes, OAuth configuration, Supabase configuration, and Vercel project linkage require separate explicit approval. This publication task does not create or promote a Production deployment.
