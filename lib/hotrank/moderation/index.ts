import type {IndependentAdjudicator, ModerationAssessment, ModerationReviewAgent, SubmissionReviewInput} from "@/lib/hotrank/moderation/types";
import {MODERATION_RULESET_VERSION, runDeterministicChecks, validateSubmissionForIntake} from "@/lib/hotrank/moderation/deterministic";

export * from "@/lib/hotrank/moderation/deterministic";
export * from "@/lib/hotrank/moderation/types";

export async function reviewSubmission(input: SubmissionReviewInput, reviewAgent?: ModerationReviewAgent, adjudicator?: IndependentAdjudicator): Promise<ModerationAssessment> {
  const checks = runDeterministicChecks(input);
  if (checks.some((item) => !item.passed)) {
    return {decision: "NEEDS_CHANGES", rulesetVersion: MODERATION_RULESET_VERSION, reviewMethod: "deterministic", mechanicalChecks: checks, reasonCodes: checks.filter((item) => !item.passed).map((item) => item.code)};
  }
  if (!reviewAgent) {
    return {decision: "ESCALATED", rulesetVersion: MODERATION_RULESET_VERSION, reviewMethod: "review_agent", mechanicalChecks: checks, reasonCodes: ["REVIEW_PROVIDER_NOT_CONFIGURED"]};
  }
  const assessment = await reviewAgent.review(input, checks);
  if (assessment.decision !== "ESCALATED" || !adjudicator) return assessment;
  return adjudicator.adjudicate(input, assessment);
}

export function submissionIntake(input: SubmissionReviewInput) {
  return validateSubmissionForIntake(input);
}
