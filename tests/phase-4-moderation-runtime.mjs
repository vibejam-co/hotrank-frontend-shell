import assert from "node:assert/strict";
import {reviewSubmission} from "../lib/hotrank/moderation/index.ts";

const validSubmission = {
  title: "A valid HOTRANK submission",
  sourceUrl: "https://www.youtube.com/watch?v=example",
  platform: "YouTube",
  creatorHandle: "creator",
  canonicalUrl: "https://creator.example/work",
  rightsConfirmed: true,
  promptVisibility: "private",
  promptText: "Private prompt text",
};

const needsChanges = await reviewSubmission({...validSubmission, rightsConfirmed: false});
assert.equal(needsChanges.decision, "NEEDS_CHANGES");
assert.equal(needsChanges.reviewMethod, "deterministic");
assert.ok(needsChanges.reasonCodes.includes("RIGHTS_DECLARATION_REQUIRED"));

const providerMissing = await reviewSubmission(validSubmission);
assert.equal(providerMissing.decision, "ESCALATED");
assert.equal(providerMissing.reviewMethod, "review_agent");
assert.deepEqual(providerMissing.reasonCodes, ["REVIEW_PROVIDER_NOT_CONFIGURED"]);

const approved = await reviewSubmission(validSubmission, {
  async review(input, checks) {
    return {decision: "APPROVED", rulesetVersion: "provider-v1", reviewMethod: "review_agent", mechanicalChecks: checks, reasonCodes: [], confidence: 0.98, reviewedAt: "2026-08-23T00:00:00.000Z"};
  },
});
assert.equal(approved.decision, "APPROVED");

const adjudicated = await reviewSubmission(validSubmission, {
  async review(input, checks) {
    return {decision: "ESCALATED", rulesetVersion: "provider-v1", reviewMethod: "review_agent", mechanicalChecks: checks, reasonCodes: ["BORDERLINE"], confidence: 0.42};
  },
}, {
  async adjudicate(input, prior) {
    assert.equal(prior.decision, "ESCALATED");
    return {...prior, decision: "REJECTED", reviewMethod: "independent_adjudicator", reasonCodes: ["RIGHTS_CONTEXT_UNCLEAR"]};
  },
});
assert.equal(adjudicated.decision, "REJECTED");
assert.equal(adjudicated.reviewMethod, "independent_adjudicator");

console.log("HOTRANK moderation runtime contract passed");
