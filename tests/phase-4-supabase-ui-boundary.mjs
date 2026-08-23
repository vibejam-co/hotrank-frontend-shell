import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [
  "app/page.tsx",
  "app/rankings/page.tsx",
  "app/creators/page.tsx",
  "app/creators/[slug]/page.tsx",
  "app/clips/[id]/page.tsx",
  "app/activity/page.tsx",
  "app/search/page.tsx",
  "app/saved/prompts/page.tsx",
  "components/cards.tsx",
  "components/clip-detail.tsx",
  "components/search-surface.tsx",
];
const forbidden = /(?:getHomeData|getRankingsData|getCreatorDirectory|getActivityData|getClipDetail|getSearchData|getSavedPromptsData)\s*\(/;

for (const relative of files) {
  const source = fs.readFileSync(path.join(root, relative), "utf8");
  assert.doesNotMatch(source, forbidden, `${relative} must not call a fixture service getter`);
}

for (const relative of files.slice(0, 8)) {
  const source = fs.readFileSync(path.join(root, relative), "utf8");
  assert.match(source, /readServerHotRank\(/, `${relative} must read through the canonical server adapter`);
  assert.match(source, /export const dynamic = "force-dynamic"/, `${relative} must not freeze fixture output at build time`);
}

assert.match(fs.readFileSync(path.join(root, "app/submit/page.tsx"), "utf8"), /export const dynamic = "force-dynamic"/, "submission gate must be evaluated at request time");

console.log("phase-4 Supabase UI boundary: PASS");
