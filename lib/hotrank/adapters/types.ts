import type {
  ActivityData,
  CreatorDirectoryData,
  CreatorProfileData,
  HomeData,
  RankingsData,
  SavedData,
  SavedPromptsData,
  SearchData,
  SubmissionFlowData,
  Clip,
  UserProfile,
} from "@/lib/hotrank/domain/types";

/**
 * The Phase 2 contract is synchronous because the approved frontend currently
 * renders static content without loading or error states. A future backend
 * adapter can sit behind the same service names after a deliberate async
 * migration; no backend client belongs in this contract.
 */
export interface HotRankDataAdapter {
  getHome(): HomeData;
  getRankings(): RankingsData;
  getClipDetail(id: string, expanded: boolean): Clip;
  getCreators(): CreatorDirectoryData;
  getCreator(slug: string): CreatorProfileData | null;
  getActivity(): ActivityData;
  getProfile(): UserProfile;
  getSaved(): SavedData;
  getSavedPrompts(): SavedPromptsData;
  getSearch(): SearchData;
  getSubmissionFlow(): SubmissionFlowData;
}

/**
 * Server-side I/O is asynchronous. The fixture keeps the original synchronous
 * contract used by the frozen presentation, while the Supabase adapter uses
 * this explicit server contract so browser components never import a client.
 */
export interface HotRankAsyncDataAdapter {
  getHome(): Promise<HomeData>;
  getRankings(): Promise<RankingsData>;
  getClipDetail(id: string, expanded: boolean): Promise<Clip>;
  getCreators(): Promise<CreatorDirectoryData>;
  getCreator(slug: string): Promise<CreatorProfileData | null>;
  getActivity(): Promise<ActivityData>;
  getProfile(): Promise<UserProfile>;
  getSaved(): Promise<SavedData>;
  getSavedPrompts(): Promise<SavedPromptsData>;
  getSearch(): Promise<SearchData>;
  getSubmissionFlow(): Promise<SubmissionFlowData>;
}
