import {NextResponse} from "next/server";
import {createMutationAdapter} from "@/lib/hotrank/adapters/supabase/mutations";
import type {InteractionInput, ModerationInput, ModerationReviewInput, ProfileUpdateInput, RankingUpsertInput, SubmissionCreateInput, SubmissionUpdateInput} from "@/lib/hotrank/domain/mutations";
import {createSupabaseServiceClient} from "@/lib/supabase/service";
import {requireCurrentHotRankUser} from "@/lib/hotrank/server/auth";
import {getHotRankBackendMode, HotRankConfigurationError, isHotRankSubmissionIntakeOpen} from "@/lib/hotrank/runtime";
import {submissionIntake} from "@/lib/hotrank/moderation";

export const dynamic = "force-dynamic";

type MutationBody = {action?: unknown; input?: unknown};
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const isUuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const requireId = (value: unknown, label: string) => { if (!isUuid(value)) throw new Error(`Invalid ${label}`); return value; };
const requireText = (value: unknown, label: string) => { if (typeof value !== "string" || !value.trim()) throw new Error(`Invalid ${label}`); return value.trim(); };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as MutationBody | null;
  const action = typeof body?.action === "string" ? body.action : "";
  if (!isObject(body?.input)) return NextResponse.json({error: "Mutation input is required"}, {status: 400});
  try {
    if (getHotRankBackendMode() !== "supabase") return NextResponse.json({error: "Supabase mutations require explicit Supabase mode"}, {status: 503});
    if (action === "create-submission" && !isHotRankSubmissionIntakeOpen()) return NextResponse.json({error: "Submissions are temporarily closed while review automation is being activated", code: "SUBMISSIONS_CLOSED"}, {status: 503, headers: {"Cache-Control": "no-store"}});
    const user = await requireCurrentHotRankUser();
    const mutation = createMutationAdapter(createSupabaseServiceClient());
    const input = body.input;
    switch (action) {
      case "update-profile": await mutation.updateProfile(user.id, {...input, profileId: user.id, username: requireText(input.username, "username"), displayName: requireText(input.displayName, "displayName"), handle: requireText(input.handle, "handle"), avatarUrl: typeof input.avatarUrl === "string" ? input.avatarUrl : "", bio: typeof input.bio === "string" ? input.bio : "", links: Array.isArray(input.links) && input.links.every((item) => typeof item === "string") ? input.links as string[] : []} as ProfileUpdateInput); break;
      case "create-submission": {
        const candidate = {
          sourceUrl: requireText(input.sourceUrl, "sourceUrl"),
          title: requireText(input.title, "title"),
          platform: requireText(input.platform, "platform"),
          creatorHandle: requireText(input.creatorHandle, "creatorHandle"),
          canonicalUrl: requireText(input.canonicalUrl, "canonicalUrl"),
          rightsConfirmed: input.rightsConfirmed === true,
          promptVisibility: typeof input.promptVisibility === "string" ? input.promptVisibility as "free" | "locked" | "private" : "free",
          promptText: typeof input.promptText === "string" ? input.promptText : "",
        };
        const intake = submissionIntake(candidate);
        if (!intake.ok) return NextResponse.json({error: "Submission needs changes", code: "SUBMISSION_NEEDS_CHANGES", reasons: intake.reasons}, {status: 422});
        await mutation.createSubmission(user.id, {...input, ...candidate} as SubmissionCreateInput);
        break;
      }
      case "update-submission": await mutation.updateSubmission(user.id, {...input, submissionId: requireId(input.submissionId, "submissionId"), sourceUrl: typeof input.sourceUrl === "string" ? input.sourceUrl : "", title: requireText(input.title, "title")} as SubmissionUpdateInput); break;
      case "claim-creator": await mutation.claimCreator(user.id, requireId(input.creatorId, "creatorId")); break;
      case "save": await mutation.save(user.id, {submissionId: requireId(input.submissionId, "submissionId")}); break;
      case "remove-save": await mutation.removeSave(user.id, {submissionId: requireId(input.submissionId, "submissionId")}); break;
      case "follow": await mutation.follow(user.id, {followingId: requireId(input.followingId, "followingId")}); break;
      case "unfollow": await mutation.unfollow(user.id, {followingId: requireId(input.followingId, "followingId")}); break;
      case "ignite": await mutation.ignite(user.id, {submissionId: requireId(input.submissionId, "submissionId")}); break;
      case "remove-ignite": await mutation.removeIgnite(user.id, {submissionId: requireId(input.submissionId, "submissionId")}); break;
      case "moderate": if (!isUuid(input.submissionId) || !["pending", "approved", "rejected", "archived"].includes(String(input.status))) throw new Error("Invalid moderation input"); await mutation.moderate(user.id, input as unknown as ModerationInput); break;
      case "moderation-review": {
        const decisions = ["APPROVED", "NEEDS_CHANGES", "REJECTED", "ESCALATED"];
        const methods = ["deterministic", "review_agent", "independent_adjudicator"];
        if (!isUuid(input.submissionId) || !decisions.includes(String(input.decision)) || !methods.includes(String(input.reviewMethod)) || typeof input.reviewRulesetVersion !== "string" || !Array.isArray(input.mechanicalChecks) || !Array.isArray(input.reasonCodes) || !input.reasonCodes.every((item) => typeof item === "string")) throw new Error("Invalid moderation review input");
        await mutation.recordModerationReview(user.id, {...input, submissionId: input.submissionId, decision: input.decision, reviewRulesetVersion: input.reviewRulesetVersion, reviewMethod: input.reviewMethod, mechanicalChecks: input.mechanicalChecks, reasonCodes: input.reasonCodes} as unknown as ModerationReviewInput);
        break;
      }
      case "upsert-ranking": if (!isUuid(input.clipId) || typeof input.category !== "string" || typeof input.rankPosition !== "number" || !Number.isInteger(input.rankPosition) || input.rankPosition < 1 || typeof input.trendDirection !== "string") throw new Error("Invalid ranking input"); await mutation.upsertRanking(user.id, input as unknown as RankingUpsertInput); break;
      case "delete-ranking": await mutation.deleteRanking(user.id, requireId(input.rankingId, "rankingId")); break;
      default: return NextResponse.json({error: "Unsupported mutation"}, {status: 400});
    }
    return NextResponse.json({ok: true}, {headers: {"Cache-Control": "private, no-store"}});
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Mutation failed";
    if (error instanceof HotRankConfigurationError) return NextResponse.json({error: "HOTRANK backend is not configured"}, {status: 503});
    const status = message === "Authentication required" ? 401 : 400;
    return NextResponse.json({error: status === 401 ? message : "Mutation rejected"}, {status});
  }
}
