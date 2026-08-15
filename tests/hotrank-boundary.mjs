import assert from "node:assert/strict";
import {existsSync, readdirSync, readFileSync} from "node:fs";
import {dirname, extname, join, normalize, relative, resolve} from "node:path";

const root = resolve(new URL("../", import.meta.url).pathname);
const read = (path) => readFileSync(join(root, path), "utf8");
const sourceExtensions = [".ts", ".tsx", ".js", ".jsx"];

function filesUnder(relativePath) {
  const absolute = join(root, relativePath);
  return readdirSync(absolute, {withFileTypes: true}).flatMap((entry) => {
    const path = join(relativePath, entry.name);
    if (entry.isDirectory()) return filesUnder(path);
    return sourceExtensions.includes(extname(entry.name)) ? [path] : [];
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

function resolveImport(specifier, sourcePath) {
  if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return null;
  const base = specifier.startsWith("@/") ? join(root, specifier.slice(2)) : resolve(dirname(join(root, sourcePath)), specifier);
  const candidates = [base, ...sourceExtensions.map((extension) => `${base}${extension}`), ...sourceExtensions.map((extension) => join(base, `index${extension}`))];
  return candidates.find((candidate) => existsSync(candidate)) || null;
}

function relativeSourcePath(path) {
  return normalize(relative(root, path));
}

function categoryFor(specifier, resolvedPath) {
  const value = `${specifier} ${resolvedPath ? relativeSourcePath(resolvedPath) : ""}`.toLowerCase();
  if (/(?:@supabase|supabase|service[-_ ]role|webhook)/.test(value)) return "supabase/privileged";
  if (/(?:stripe|dodo|payment)/.test(value)) return "payment";
  if (/(?:^|[\\/])(?:data|legacy|backend|database|db|schema|generated|api|server)(?:[\\/]|$)/.test(value) || value.includes("hotrank-backend") || value.includes("hotrank-frontend")) return "legacy/database";
  if (/(?:^|[\\/])(?:app|components)(?:[\\/]|$)|\.css$|(?:^|[\\/])public(?:[\\/]|$)|(?:^|@)react(?:[-/]|$)/.test(value)) return "presentation";
  return null;
}

function scanImports(source, sourcePath, boundary) {
  return importedSpecifiers(source).flatMap((specifier) => {
    const resolvedPath = resolveImport(specifier, sourcePath);
    const category = categoryFor(specifier, resolvedPath);
    const forbidden = boundary === "presentation"
      ? ["supabase/privileged", "payment", "legacy/database"]
      : ["presentation"];
    return category && forbidden.includes(category) ? [{specifier, resolvedPath, category}] : [];
  });
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
}

function rowLeakages(source) {
  const code = stripComments(source);
  const declarationCode = code.replace(/(['"])(?:\\.|(?!\1).)*\1/g, "");
  const leakPattern = /\b(?:Database|Tables?|[A-Z][A-Za-z0-9]*(?:Rows?|Schemas?|Tables?))\b/;
  const findings = [];
  for (const match of declarationCode.matchAll(/\b(?:export\s+)?(?:interface|type|class|enum)\s+([A-Za-z0-9_]+)/g)) {
    const declaration = declarationCode.slice(match.index, match.index + 1400);
    if (leakPattern.test(match[1]) || leakPattern.test(declaration)) findings.push({kind: "declaration", name: match[1]});
  }
  for (const match of code.matchAll(/\bimport\s+(?:type\s+)?\{([^}]+)\}\s*from\s*["']([^"']+)["']/g)) {
    if (leakPattern.test(match[1]) || /(?:database|schema|supabase|postgrest|generated)/i.test(match[2])) findings.push({kind: "import", source: match[2]});
  }
  return findings;
}

function scanSource(source, sourcePath, boundary) {
  return {imports: scanImports(source, sourcePath, boundary), rows: rowLeakages(source)};
}

const presentationFiles = [...filesUnder("app"), ...filesUnder("components")];
for (const path of presentationFiles) {
  const findings = scanSource(read(path), path, "presentation");
  assert.deepEqual(findings.imports, [], `${path} crosses a forbidden presentation boundary`);
  assert.deepEqual(findings.rows, [], `${path} exposes a database-shaped public type`);
}

const domainFiles = filesUnder("lib/hotrank/domain");
const publicContractFiles = [...domainFiles, "lib/hotrank/adapters/types.ts"];
for (const path of publicContractFiles) {
  const findings = scanSource(read(path), path, "domain");
  assert.deepEqual(findings.imports, [], `${path} imports presentation concerns`);
  assert.deepEqual(findings.rows, [], `${path} exposes a database-shaped public type`);
}

// Negative tests prove the guard catches the intended bypass classes without
// adding forbidden files to the production source tree.
const negativeCases = [
  ["relative backend import", "app/example.tsx", 'import client from "../lib/backend/client";', "legacy/database"],
  ["alias backend import", "app/example.tsx", 'import client from "@/lib/supabase/client";', "supabase/privileged"],
  ["payment import", "components/example.tsx", 'const payment = require("stripe");', "payment"],
  ["domain component import", "lib/hotrank/domain/example.ts", 'import Card from "../../../components/cards";', "presentation"],
];
for (const [name, path, source, expected] of negativeCases) {
  const findings = scanSource(source, path, path.startsWith("lib/") ? "domain" : "presentation").imports;
  assert.equal(findings.some((finding) => finding.category === expected), true, `${name} bypass was not detected`);
}
assert.equal(rowLeakages("export interface ClipRow { id: string }" ).length > 0, true, "row declaration negative case was not detected");
assert.equal(rowLeakages('import type { Database } from "@/lib/db/types"; export type Profile = Database["public"];').length > 0, true, "database import negative case was not detected");
assert.equal(rowLeakages('import { ClipRow } from "@/lib/query/types";').length > 0, true, "ordinary row import negative case was not detected");

const domain = read("lib/hotrank/domain/types.ts");
assert.doesNotMatch(domain, /\bany\b|supabase|React|\.css|workflowText/i, "domain contract leaks unsafe/presentation types");
for (const typeName of ["Clip", "Creator", "RankingEntry", "Prompt", "SavedItem", "Submission", "UserProfile", "ActivityItem"]) assert.match(domain, new RegExp(`(?:interface|type)\\s+${typeName}\\b`), `missing domain type ${typeName}`);
for (const ratio of ["9:16", "4:5", "1:1", "16:9", "2:1", "2.39:1"]) assert.match(domain, new RegExp(ratio.replace(".", "\\.")));

const adapterTypes = read("lib/hotrank/adapters/types.ts");
const fixture = read("lib/hotrank/adapters/fixture/index.ts");
assert.match(adapterTypes, /interface HotRankDataAdapter/);
assert.match(fixture, /fixtureAdapter:\s*HotRankDataAdapter/);
assert.doesNotMatch(fixture, /process\.env|import\.meta\.env|supabase|payment|dodo|stripe/i);
assert.match(fixture, /case "2\.39:1"/);
assert.doesNotMatch(fixture, /ratio\s+as\s+Clip\["ratio"\]/);

const services = read("lib/hotrank/services/index.ts");
for (const operation of ["getHomeData", "getRankingsData", "getClipDetail", "getCreatorDirectory", "getCreatorProfile", "getActivityData", "getUserProfile", "getSavedData", "getSavedPromptsData", "getSearchData", "getSubmissionFlowData"]) assert.match(services, new RegExp(`export const ${operation}\\b`), `missing service operation ${operation}`);

console.log("HOTRANK architecture boundary tests passed");
