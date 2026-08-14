import {fixtureAdapter} from "@/lib/hotrank/adapters/fixture";
import type {HotRankDataAdapter} from "@/lib/hotrank/adapters/types";

export const hotRankAdapter: HotRankDataAdapter = fixtureAdapter;

export const getHomeData = () => hotRankAdapter.getHome();
export const getRankingsData = () => hotRankAdapter.getRankings();
export const getClipDetail = (id: string, expanded: boolean) => hotRankAdapter.getClipDetail(id, expanded);
export const getCreatorDirectory = () => hotRankAdapter.getCreators();
export const getCreatorProfile = (slug: string) => hotRankAdapter.getCreator(slug);
export const getActivityData = () => hotRankAdapter.getActivity();
export const getUserProfile = () => hotRankAdapter.getProfile();
export const getSavedData = () => hotRankAdapter.getSaved();
export const getSavedPromptsData = () => hotRankAdapter.getSavedPrompts();
export const getSearchData = () => hotRankAdapter.getSearch();
export const getSubmissionFlowData = () => hotRankAdapter.getSubmissionFlow();
