import type {
  ActivityData,
  Clip,
  Creator,
  CreatorDirectoryData,
  CreatorProfileData,
  HomeData,
  MediaRatio,
  Movement,
  Prompt,
  RankingEntry,
  RankingsData,
  SavedData,
  SavedPromptsData,
  SearchData,
  SubmissionFlowData,
  UserProfile,
} from "@/lib/hotrank/domain/types";
import type {PublicClipRow, PublicCreatorRow, PublicInteractionCountRow, PublicProfileRow, PublicRankingRow, PublicSubmissionRow} from "@/lib/hotrank/adapters/supabase/rows";

const emptyAvatar = "/brand/hotrank/v2/hotrank-icon-pink.png";
const fallbackPoster = "/brand/hotrank/v2/hotrank-primary.png";

const text = (value: string | null | undefined, fallback = "") => value?.trim() || fallback;
const numericLabel = (value: number | string | null | undefined, fallback = "0") => value === null || value === undefined ? fallback : String(value);
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "creator";

export const toMovement = (value: string | null | undefined): Movement => {
  const label = text(value, "—");
  const direction = /down|^[-▼↓]/i.test(label) ? "down" : /flat|^—/.test(label) ? "flat" : "up";
  return {direction, label};
};

function ratioFor(value: string | null | undefined): MediaRatio {
  if (value === "9:16" || value === "4:5" || value === "1:1" || value === "16:9" || value === "2:1" || value === "2.39:1") return value;
  return "16:9";
}

export function mapProfile(row: PublicProfileRow): Creator {
  const name = text(row.display_name, text(row.username, text(row.handle, "HOTRANK member")));
  const handle = text(row.handle, text(row.username));
  return {
    id: row.id,
    slug: slugify(handle || name),
    name,
    handle: handle ? `@${handle.replace(/^@/, "")}` : undefined,
    avatar: text(row.avatar_url, emptyAvatar),
    bio: text(row.bio) || undefined,
  };
}

export function mapCreator(row: PublicCreatorRow): Creator {
  const name = text(row.username, "HOTRANK creator");
  return {id: row.id, slug: slugify(name), name, avatar: text(row.avatar_url, emptyAvatar)};
}

function promptFor(row: PublicSubmissionRow): Prompt | undefined {
  if (row.prompt_visibility !== "free" || !row.prompt_text?.trim()) return undefined;
  return {id: `prompt-${row.id}`, title: text(row.title, "Prompt"), copy: row.prompt_text, tags: [], savedAtLabel: undefined};
}

export function mapSubmission(row: PublicSubmissionRow, creator: Creator, counts?: {ignites?: number | string | null; saves?: number | string | null}): Clip {
  const title = text(row.title, "Untitled submission");
  const poster = text(row.preview_thumbnail, fallbackPoster);
  return {
    id: row.id,
    slug: slugify(title),
    title,
    poster,
    ratio: "16:9",
    creator,
    heat: "—",
    movement: {direction: "flat", label: "—"},
    video: text(row.embed_url, text(row.source_url)) || undefined,
    createdLabel: row.created_at ? new Date(row.created_at).toLocaleDateString("en", {month: "short", day: "numeric", year: "numeric"}) : undefined,
    prompt: promptFor(row),
    savesLabel: numericLabel(counts?.saves, "0"),
    likesLabel: numericLabel(counts?.ignites, "0"),
  };
}

export function mapClip(row: PublicClipRow, creator: Creator): Clip {
  const title = text(row.title, "Untitled clip");
  return {
    id: row.id,
    slug: slugify(title),
    title,
    poster: text(row.thumbnail_url, fallbackPoster),
    ratio: ratioFor(null),
    creator,
    heat: numericLabel(row.ai_score, "—"),
    movement: {direction: "flat", label: "—"},
    video: text(row.video_url) || undefined,
    viewsLabel: numericLabel(row.view_count, "0"),
  };
}

const emptyCreator = (): Creator => ({id: "empty-creator", slug: "empty-creator", name: "No public creators yet", avatar: emptyAvatar});
const emptyClip = (): Clip => ({id: "empty-clip", slug: "empty-clip", title: "No approved clips yet", poster: fallbackPoster, ratio: "16:9", creator: emptyCreator(), heat: "—", movement: {direction: "flat", label: "—"}});
const emptyPrompt = (): Prompt => ({id: "empty-prompt", title: "No saved prompts yet", copy: "Saved prompts will appear here when they are available.", tags: []});
const emptySubmission = (): SubmissionFlowData["submission"] => ({id: "empty-submission", sourceUrl: "", platform: "", title: "", description: "", category: "", tags: [], creatorName: "", attributionUrl: "", preview: fallbackPoster, validationLabel: "", rightsConfirmed: false});

export interface MappedSnapshot {
  profiles: PublicProfileRow[];
  creators: PublicCreatorRow[];
  clips: PublicClipRow[];
  rankings: PublicRankingRow[];
  submissions: PublicSubmissionRow[];
  followCounts: Map<string, number>;
  igniteCounts: Map<string, number>;
  saveCounts: Map<string, number>;
}

const count = (value: number | string | null | undefined) => Number.isFinite(Number(value)) ? Number(value) : 0;

export function creatorsFrom(snapshot: MappedSnapshot): Creator[] {
  const byId = new Map(snapshot.profiles.map((row) => [row.id, mapProfile(row)]));
  const values = snapshot.creators.map((row) => byId.get(row.id) ?? mapCreator(row));
  const present = new Set(values.map((item) => item.id));
  for (const profile of snapshot.profiles) if (!present.has(profile.id)) values.push(mapProfile(profile));
  return [...new Map(values.map((item) => [item.id, {...item, followersLabel: `${count(snapshot.followCounts.get(item.id))} Followers`}])).values()]
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}

export function clipsFrom(snapshot: MappedSnapshot, creators: Creator[]): Clip[] {
  const creatorById = new Map(creators.map((item) => [item.id, item]));
  const creatorByHandle = new Map(creators.flatMap((item) => item.handle ? [[item.handle.replace(/^@/, "").toLowerCase(), item] as const] : []));
  const clipValues = snapshot.clips.map((row) => mapClip(row, creatorById.get(row.creator_id || "") ?? emptyCreator()));
  const submissionValues = snapshot.submissions.map((row) => mapSubmission(row, creatorByHandle.get(text(row.creator_handle).replace(/^@/, "").toLowerCase()) ?? emptyCreator(), {ignites: snapshot.igniteCounts.get(row.id), saves: snapshot.saveCounts.get(row.id)}));
  const all = [...clipValues, ...submissionValues];
  return [...new Map(all.map((item) => [item.id, item])).values()].sort((a, b) => a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
}

export function mapHome(snapshot: MappedSnapshot): HomeData {
  const creators = creatorsFrom(snapshot);
  const clips = clipsFrom(snapshot, creators);
  const ranked = mapRankings(snapshot, clips).rows.map((entry) => entry.clip);
  const content = ranked.length ? ranked : clips;
  return {hero: content[0] ?? emptyClip(), liveRankings: content.slice(1), risingNow: content.slice(0, 6), editorPicks: content.slice(0, 5)};
}

export function mapRankings(snapshot: MappedSnapshot, clips = clipsFrom(snapshot, creatorsFrom(snapshot))): RankingsData {
  const byId = new Map(clips.map((clip) => [clip.id, clip]));
  const rows: RankingEntry[] = snapshot.rankings
    .map((row) => {
      const clip = byId.get(row.clip_id || "");
      const rankPosition = Number(row.rank_position);
      if (!clip || !Number.isInteger(rankPosition) || rankPosition < 1) return null;
      const movement = toMovement(row.trend_direction);
      return {id: row.id, rankPosition, clip: {...clip, movement}, reason: text(row.category, "Current ranking"), savesLabel: numericLabel(snapshot.saveCounts.get(clip.id), "0"), movement};
    })
    .filter((entry): entry is RankingEntry => entry !== null)
    .sort((a, b) => a.rankPosition - b.rankPosition || a.id.localeCompare(b.id));
  return {featured: rows.slice(0, 3), rows};
}

export function mapCreators(snapshot: MappedSnapshot): CreatorDirectoryData {
  const values = creatorsFrom(snapshot);
  const featured = values[0] ?? emptyCreator();
  return {categories: [], featured, chart: values, chartExpanded: values, rising: [], newVoices: [], mostFollowed: values};
}

export function mapCreatorProfile(slug: string, snapshot: MappedSnapshot): CreatorProfileData | null {
  const creator = creatorsFrom(snapshot).find((item) => item.slug === slug || item.handle?.replace(/^@/, "") === slug);
  if (!creator) return null;
  const clips = clipsFrom(snapshot, [creator]).filter((clip) => clip.creator.id === creator.id || clip.creator.name === creator.name);
  return {creator, featuredWork: clips.slice(0, 4), recentWork: clips.slice(0, 6), prompts: clips.flatMap((clip) => clip.prompt ? [clip.prompt] : []).slice(0, 4), tools: [], workflow: []};
}

export const mapActivity = (): ActivityData => ({today: [], earlier: [], pulse: {clipsUp: "0", clipsDown: "0", netMovement: "0"}, topMover: "No activity yet", topMoverLabel: ""});

export interface ProfileIdentity {
  id: string;
  email: string | null;
  displayName?: string;
  handle?: string;
}

function memberSinceLabel(createdAt: string | null | undefined): string {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? "" : `Member since ${date.toLocaleDateString("en", {month: "long", year: "numeric"})}`;
}

export function mapProfileData(userId: string | null, snapshot: MappedSnapshot, identity?: ProfileIdentity | null): UserProfile {
  const profileRow = userId ? snapshot.profiles.find((row) => row.id === userId) : undefined;
  const profile = profileRow ? mapProfile(profileRow) : undefined;
  const fallbackName = text(identity?.displayName, text(identity?.email?.split("@")[0], "HOTRANK member"));
  const fallbackHandle = text(identity?.handle);
  const links = Array.isArray(profileRow?.links) ? profileRow.links.filter((link): link is string => typeof link === "string" && Boolean(link.trim())).map((link) => link.trim()) : [];
  return {
    id: userId ?? "anonymous",
    name: profile?.name ?? fallbackName,
    handle: profile?.handle ?? (fallbackHandle ? `@${fallbackHandle.replace(/^@/, "")}` : ""),
    avatar: profile?.avatar ?? emptyAvatar,
    bio: profile?.bio,
    links,
    memberSinceLabel: memberSinceLabel(profileRow?.created_at),
    stats: [],
    recentlySaved: [],
    collections: [],
    followedCreators: [],
    promptLibrary: [],
  };
}

export const mapSaved = (): SavedData => ({savedClips: [], collections: [], prompts: [], followedCreators: []});
export const mapSavedPrompts = (): SavedPromptsData => ({featured: emptyPrompt(), prompts: []});
export function mapSearch(snapshot: MappedSnapshot): SearchData { const creators = creatorsFrom(snapshot); return {clips: clipsFrom(snapshot, creators), creators}; }
export const mapSubmissionFlow = (): SubmissionFlowData => ({platforms: ["YouTube", "TikTok", "Instagram"], submission: emptySubmission()});
