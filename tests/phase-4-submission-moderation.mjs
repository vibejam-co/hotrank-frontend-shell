import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const route = read("app/api/hotrank/mutations/route.ts");
const submit = read("components/submit-flow.tsx");
const deterministic = read("lib/hotrank/moderation/deterministic.ts");
const moderation = read("lib/hotrank/moderation/index.ts");
const types = read("lib/hotrank/moderation/types.ts");

assert.match(route, /submissionIntake\(candidate\)/);
assert.match(route, /mutation\.createSubmission\(user\.id/);
assert.match(route, /profileId: user\.id/);
assert.match(route, /SUBMISSION_NEEDS_CHANGES/);
assert.match(submit, /\/api\/hotrank\/mutations/);
assert.match(submit, /rightsConfirmed/);
assert.doesNotMatch(submit, /input:\s*\{[^}]*\bstatus\s*:/s);
for (const rule of ["TITLE_REQUIRED", "SOURCE_URL_VALID", "PLATFORM_SUPPORTED", "CREATOR_ATTRIBUTION_REQUIRED", "CANONICAL_URL_VALID", "RIGHTS_DECLARATION_REQUIRED", "LOCKED_PROMPT_HAS_CONTENT"]) assert.match(deterministic, new RegExp(rule));
assert.match(moderation, /decision: "ESCALATED"/);
assert.match(moderation, /REVIEW_PROVIDER_NOT_CONFIGURED/);
for (const state of ["APPROVED", "NEEDS_CHANGES", "REJECTED", "ESCALATED"]) assert.match(types, new RegExp(state));

console.log("HOTRANK submission and moderation boundary contract passed");
