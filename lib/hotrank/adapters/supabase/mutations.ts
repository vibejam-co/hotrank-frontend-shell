import "server-only";

import type {SupabaseClient} from "@supabase/supabase-js";
import type {InteractionInput, ModerationInput, ProfileUpdateInput, RankingUpsertInput, SubmissionCreateInput, SubmissionUpdateInput} from "@/lib/hotrank/domain/mutations";
import {HotRankDataError} from "@/lib/hotrank/runtime";

type RpcClient = SupabaseClient;

async function rpc<T>(client: RpcClient, functionName: string, args: Record<string, unknown>): Promise<T> {
  const {data, error} = await client.rpc(functionName, args);
  if (error) throw new HotRankDataError("HOTRANK_MUTATION_FAILED", `${functionName} failed: ${error.code ?? "unknown"}`);
  return data as T;
}

export function createMutationAdapter(client: RpcClient) {
  return {
    updateProfile(actorId: string, input: ProfileUpdateInput) {
      return rpc<void>(client, "hotrank_update_profile", {p_actor_id: actorId, p_profile_id: input.profileId, p_username: input.username, p_display_name: input.displayName, p_handle: input.handle, p_avatar_url: input.avatarUrl, p_bio: input.bio, p_links: input.links});
    },
    createSubmission(actorId: string, input: SubmissionCreateInput) {
      return rpc<string>(client, "hotrank_create_submission", {p_actor_id: actorId, p_source_url: input.sourceUrl, p_platform: input.platform, p_external_content_id: input.externalContentId ?? null, p_embed_url: input.embedUrl ?? null, p_preview_thumbnail: input.previewThumbnail ?? null, p_creator_notes: input.creatorNotes ?? null, p_title: input.title, p_creator_handle: input.creatorHandle ?? null, p_canonical_url: input.canonicalUrl ?? null, p_prompt_text: input.promptText ?? null, p_prompt_visibility: input.promptVisibility ?? "free", p_prompt_price: input.promptPrice ?? null, p_ai_stack: input.aiStack ?? [], p_workflow_notes: input.workflowNotes ?? null, p_recipe_included: input.recipeIncluded ?? false, p_ai_stack_included: input.aiStackIncluded ?? false, p_workflow_notes_included: input.workflowNotesIncluded ?? false});
    },
    updateSubmission(actorId: string, input: SubmissionUpdateInput) {
      return rpc<void>(client, "hotrank_update_submission", {p_actor_id: actorId, p_submission_id: input.submissionId, p_embed_url: input.embedUrl ?? null, p_preview_thumbnail: input.previewThumbnail ?? null, p_creator_notes: input.creatorNotes ?? null, p_title: input.title, p_creator_handle: input.creatorHandle ?? null, p_canonical_url: input.canonicalUrl ?? null, p_prompt_text: input.promptText ?? null, p_prompt_visibility: input.promptVisibility ?? null, p_prompt_price: input.promptPrice ?? null, p_ai_stack: input.aiStack ?? [], p_workflow_notes: input.workflowNotes ?? null, p_recipe_included: input.recipeIncluded ?? false, p_ai_stack_included: input.aiStackIncluded ?? false, p_workflow_notes_included: input.workflowNotesIncluded ?? false});
    },
    claimCreator(actorId: string, creatorId: string) { return rpc<void>(client, "hotrank_claim_creator", {p_actor_id: actorId, p_creator_id: creatorId}); },
    save(actorId: string, input: Required<Pick<InteractionInput, "submissionId">>) { return rpc<void>(client, "hotrank_save_submission", {p_actor_id: actorId, p_submission_id: input.submissionId}); },
    removeSave(actorId: string, input: Required<Pick<InteractionInput, "submissionId">>) { return rpc<void>(client, "hotrank_remove_save", {p_actor_id: actorId, p_submission_id: input.submissionId}); },
    follow(actorId: string, input: Required<Pick<InteractionInput, "followingId">>) { return rpc<void>(client, "hotrank_follow_profile", {p_actor_id: actorId, p_following_id: input.followingId}); },
    unfollow(actorId: string, input: Required<Pick<InteractionInput, "followingId">>) { return rpc<void>(client, "hotrank_unfollow_profile", {p_actor_id: actorId, p_following_id: input.followingId}); },
    ignite(actorId: string, input: Required<Pick<InteractionInput, "submissionId">>) { return rpc<void>(client, "hotrank_add_ignite", {p_actor_id: actorId, p_submission_id: input.submissionId}); },
    removeIgnite(actorId: string, input: Required<Pick<InteractionInput, "submissionId">>) { return rpc<void>(client, "hotrank_remove_ignite", {p_actor_id: actorId, p_submission_id: input.submissionId}); },
    moderate(actorId: string, input: ModerationInput) { return rpc<void>(client, "hotrank_moderate_submission", {p_actor_id: actorId, p_submission_id: input.submissionId, p_status: input.status}); },
    upsertRanking(actorId: string, input: RankingUpsertInput) { return rpc<string>(client, "hotrank_upsert_ranking", {p_actor_id: actorId, p_clip_id: input.clipId, p_category: input.category, p_rank_position: input.rankPosition, p_trend_direction: input.trendDirection}); },
    deleteRanking(actorId: string, rankingId: string) { return rpc<void>(client, "hotrank_delete_ranking", {p_actor_id: actorId, p_ranking_id: rankingId}); },
  };
}
