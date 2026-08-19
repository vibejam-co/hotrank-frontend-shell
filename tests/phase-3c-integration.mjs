import assert from "node:assert/strict";
import {readFileSync, readdirSync, statSync} from "node:fs";
import {join} from "node:path";

const root = new URL("../", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");
const filesUnder = (path) => readdirSync(join(root, path), {withFileTypes: true}).flatMap((entry) => {
  const child = join(path, entry.name);
  if (entry.isDirectory()) return filesUnder(child);
  return statSync(join(root, child)).isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name) ? [child] : [];
});

const runtime = read("lib/hotrank/runtime.ts");
assert.match(runtime, /csuejshnycgbfvtjbxoq/g, "the exact HOTRANK project ref is not pinned");
assert.match(runtime, /HOTRANK_BACKEND_MODE/, "backend mode is not explicit");
assert.match(runtime, /return "fixture"/, "fixture mode is not the safe default");
assert.match(runtime, /SUPABASE_SERVICE_ROLE_KEY/, "server mutation secret contract is missing");
assert.doesNotMatch(read("lib/supabase/client.ts"), /SERVICE_ROLE|ACCESS_TOKEN|MANAGEMENT|DODO/i, "browser client contains a forbidden secret name");

const adapter = read("lib/hotrank/adapters/supabase/index.ts");
for (const view of ["public_profiles", "public_creators", "public_clips", "public_rankings", "public_submissions", "public_follow_counts", "public_ignite_counts", "public_save_counts"]) {
  assert.match(adapter, new RegExp(view), `${view} is not consumed by the adapter`);
}
assert.doesNotMatch(adapter, /\.from\("(?:profiles|submissions|creators|clips|rankings|follows|ignites|saves|prompt_unlocks)"\)/, "the public adapter reads a protected base table");

const mutation = read("lib/hotrank/adapters/supabase/mutations.ts");
for (const rpc of ["hotrank_update_profile", "hotrank_create_submission", "hotrank_claim_creator", "hotrank_save_submission", "hotrank_follow_profile", "hotrank_add_ignite", "hotrank_moderate_submission", "hotrank_upsert_ranking"]) assert.match(mutation, new RegExp(rpc), `${rpc} is not connected`);
assert.doesNotMatch(mutation, /\.from\(/, "the mutation adapter bypasses the protected RPC boundary");
assert.match(read("app/api/hotrank/mutations/route.ts"), /requireCurrentHotRankUser/);
assert.match(read("app/api/hotrank/mutations/route.ts"), /createSupabaseServiceClient/);

const clientFiles = [...filesUnder("app"), ...filesUnder("components"), "lib/supabase/client.ts"];
for (const file of clientFiles) {
  const source = read(file);
  assert.doesNotMatch(source, /SUPABASE_ACCESS_TOKEN|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY|DODO_PAYMENTS|MANAGEMENT_API/i, `${file} exposes a forbidden runtime secret`);
  if (/^"use client"|^'use client'/m.test(source)) assert.doesNotMatch(source, /@\/lib\/(supabase\/server|supabase\/service|hotrank\/adapters\/supabase|hotrank\/services\/server)/, `${file} imports a server-only HOTRANK module`);
}

const projections = read("supabase/migrations/20260819050916_isolate_public_data.sql");
assert.match(projections, /case\s+when s\.prompt_visibility = 'free' then s\.prompt_text\s+else null/i, "private prompt text is not masked at the projection");
for (const field of ["submitter_id", "creator_notes", "prompt_price", "ai_stack", "workflow_notes", "payment_history", "dodo_payment_id"]) assert.doesNotMatch(read("lib/hotrank/adapters/supabase/mapping.ts"), new RegExp(field), "private submission field leaked into the domain mapper");
assert.match(read("lib/hotrank/adapters/supabase/mapping.ts"), /prompt_visibility !== "free"/);

console.log("HOTRANK Phase 3C integration/security contract passed");
