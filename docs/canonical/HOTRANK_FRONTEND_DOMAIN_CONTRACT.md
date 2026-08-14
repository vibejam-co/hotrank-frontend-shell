# HOTRANK Frontend Domain Contract

Status: Phase 0 UI-facing contract

Audited HEAD: `328ef8d9b522e176f71064cdee545e9798a9c194`

This is an interface boundary for the current frontend. It is not a Supabase
schema, database migration, API payload specification, or backend redesign.

## Required dependency direction

```text
components
        ↓
frontend domain models
        ↓
service interfaces
        ↓
backend adapters
        ↓
Supabase / legacy infrastructure
```

Components must never depend directly on a raw legacy database shape.

## UI-facing entities

### Clip

The current UI consumes or clearly requires:

- stable `id`/slug;
- `title`;
- `poster` media reference;
- optional `video` preview reference;
- `creator` reference or display identity;
- `heat` score;
- movement direction/value;
- declared format/media ratio;
- optional description, tags, views, likes, saves, and duration;
- optional prompt intelligence including prompt body, tools, and workflow.

### Creator

- stable `id`/slug;
- display name, avatar, and optional banner;
- bio and location;
- follower count;
- rank and movement;
- clip, view, and prompt counts;
- follow state;
- featured/recent work references;
- tools and workflow summaries.

### RankingEntry

- rank position;
- clip reference/title;
- creator display identity;
- heat score;
- saves;
- movement;
- reason/trend explanation;
- declared media format.

### Prompt

- stable `id`;
- title;
- prompt body;
- optional reference image;
- saved date/state;
- tags and supported tools;
- optional workflow/breakdown;
- copy availability.

### SavedItem

- stable `id`;
- item kind: clip, prompt, or collection;
- referenced domain item;
- saved date/order;
- optional collection reference;
- saved/rank metadata where shown.

### Submission

- source URL;
- supported platform;
- title, description, category, tags;
- creator name and attribution URL;
- detected media format and preview;
- validation state;
- original-work confirmation;
- current frontend step and action state.

### UserProfile

- stable `id`;
- display name, handle, avatar;
- member-since date;
- saved, following, submissions, and collection counts;
- recently saved items;
- collections;
- followed creators;
- prompt library.

### ActivityItem

- stable `id`;
- activity type and title;
- descriptive message;
- optional clip/creator reference and thumbnail;
- timestamp/relative time;
- movement or status indicator.

## Service interface shape

The exact implementation may vary, but the frontend should consume stable
interfaces equivalent to:

```ts
interface ClipService {
  getClip(id: string): Promise<Clip | null>;
  listClips(input: ClipListInput): Promise<ClipListResult>;
}

interface CreatorService {
  getCreator(slug: string): Promise<Creator | null>;
  listCreators(input: CreatorListInput): Promise<CreatorListResult>;
}

interface RankingService {
  listRankings(input: RankingFilter): Promise<RankingEntry[]>;
}

interface UserService {
  getProfile(): Promise<UserProfile | null>;
  listActivity(): Promise<ActivityItem[]>;
}
```

Submission, saved-item, follow, prompt-copy, and search operations should
similarly expose frontend-shaped inputs and outputs. Adapters own legacy field
mapping, authorization details, retries, null handling, pagination, and error
normalization.

## Contract rules

- Preserve the current route and component needs while replacing demo data.
- Prefer optional domain fields over backend-shaped unions leaking into views.
- Keep media references format-aware; do not infer a new visual ratio from a
  legacy asset or table.
- Keep loading, empty, permission, and error states inside service/domain
  boundaries so the presentation composition remains stable.
- Add a domain field only when a current surface consumes it or a clearly
  required current interaction needs it.
- Do not add Supabase-specific names, joins, row metadata, or storage paths to
  component props.
