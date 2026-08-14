# HOTRANK Phase 2 Current Data Flow

## Baseline record

- Repository: `/Users/Ira/Desktop/hotrank-frontend-final`
- Branch: `main`
- Starting HEAD: `6cc14e229f5783fe8cb1f8162be3e1932772bc2b`
- Lock tag: `hotrank-frontend-v1-lock` → `1e63e4a7e3b5603c5453c6a79ced27dff9ad33aa`
- Runtime source during Phase 2: fixture adapter over existing static data.
- Pre-existing dirty files and untracked media/QA artifacts were preserved; unrelated changes were not intentionally cleaned or overwritten.

## Read flow after Phase 2

| Surface | Presentation entry | Service operation | Domain data | Read/write | Runtime |
| --- | --- | --- | --- | --- | --- |
| Home `/` | `app/page.tsx` | `getHomeData()` | `HomeData`, `Clip` | Read; local links only | Server |
| Rankings `/rankings` | `app/rankings/page.tsx` | `getRankingsData()` | `RankingEntry` | Read; filters local only | Server |
| Creators `/creators` | `app/creators/page.tsx` | `getCreatorDirectory()` | `CreatorDirectoryData` | Read; chart/category local only | Client |
| Creator `/creators/[slug]` | `app/creators/[slug]/page.tsx` | `getCreatorProfile()` | `CreatorProfileData`, `Prompt` | Read; follow local only | Client |
| Activity `/activity` | `app/activity/page.tsx` | `getActivityData()` | `ActivityData`, `ActivityItem` | Read | Server |
| Profile `/profile` | `app/profile/page.tsx` | `getUserProfile()` | `UserProfile`, `Collection`, `Prompt` | Read; tabs/actions local only | Client |
| Saved `/saved` | `app/saved/page.tsx` | `getSavedData()` | `SavedData`, `Clip`, `Creator` | Read; tabs local only | Client |
| Saved prompts `/saved/prompts` | `app/saved/prompts/page.tsx` | `getSavedPromptsData()` | `SavedPromptsData`, `Prompt` | Read; copy local only | Client |
| Search `/search` | `components/search-surface.tsx` | `getSearchData()` | `SearchData`, `Clip`, `Creator` | Read; query/tabs local only | Client |
| Clip detail `/clips/[id]` | `components/clip-detail.tsx` | `getClipDetail()` | `Clip`, `Prompt` | Read; save/copy local only | Client |
| Submit `/submit` | `components/submit-flow.tsx` | `getSubmissionFlowData()` | `SubmissionFlowData`, `Submission` | Read; form state local, no write | Client |

## Before/after boundary

Before Phase 2, routes and components read static tuples and inline fixture objects directly. After Phase 2, presentation code calls service operations and receives typed domain objects. Only `lib/hotrank/adapters/fixture/index.ts` imports `lib/data.ts`.

## Write classification

There are no backend writes. Buttons and forms that appear interactive update local React state, navigate, or show the existing demo behavior. Submission explicitly remains demo validation only. Saved/follow/copy controls are not persistence claims.
