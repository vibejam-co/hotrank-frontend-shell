# HOTRANK Phase 3C — Canonical Adapter Mapping

Date: 2026-08-19
Project: HOTRANK / `csuejshnycgbfvtjbxoq`
Canonical frontend: `hotrank-frontend-v1-lock` → `1e63e4a7e3b5603c5453c6a79ced27dff9ad33aa`

## Boundary

`lib/hotrank/adapters/supabase/` is the only Supabase-to-domain mapping
boundary. It reads only the Phase 3B safe projections and returns canonical
HOTRANK domain objects. No presentation file imports a Supabase client, row
schema, RPC, service-role client, or raw response.

The projection contract is defined by the Phase 3B migrations:

| Safe projection | Canonical mapping | Notes |
|---|---|---|
| `public_profiles` | `Creator`, `UserProfile` identity | display name/handle/avatar/bio only |
| `public_creators` | `Creator` | legacy creator identity is merged by stable id where possible |
| `public_clips` | `Clip` | media, score, category, and public metrics only |
| `public_rankings` | `RankingEntry` | invalid/missing clip or rank rows are dropped deterministically |
| `public_submissions` | `Clip`, `Prompt` | approved-only projection; free prompt text only |
| `public_follow_counts` | `Creator.followersLabel` | aggregate only; relation rows remain private |
| `public_ignite_counts` | `Clip.likesLabel` | aggregate only; approved submissions only |
| `public_save_counts` | `Clip.savesLabel` / `RankingEntry.savesLabel` | aggregate only; approved submissions only |

## Domain rules

- IDs remain remote identifiers; slugs are deterministic presentation-safe
  derivatives and never authorization keys.
- Missing media uses a neutral HOTRANK brand placeholder, not a fabricated
  content asset.
- Ranking order is `rank_position ASC`, then stable id.
- Creator/search collections are name-sorted, then id-sorted.
- Unknown/empty remote collections are represented as stable empty arrays.
- Activity, collections, saved prompts, and private saved/followed lists have
  no safe Phase 3B read projection, so the adapter returns empty domain
  collections rather than querying protected base tables or inventing events.
- Locked/private prompt text is never mapped; only `prompt_visibility = free`
  rows can produce a `Prompt`.
- The home/detail domain retains its existing non-null shape for the frozen UI;
  an internal `empty-clip` marker is used only when there is no approved
  remote content. It is not a remote content row and all remote content lists
  remain empty.

## Submission and mutation mapping

The protected server adapter maps domain mutation inputs to the Phase 3B RPC
names (`hotrank_update_profile`, `hotrank_create_submission`,
`hotrank_update_submission`, `hotrank_claim_creator`, save/follow/ignite RPCs,
and protected moderation/ranking RPCs). Actor identity always comes from
verified Supabase Auth on the server request; it is never accepted as a
browser body field.

No raw SQL row, generated database type, service-role client, or private
relation is part of the domain contract.
