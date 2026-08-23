import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const route = read("app/api/hotrank/mutations/route.ts");
const submit = read("components/submit-flow.tsx");
const deterministic = read("lib/hotrank/moderation/deterministic.ts");
const moderation = read("lib/hotrank/moderation/index.ts");
const types = read("lib/hotrank/moderation/types.ts");
const migration = read("supabase/migrations/20260823000000_moderation_foundation.sql");
const runtime = read("lib/hotrank/runtime.ts");

assert.match(route, /submissionIntake\(candidate\)/);
assert.match(route, /isHotRankSubmissionIntakeOpen\(\)/);
assert.match(route, /SUBMISSIONS_CLOSED/);
assert.match(route, /mutation\.createSubmission\(user\.id/);
assert.match(route, /profileId: user\.id/);
assert.match(route, /SUBMISSION_NEEDS_CHANGES/);
assert.match(submit, /\/api\/hotrank\/mutations/);
assert.match(submit, /rightsConfirmed/);
assert.match(submit, /submissionsOpen/);
assert.match(submit, /Submissions are temporarily closed/);
assert.doesNotMatch(submit, /input:\s*\{[^}]*\bstatus\s*:/s);
assert.match(runtime, /HOTRANK_SUBMISSIONS_OPEN/);
assert.match(runtime, /=== "true"/);
for (const rule of ["TITLE_REQUIRED", "SOURCE_URL_VALID", "PLATFORM_SUPPORTED", "CREATOR_ATTRIBUTION_REQUIRED", "CANONICAL_URL_VALID", "RIGHTS_DECLARATION_REQUIRED", "LOCKED_PROMPT_HAS_CONTENT"]) assert.match(deterministic, new RegExp(rule));
assert.match(moderation, /decision: "ESCALATED"/);
assert.match(moderation, /REVIEW_PROVIDER_NOT_CONFIGURED/);
for (const state of ["APPROVED", "NEEDS_CHANGES", "REJECTED", "ESCALATED"]) assert.match(types, new RegExp(state));
assert.match(route, /moderation-review/);
assert.match(migration, /rights_confirmed/);
assert.match(migration, /submission_moderation_reviews/);
assert.match(migration, /hotrank_record_moderation_review/);
assert.match(migration, /revoke all on function public\.hotrank_record_moderation_review/);

console.log("HOTRANK submission and moderation boundary contract passed");
