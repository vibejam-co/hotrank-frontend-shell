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

function importedSpecifiers(source) {
  const specifiers = [];
  const patterns = [
    /(?:import|export)\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g,
    /require\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const pattern of patterns) for (const match of source.matchAll(pattern)) specifiers.push(match[1]);
  return specifiers;
}

for (const path of [...filesUnder("app"), ...filesUnder("components")]) {
  const source = read(path);
  const imports = importedSpecifiers(source);
  assert.equal(imports.some((specifier) => /(?:^|[\\/])(?:data|legacy|backend)(?:[\\/]|$)|@\/lib\/data/.test(specifier)), false, `${path} bypasses the domain adapter`);
  assert.equal(imports.some((specifier) => /(?:supabase|@supabase|stripe|dodo|payment|service-role)/i.test(specifier)), false, `${path} imports backend/payment infrastructure`);
  assert.equal(imports.some((specifier) => /(?:HOTRANK-FRONTEND|hotrank-frontend-shell|hotrank-backend|\/Users\/Ira\/Desktop\/HOTRANK)/i.test(specifier)), false, `${path} references a legacy repository`);
  assert.doesNotMatch(source, /\b(?:Database|Tables|SubmissionRow|ProfileRow|RawSubmission|[A-Z]\w*(?:Row|Schema|Table))\b/, `${path} exposes a database-shaped type`);
}

for (const path of filesUnder("lib/hotrank/domain")) {
  const imports = importedSpecifiers(read(path));
  assert.equal(imports.some((specifier) => /^(?:@\/)?(?:app|components)(?:[\\/]|$)|\.\.?[\\/]..*[\\/](?:app|components)(?:[\\/]|$)|\.css$|^\//.test(specifier)), false, `${path} imports presentation concerns`);
}

const domain = read("lib/hotrank/domain/types.ts");
assert.doesNotMatch(domain, /\bany\b|supabase|React|\.css|workflowText/i, "domain contract leaks unsafe/presentation types");
for (const typeName of ["Clip", "Creator", "RankingEntry", "Prompt", "SavedItem", "Submission", "UserProfile", "ActivityItem"]) assert.match(domain, new RegExp(`(?:interface|type)\\s+${typeName}\\b`), `missing domain type ${typeName}`);
for (const ratio of ["9:16", "4:5", "1:1", "16:9", "2:1", "2.39:1"]) assert.match(domain, new RegExp(ratio.replace(".", "\\.")));

const adapterTypes = read("lib/hotrank/adapters/types.ts");
const fixture = read("lib/hotrank/adapters/fixture/index.ts");
assert.match(adapterTypes, /interface HotRankDataAdapter/);
assert.match(fixture, /fixtureAdapter:\s*HotRankDataAdapter/);
assert.match(fixture, /getCreator:\s*\(slug\).*creatorProfile\.creator\.slug\s*===\s*slug/);
assert.doesNotMatch(fixture, /process\.env|import\.meta\.env|supabase|payment|dodo|stripe/i);
assert.match(fixture, /case "2\.39:1"/);
assert.doesNotMatch(fixture, /ratio\s+as\s+Clip\["ratio"\]/);

const services = read("lib/hotrank/services/index.ts");
for (const operation of ["getHomeData", "getRankingsData", "getClipDetail", "getCreatorDirectory", "getCreatorProfile", "getActivityData", "getUserProfile", "getSavedData", "getSavedPromptsData", "getSearchData", "getSubmissionFlowData"]) assert.match(services, new RegExp(`export const ${operation}\\b`), `missing service operation ${operation}`);

// Visual-critical fixture invariants and explicit unknown-slug behavior.
assert.match(fixture, /hero:\s*\{\.\.\.clipFixtures\[0\].*ratio:\s*"2\.39:1"/s);
assert.match(fixture, /workflowLines:\s*\[/);
assert.match(fixture, /getCreator:\s*\(slug\).*\?\s*creatorProfile\s*:\s*null/s);

assert.equal(statSync(join(root, "lib/hotrank/adapters/supabase/README.md")).isFile(), true);
console.log("HOTRANK domain boundary tests passed");
