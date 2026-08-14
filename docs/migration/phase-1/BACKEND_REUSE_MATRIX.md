# HOTRANK Phase 1 — Backend Reuse Matrix

Decision vocabulary is intentionally limited to `KEEP`, `ADAPT`, `REBUILD`, and `RETIRE`.

| Canonical need | Legacy implementation | Compatibility | Data quality | Security | Reuse value | Decision |
|---|---|---|---|---|---|---|
| Clip | `submissions` rows plus the older `clips` table | Partial; two incompatible content paths | Mixed; submitted rows may be meaningful, seed `clips` are demo | Public broad reads and direct writes require containment | High after mapping | ADAPT |
| Creator | `profiles` plus separate `creators` table | Partial; identity and creator ownership are split | Mixed; seed creators are fictional/demo | Profile/admin mutation boundary is unsafe | High as a concept, low as-is | ADAPT |
| User/account | Supabase Auth, profile trigger, OAuth callback | Good provider fit | Remote account state unverified | Admin escalation and profile over-write risks | High | ADAPT |
| Ranking entry | `rankings` current projection and `ai_score` | Usable current projection | Seed rankings are demo; current remote unknown | Global writes can be triggered by normal app flows | Medium/high after server isolation | ADAPT |
| Ranking movement/history | Trend fields and application recomputation only | Movement can be mapped; history is absent | No durable historical evidence | Client/server recomputation is not a trusted audit trail | Low for history | REBUILD |
| Prompt | Prompt columns on `submissions` | Visibility and recipe fields map well | Actual prompt records unknown; seed does not provide real creator prompts | Broad submission select can expose locked/private fields | High for beta metadata | ADAPT |
| Saved clip/item | `saves(user_id, submission_id)` | Good for a first saved-item operation | Rows unknown; no collection model | Intended owner policies exist, but public select is broader than needed | High | ADAPT |
| Saved prompt | No separate table; only `prompt_unlocks` | No direct canonical saved-prompt model | Unknown | Unlock access is service-role-dependent | Low | REBUILD |
| Collection | No table or service found | Not supported | None found | None | None | REBUILD |
| Follow creator | `follows(follower_id, following_id)` | Good composite relation | Rows unknown | Self-follow check and owner insert/delete policies present | High after public-read review | ADAPT |
| Submission workflow | `submissions` status plus old direct `clips` ingest | Partial; canonical needs source, metadata, rights, review | Mixed; no unique source URL constraint | Client/server direct writes and broad owner update policy | High after trust-boundary work | ADAPT |
| Moderation/admin | `profiles.is_admin`, trigger, admin update/delete policy | Concept fits | Admin roster and remote state unknown | User can self-promote through broad profile update policy | High only after redesign | REBUILD |
| Activity | UI-derived events and interaction changes | Canonical ActivityItem can consume events | No durable activity table found | No auditable event boundary | Medium | REBUILD |
| Notifications | No table, function, or service found | No legacy support | None found | None | None | REBUILD |
| Media/source references | `video_url`, `source_url`, `embed_url`, thumbnail URLs, external media | Fits link-first canonical submission | Many URLs are demo or external; storage not proven | External URL trust and availability are unmanaged | Medium | ADAPT |
| Managed media storage | Supabase Storage enabled locally, no named bucket or upload path | Not demonstrated | No production bucket evidence | No storage policy evidence | Low | REBUILD |
| Ingestion/metadata | URL parser, deterministic metric generator, Apify placeholder | Not credible as real ingestion | Synthetic metrics and placeholder webhook | No provider webhook authentication or durable job model | Low/medium as parsing reference | REBUILD |
| Auth/session adapter | `hotrank-frontend-shell` `AuthGateway` and Supabase clients | Strong interface shape | Live auth unverified | Direct browser client and missing canonical server boundary | High as a contract seed | KEEP |
| Domain repository adapter | `hotrank-frontend-shell/src/lib/integrations/hotrank.ts` | Strong architectural direction; raw fields still leak in types | Mapping is explicit but incomplete | Direct client mutations and client ranking | High after hardening | ADAPT |
| Payments/unlocks | Dodo test checkout, webhook, MCP, `prompt_unlocks` | Not needed for Invite-30; future shape only | Test/mock behavior; customers/subscriptions absent | Missing-secret mock verification and client-controlled amount/ID | Low for beta | RETIRE |
| Deployment config | Legacy `vercel.json` catch-all rewrite and mixed Vite/Next tree | Conflicts with canonical Next route contract | No HOTRANK Vercel project verified | Project linkage and env relationship unknown | Low | RETIRE |
| Deployment/project linkage | No visible HOTRANK Vercel project in authenticated account | Must be established separately | Unknown | External ownership/domain unknown | Necessary but absent | REBUILD |
| Realtime | Local config enabled | No application channel usage found | None | No policy/channel evidence | Low | RETIRE |
| Analytics/monitoring | No verified HOTRANK analytics or monitoring integration | Not present | None found | No event privacy/retention contract | Needed later | REBUILD |

## Canonical route-to-service map

| Canonical route/capability | Domain entities | Required operations | Phase 1 backend conclusion |
|---|---|---|---|
| `/`, `/rankings` live chart | `Clip`, `Creator`, `RankingEntry` | list current approved ranking, movement, score, media, creator | Adapt `submissions`/`profiles`/`rankings` behind read-only server adapters; do not read old UI models directly |
| `/clips/[id]` | `Clip`, `Creator`, `Prompt`, `ActivityItem` | get detail, prompt visibility, creator, save/share state | Adapt submission detail; rebuild safe prompt projection and activity events |
| `/creators`, `/creators/[slug]` | `Creator`, `Clip`, `UserProfile` | list/get creator, clips, follow state | Adapt profiles/creator ownership; reconcile the dual identity model |
| `/submit` | `Submission`, `Creator`, `Prompt` | validate source, metadata, ownership declaration, create pending record | Adapt the submission shape; rebuild the trusted write path and moderation boundary |
| `/saved`, `/saved/prompts` | `SavedItem`, `Clip`, `Prompt`, possibly `Collection` | list/save/unsave clip or prompt | Adapt `saves`; rebuild saved prompts and collections only if the canonical surface requires them |
| `/activity` | `ActivityItem`, `UserProfile` | list private user activity | Rebuild durable event/read model; no legacy table found |
| `/profile` | `UserProfile`, `Submission`, `SavedItem` | get/update profile, owned submissions, saved work | Adapt profile fields and ownership; restrict mutable columns server-side |
| `/search` | `Clip`, `Creator`, `Prompt` | search approved content and creators | Rebuild a safe read query/view; no legacy search service found |

The frozen frontend remains authoritative for DOM, layout, typography, responsive behavior, navigation, and presentation. This matrix only describes infrastructure boundaries.
