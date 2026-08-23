import "server-only";

import type {SupabaseClient} from "@supabase/supabase-js";
import type {HotRankAsyncDataAdapter} from "@/lib/hotrank/adapters/types";
import type {ActivityData, Clip, CreatorDirectoryData, CreatorProfileData, HomeData, RankingsData, SavedData, SavedPromptsData, SearchData, SubmissionFlowData, UserProfile} from "@/lib/hotrank/domain/types";
import {getHotRankTimeoutMs, HotRankDataError} from "@/lib/hotrank/runtime";
import {asRows, type PublicClipRow, type PublicCreatorRow, type PublicFollowCountRow, type PublicInteractionCountRow, type PublicProfileRow, type PublicRankingRow, type PublicSubmissionRow} from "@/lib/hotrank/adapters/supabase/rows";
import {mapActivity, mapCreatorProfile, mapCreators, mapHome, mapProfileData, mapRankings, mapSaved, mapSavedPrompts, mapSearch, mapSubmissionFlow, type MappedSnapshot, type ProfileIdentity} from "@/lib/hotrank/adapters/supabase/mapping";

type ReadClient = SupabaseClient;

function withTimeout<T>(promise: PromiseLike<T>, label: string): Promise<T> {
  const timeout = getHotRankTimeoutMs();
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new HotRankDataError("HOTRANK_TIMEOUT", `${label} exceeded the ${timeout}ms timeout`)), timeout);
    Promise.resolve(promise).then((value) => { clearTimeout(timer); resolve(value); }, (error: unknown) => { clearTimeout(timer); reject(error); });
  });
}

async function selectView<T>(client: ReadClient, view: string): Promise<T[]> {
  const result = await withTimeout(client.from(view).select("*"), view);
  const typed = result as {data: unknown; error: {message: string; code?: string} | null};
  if (typed.error) throw new HotRankDataError("HOTRANK_READ_FAILED", `${view} read failed: ${typed.error.code ?? "unknown"}`);
  return asRows<T>(typed.data);
}

async function snapshot(client: ReadClient): Promise<MappedSnapshot> {
  const [profiles, creators, clips, rankings, submissions, followCounts, igniteCounts, saveCounts] = await Promise.all([
    selectView<PublicProfileRow>(client, "public_profiles"),
    selectView<PublicCreatorRow>(client, "public_creators"),
    selectView<PublicClipRow>(client, "public_clips"),
    selectView<PublicRankingRow>(client, "public_rankings"),
    selectView<PublicSubmissionRow>(client, "public_submissions"),
    selectView<PublicFollowCountRow>(client, "public_follow_counts"),
    selectView<PublicInteractionCountRow>(client, "public_ignite_counts"),
    selectView<PublicInteractionCountRow>(client, "public_save_counts"),
  ]);
  return {
    profiles,
    creators,
    clips,
    rankings,
    submissions,
    followCounts: new Map(followCounts.map((row) => [row.following_id, Number(row.follower_count) || 0])),
    igniteCounts: new Map(igniteCounts.map((row) => [row.submission_id, Number(row.ignite_count) || 0])),
    saveCounts: new Map(saveCounts.map((row) => [row.submission_id, Number(row.save_count) || 0])),
  };
}

export function createSupabaseAdapter(client: ReadClient, identity: ProfileIdentity | null = null): HotRankAsyncDataAdapter {
  return {
    async getHome(): Promise<HomeData> { return mapHome(await snapshot(client)); },
    async getRankings(): Promise<RankingsData> { const data = await snapshot(client); return mapRankings(data); },
    async getClipDetail(id: string, _expanded: boolean): Promise<Clip> { const data = await snapshot(client); const clips = mapSearch(data).clips; return clips.find((clip) => clip.id === id || clip.slug === id) ?? mapHome(data).hero; },
    async getCreators(): Promise<CreatorDirectoryData> { return mapCreators(await snapshot(client)); },
    async getCreator(slug: string): Promise<CreatorProfileData | null> { return mapCreatorProfile(slug, await snapshot(client)); },
    async getActivity(): Promise<ActivityData> { return mapActivity(); },
    async getProfile(): Promise<UserProfile> { return mapProfileData(identity?.id ?? null, await snapshot(client), identity); },
    async getSaved(): Promise<SavedData> { return mapSaved(); },
    async getSavedPrompts(): Promise<SavedPromptsData> { return mapSavedPrompts(); },
    async getSearch(): Promise<SearchData> { return mapSearch(await snapshot(client)); },
    async getSubmissionFlow(): Promise<SubmissionFlowData> { return mapSubmissionFlow(); },
  };
}
