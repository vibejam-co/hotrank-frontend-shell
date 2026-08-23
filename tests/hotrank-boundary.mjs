import assert from "node:assert/strict";
import {existsSync, readdirSync, readFileSync, statSync} from "node:fs";
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

function sourceExists(path, virtualSources) {
  return (existsSync(path) && statSync(path).isFile()) || virtualSources?.has(relativeSourcePath(path));
}

function sourceText(path, virtualSources) {
  return virtualSources?.get(relativeSourcePath(path)) ?? read(relativeSourcePath(path));
}

function resolveImport(specifier, sourcePath, virtualSources) {
  if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return null;
  const base = specifier.startsWith("@/") ? join(root, specifier.slice(2)) : resolve(dirname(join(root, sourcePath)), specifier);
  const candidates = [base, ...sourceExtensions.map((extension) => `${base}${extension}`), ...sourceExtensions.map((extension) => join(base, `index${extension}`))];
  return candidates.find((candidate) => sourceExists(candidate, virtualSources)) || null;
}

function relativeSourcePath(path) {
  return normalize(relative(root, path));
}

function canonicalModulePath(path) {
  const normalizedPath = normalize(path).replaceAll("\\", "/");
  const extension = extname(normalizedPath).toLowerCase();
  return sourceExtensions.includes(extension)
    ? normalizedPath.slice(0, -extension.length)
    : normalizedPath;
}

function categoryFor(specifier, resolvedPath) {
  const value = `${canonicalModulePath(specifier)} ${resolvedPath ? canonicalModulePath(relativeSourcePath(resolvedPath)) : ""}`.toLowerCase();
  if (/(?:@supabase|supabase|service[-_ ]role|webhook)/.test(value)) return "supabase/privileged";
  if (/(?:stripe|dodo|payment)/.test(value)) return "payment";
  if (/(?:^|[\\/])(?:data|legacy|backend|database|db|schema|generated|api|server)(?:[\\/]|$)/.test(value) || value.includes("hotrank-backend") || value.includes("hotrank-frontend")) return "legacy/database";
  if (/(?:^|[\\/])(?:app|components)(?:[\\/]|$)|\.css$|(?:^|[\\/])public(?:[\\/]|$)|(?:^|@)react(?:[-/]|$)/.test(value)) return "presentation";
  return null;
}

function approvedFixtureDataEdge(sourcePath, resolvedPath) {
  return sourcePath.startsWith("lib/hotrank/adapters/fixture/") && relativeSourcePath(resolvedPath) === "lib/data.ts";
}

function approvedServerAdapterEdge(sourcePath, resolvedPath) {
  return (sourcePath.startsWith("app/") || sourcePath.startsWith("components/"))
    && relativeSourcePath(resolvedPath) === "lib/hotrank/services/server.ts";
}

function scanImports(source, sourcePath, boundary, virtualSources) {
  const forbidden = boundary === "presentation"
    ? ["supabase/privileged", "payment", "legacy/database"]
    : ["presentation"];
  const findings = [];
  const visited = new Set();
  const visiting = new Set();

  function walk(currentSource, currentPath, chain) {
    const normalizedPath = normalize(currentPath);
    if (visiting.has(normalizedPath) || visited.has(normalizedPath)) return;
    visiting.add(normalizedPath);
    for (const specifier of importedSpecifiers(currentSource)) {
      const resolvedPath = resolveImport(specifier, normalizedPath, virtualSources);
      const resolvedSourcePath = resolvedPath ? relativeSourcePath(resolvedPath) : null;
      if (resolvedPath && approvedServerAdapterEdge(normalizedPath, resolvedPath)) continue;
      const category = resolvedPath && approvedFixtureDataEdge(normalizedPath, resolvedPath)
        ? null
        : categoryFor(specifier, resolvedPath);
      const nextChain = [...chain, normalizedPath, resolvedSourcePath || specifier];
      if (category && forbidden.includes(category)) {
        findings.push({specifier, resolvedPath, category, chain: nextChain});
        continue;
      }
      if (resolvedPath) walk(sourceText(resolvedPath, virtualSources), resolvedSourcePath, nextChain);
    }
    visiting.delete(normalizedPath);
    visited.add(normalizedPath);
  }

  walk(source, sourcePath, []);
  return findings;
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

function scanSource(source, sourcePath, boundary, virtualSources) {
  return {imports: scanImports(source, sourcePath, boundary, virtualSources), rows: rowLeakages(source)};
}

const presentationFiles = [
  ...filesUnder("app").filter((path) => !path.startsWith("app/api/") && !path.startsWith("app/auth/")),
  ...filesUnder("components"),
];
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

function virtualSources(entries) {
  return new Map(Object.entries(entries));
}

function assertGraphViolation(name, entries, expectedCategory) {
  const sourcePath = "app/example.tsx";
  const findings = scanSource(entries[sourcePath], sourcePath, "presentation", virtualSources(entries)).imports;
  assert.equal(findings.some((finding) => finding.category === expectedCategory), true, `${name} was not detected`);
  assert.equal(findings.some((finding) => finding.chain?.length > 2), true, `${name} did not report a dependency chain`);
}

function assertDirectViolation(name, entries, expectedCategory) {
  const sourcePath = "app/example.tsx";
  const findings = scanSource(entries[sourcePath], sourcePath, "presentation", virtualSources(entries)).imports;
  assert.equal(findings.some((finding) => finding.category === expectedCategory), true, `${name} was not detected`);
}

assertGraphViolation("single re-export negative", {
  "app/example.tsx": 'import {client} from "../lib/safe-barrel";',
  "lib/safe-barrel.ts": 'export * from "./supabase/client";',
  "lib/supabase/client.ts": "export const client = {};",
}, "supabase/privileged");
assertGraphViolation("multi-hop transitive negative", {
  "app/example.tsx": 'import {run} from "../lib/helper-a";',
  "lib/helper-a.ts": 'export {run} from "./helper-b";',
  "lib/helper-b.ts": 'export {run} from "./payments/server";',
  "lib/payments/server.ts": "export const run = () => {};",
}, "payment");
assertGraphViolation("alias re-export negative", {
  "app/example.tsx": 'import {client} from "@/lib/safe";',
  "lib/safe.ts": 'export * from "@/lib/backend/client";',
  "lib/backend/client.ts": "export const client = {};",
}, "legacy/database");
assertGraphViolation("relative re-export negative", {
  "app/example.tsx": 'import {client} from "../lib/safe";',
  "lib/safe.ts": 'export {client} from "./backend/client";',
  "lib/backend/client.ts": "export const client = {};",
}, "legacy/database");
assertGraphViolation("cyclic graph negative", {
  "app/example.tsx": 'import {a} from "../lib/cycle-a";',
  "lib/cycle-a.ts": 'export {b} from "./cycle-b";',
  "lib/cycle-b.ts": 'export {c} from "./cycle-c";',
  "lib/cycle-c.ts": 'export {a} from "./cycle-a"; export {client} from "./backend/client";',
  "lib/backend/client.ts": "export const client = {};",
}, "legacy/database");
assertDirectViolation("relative explicit backend negative", {
  "app/example.tsx": 'import client from "../lib/backend.ts";',
  "lib/backend.ts": "export const client = {};",
}, "legacy/database");
assertDirectViolation("relative explicit data negative", {
  "app/example.tsx": 'import rows from "../lib/data.ts";',
  "lib/data.ts": "export default [];",
}, "legacy/database");
assertDirectViolation("alias explicit backend negative", {
  "app/example.tsx": 'import client from "@/lib/backend.ts";',
  "lib/backend.ts": "export const client = {};",
}, "legacy/database");
assertDirectViolation("alias explicit data negative", {
  "app/example.tsx": 'import rows from "@/lib/data.ts";',
  "lib/data.ts": "export default [];",
}, "legacy/database");
assertGraphViolation("explicit star re-export negative", {
  "app/example.tsx": 'import {client} from "../lib/safe-barrel";',
  "lib/safe-barrel.ts": 'export * from "./backend.ts";',
  "lib/backend.ts": "export const client = {};",
}, "legacy/database");
assertGraphViolation("explicit named re-export negative", {
  "app/example.tsx": 'import {client} from "../lib/safe-barrel";',
  "lib/safe-barrel.ts": 'export {client} from "./backend.ts";',
  "lib/backend.ts": "export const client = {};",
}, "legacy/database");
assertGraphViolation("explicit multi-hop negative", {
  "app/example.tsx": 'import {run} from "../lib/safe-a.ts";',
  "lib/safe-a.ts": 'export {run} from "./safe-b.ts";',
  "lib/safe-b.ts": 'export {run} from "./backend.ts";',
  "lib/backend.ts": "export const run = () => {};",
}, "legacy/database");
assertGraphViolation("explicit alias multi-hop negative", {
  "app/example.tsx": 'import {run} from "@/lib/safe-a.ts";',
  "lib/safe-a.ts": 'export {run} from "@/lib/safe-b.ts";',
  "lib/safe-b.ts": 'export {run} from "@/lib/backend.ts";',
  "lib/backend.ts": "export const run = () => {};",
}, "legacy/database");
for (const extension of sourceExtensions) {
  assertDirectViolation(`explicit ${extension} extension negative`, {
    "app/example.tsx": `import client from "../lib/backend${extension}";`,
    [`lib/backend${extension}`]: "export const client = {};",
  }, "legacy/database");
}

const cleanGraph = virtualSources({
  "app/example.tsx": 'import {getHomeData} from "@/lib/hotrank/services/index.ts";',
  "lib/hotrank/services/index.ts": 'import {fixtureAdapter} from "@/lib/hotrank/adapters/fixture/index.ts"; export const getHomeData = () => fixtureAdapter.getHome();',
  "lib/hotrank/adapters/fixture/index.ts": 'import {rows} from "../../../data.ts"; import type {HotRankDataAdapter} from "../types.ts"; export const fixtureAdapter = {getHome: () => rows} as HotRankDataAdapter;',
  "lib/hotrank/adapters/types.ts": 'import type {HomeData} from "@/lib/hotrank/domain/types.ts"; export interface HotRankDataAdapter {getHome(): HomeData;}',
  "lib/hotrank/domain/types.ts": "export type HomeData = {hero: string};",
  "lib/data.ts": "export const rows = [];",
});
assert.deepEqual(scanSource(cleanGraph.get("app/example.tsx"), "app/example.tsx", "presentation", cleanGraph).imports, [], "clean multi-hop graph was rejected");
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
