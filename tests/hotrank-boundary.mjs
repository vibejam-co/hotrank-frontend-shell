import assert from "node:assert/strict";
import {readdirSync, readFileSync, statSync} from "node:fs";
import {join} from "node:path";

const root = new URL("../", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");

function filesUnder(relative) {
  const absolute = join(root, relative);
  return readdirSync(absolute, {withFileTypes: true}).flatMap((entry) => {
    const path = join(relative, entry.name);
    if (entry.isDirectory()) return filesUnder(path);
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

const presentationFiles = [...filesUnder("app"), ...filesUnder("components")];
const presentation = presentationFiles.map((path) => ({path, source: read(path)}));

for (const {path, source} of presentation) {
  assert.doesNotMatch(source, /@\/lib\/data/, `${path} bypasses the domain adapter`);
  assert.doesNotMatch(source, /(?:from\s+["'][^"']*|import\s*\()[^"']*supabase/i, `${path} imports Supabase`);
  assert.doesNotMatch(source, /(?:from\s+["'][^"']*|import\s*\()[^"']*(?:stripe|dodo|payment)/i, `${path} imports payment infrastructure`);
  assert.doesNotMatch(source, /\/Users\/Ira\/Desktop\/(?:HOTRANK|hotrank-frontend-shell)/, `${path} references a legacy repository`);
  assert.doesNotMatch(source, /(?:Database|SubmissionRow|ProfileRow|RawSubmission)\b/, `${path} exposes a database row type`);
}

const domain = read("lib/hotrank/domain/types.ts");
assert.doesNotMatch(domain, /\bany\b/, "domain types contain any");
assert.doesNotMatch(domain, /supabase/i, "domain types mention Supabase");
assert.match(domain, /interface Clip/);
assert.match(domain, /interface Creator/);
assert.match(domain, /interface RankingEntry/);
assert.match(domain, /interface Prompt/);
assert.match(domain, /interface SavedItem/);
assert.match(domain, /interface Submission/);
assert.match(domain, /interface UserProfile/);
assert.match(domain, /interface ActivityItem/);

const fixture = read("lib/hotrank/adapters/fixture/index.ts");
assert.match(fixture, /fixtureAdapter:\s*HotRankDataAdapter/);
assert.doesNotMatch(fixture, /process\.env|import\.meta\.env/);
assert.doesNotMatch(fixture, /supabase|payment|dodo|stripe/i);

const services = read("lib/hotrank/services/index.ts");
for (const operation of ["getHomeData", "getRankingsData", "getClipDetail", "getCreatorDirectory", "getCreatorProfile", "getActivityData", "getUserProfile", "getSavedData", "getSavedPromptsData", "getSearchData", "getSubmissionFlowData"]) {
  assert.match(services, new RegExp(`export const ${operation}\\b`), `missing service operation ${operation}`);
}

assert.equal(statSync(join(root, "lib/hotrank/adapters/supabase/README.md")).isFile(), true);
console.log("HOTRANK domain boundary tests passed");
