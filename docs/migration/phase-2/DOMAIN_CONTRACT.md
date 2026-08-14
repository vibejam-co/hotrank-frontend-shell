# HOTRANK Phase 2 Domain Contract

The domain boundary is defined in `lib/hotrank/domain/types.ts`. These types intentionally contain no Supabase, payment, database-row, or UI-component types.

## Entities

- `Clip`: stable `id`/`slug`, title, poster, media ratio, creator, heat, movement, and optional detail metadata.
- `Creator`: stable `id`/`slug`, name, optional handle/avatar, audience labels, profile metadata, and ranking labels.
- `RankingEntry`: stable entry id, rank position, clip, trend reason, saves label, and movement.
- `Prompt`: stable id, title, content, optional preview image and tags.
- `SavedItem`: stable id, item kind, referenced item id, and saved timestamp label.
- `Submission`: stable id, source URL, title, description, creator, ratio, and optional tags/status.
- `UserProfile`: stable id, display identity, avatar, bio, stats, saved work, collections, follows, and prompt list.
- `ActivityItem`: stable id, title/message, thumbnail, time label, movement, and activity icon kind.

## Invariants

- IDs and slugs are stable within the active adapter.
- A `Clip` always has a `Creator`, `poster`, `ratio`, `heat`, and `movement`.
- A `RankingEntry` always has a positive `rankPosition` and a complete `Clip`.
- Media ratios are limited to `16:9`, `9:16`, `1:1`, `4:5`, `2:1`, and `ultrawide`.
- Movement direction is `up`, `down`, or `flat`; display labels remain source-compatible.
- Domain shapes do not expose raw fixture tuple positions to presentation code.
- Optional fields are used only where a canonical surface may omit the value; presentation defaults preserve the existing output.

## Screen data

The contract also includes typed aggregate shapes for home, rankings, creator directory/profile, activity, saved views, search, and submission flow. These are read models composed from the entities above and are returned by adapter methods, then forwarded by services.
