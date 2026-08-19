import "server-only";

import type {HotRankAsyncDataAdapter} from "@/lib/hotrank/adapters/types";
import {fixtureAdapter} from "@/lib/hotrank/adapters/fixture";
import {createSupabaseAdapter} from "@/lib/hotrank/adapters/supabase";
import {getHotRankBackendMode} from "@/lib/hotrank/runtime";
import {createSupabaseServerClient} from "@/lib/supabase/server";

const fixtureAsyncAdapter: HotRankAsyncDataAdapter = {
  async getHome() { return fixtureAdapter.getHome(); },
  async getRankings() { return fixtureAdapter.getRankings(); },
  async getClipDetail(id, expanded) { return fixtureAdapter.getClipDetail(id, expanded); },
  async getCreators() { return fixtureAdapter.getCreators(); },
  async getCreator(slug) { return fixtureAdapter.getCreator(slug); },
  async getActivity() { return fixtureAdapter.getActivity(); },
  async getProfile() { return fixtureAdapter.getProfile(); },
  async getSaved() { return fixtureAdapter.getSaved(); },
  async getSavedPrompts() { return fixtureAdapter.getSavedPrompts(); },
  async getSearch() { return fixtureAdapter.getSearch(); },
  async getSubmissionFlow() { return fixtureAdapter.getSubmissionFlow(); },
};

export async function createServerHotRankAdapter(): Promise<HotRankAsyncDataAdapter> {
  if (getHotRankBackendMode() === "fixture") return fixtureAsyncAdapter;
  return createSupabaseAdapter(await createSupabaseServerClient());
}

export async function readServerHotRank(resource: string, id?: string, expanded = false): Promise<unknown> {
  const adapter = await createServerHotRankAdapter();
  switch (resource) {
    case "home": return adapter.getHome();
    case "rankings": return adapter.getRankings();
    case "clip": return adapter.getClipDetail(id ?? "", expanded);
    case "creators": return adapter.getCreators();
    case "creator": return adapter.getCreator(id ?? "");
    case "activity": return adapter.getActivity();
    case "profile": return adapter.getProfile();
    case "saved": return adapter.getSaved();
    case "saved-prompts": return adapter.getSavedPrompts();
    case "search": return adapter.getSearch();
    case "submission": return adapter.getSubmissionFlow();
    default: throw new Error("Unknown HOTRANK read resource");
  }
}
