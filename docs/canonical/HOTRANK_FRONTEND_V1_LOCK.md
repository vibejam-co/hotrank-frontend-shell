# HOTRANK Canonical Frontend V1 Lock

Status: Phase 0 canonical presentation contract

Audited branch: `main`

Audited HEAD: `328ef8d9b522e176f71064cdee545e9798a9c194` (`328ef8d`)

Audited: 2026-08-14

## Purpose

This document defines HOTRANK Canonical Frontend V1. It freezes the current
frontend presentation direction before backend, infrastructure, authentication,
payments, production data, or deployment migration work begins.

The frontend is the presentation contract. Future systems may supply data and
behavior, but they must adapt to this contract rather than reshape it.

> Backend and infrastructure integrations may provide data and behavior,
> but may not materially alter canonical DOM hierarchy where geometry
> depends upon it, layout proportions, component sizes, media ratios,
> typography, spacing, navigation, page composition, responsive behavior,
> visual hierarchy, interaction placement, or brand presentation without
> a separately approved frontend design change.

## Canonical global surfaces

The following are locked presentation surfaces:

- HOTRANK logo and wordmark: `components/brand/HotRankLogo.tsx`, using the
  trimmed V2 PNG assets under `public/brand/hotrank/v2/`.
- Header and primary navigation: `components/header.tsx`.
- Search entry, notification control, avatar/profile control, and responsive
  header behavior.
- Typography: system sans for interface text and Cormorant/Georgia serif for
  editorial titles.
- Color system: dark `--bg` foundation, elevated dark surfaces, warm light
  text, muted secondary text, HOTRANK pink accent, green upward movement, and
  red downward movement.
- Spacing, borders, radii, card treatment, sticky header, focus-visible
  treatment, reduced-motion handling, and responsive breakpoints defined in
  `app/globals.css` and `components/brand/hotrank-brand-tokens.css`.
- Adaptive media identity: portrait, square, landscape, cinematic, and
  ultrawide ratios remain format-aware; poster identity remains authoritative.

## Locked routes

| Surface | Canonical route |
| --- | --- |
| Live home | `/` |
| Rankings | `/rankings` |
| Clip detail | `/clips/[id]` |
| Creator discovery | `/creators` |
| Creator profile | `/creators/[slug]` |
| Submit | `/submit` |
| Saved clips | `/saved` |
| Saved prompts | `/saved/prompts` |
| Activity | `/activity` |
| User profile | `/profile` |
| Search | `/search` |

The Phase 0 browser baseline exercises both landscape and portrait clip-detail
states: `/clips/echoes-of-tomorrow` and `/clips/last-horizon`.

## Interaction contract

- Adaptive media preserves the declared media ratio and poster identity.
- Desktop hover preview is opt-in, delayed, single-active, and stopped on
  pointer leave, visibility changes, intersection loss, or reduced motion.
- Prompt copy exposes a real button with a live `Copied` state and fallback
  clipboard path.
- Prompt intelligence can expand and collapse without losing the primary
  copy action.
- Creator follow controls retain their placement and clear active state.
- Ranking filters remain native, labeled controls; ranking information remains
  understandable when the desktop table condenses at smaller widths.
- Search provides an overlay/dialog surface, a labeled input, focus return,
  ArrowUp/ArrowDown selection, Enter selection, and Escape close behavior.
- Responsive touch interactions use scrollable rails and controls that remain
  reachable without hover.
- Reduced-motion users do not receive video preview playback or long animated
  transitions.

## Implementation anchors

The canonical implementation is represented by the current files, including:

- `app/globals.css`
- `components/brand/hotrank-brand-tokens.css`
- `components/brand/HotRankLogo.tsx`
- `components/header.tsx`
- `components/adaptive-media.tsx`
- `components/preview-system.tsx`
- `components/cards.tsx`
- `components/clip-detail.tsx`
- `components/search-surface.tsx`
- `components/submit-flow.tsx`
- `components/interaction-controls.tsx`
- `components/profile-actions.tsx`

These files are presentation authority. Existing legacy components and styles
are not alternate sources of truth.

## Change control

Any future change that can affect geometry, layout, typography, media ratios,
navigation, responsive behavior, visual hierarchy, or interaction placement
requires a separately approved frontend design change and refreshed canonical
visual evidence. Backend PRs must consume frontend domain contracts and service
interfaces; they must not bind components directly to legacy database shapes.

Phase 0 does not authorize Supabase, Vercel, authentication, payments,
deployment, data migration, DNS, or production changes.
