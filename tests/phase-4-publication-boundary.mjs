import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const projection = read("supabase/migrations/20260819050916_isolate_public_data.sql");
const aggregate = read("supabase/migrations/20260819052810_scope_public_interaction_aggregates.sql");
const mapping = read("lib/hotrank/adapters/supabase/mapping.ts");

assert.match(projection, /from public\.submissions as s\s+where s\.status = 'approved'/i);
assert.match(projection, /when s\.prompt_visibility = 'free' then s\.prompt_text/i);
assert.match(projection, /else null/i);
assert.match(aggregate, /where s\.status = 'approved'/i);
for (const privateField of ["creator_notes", "prompt_price", "ai_stack", "workflow_notes", "submitter_id", "dodo_payment_id"]) assert.doesNotMatch(mapping, new RegExp(privateField));
assert.match(mapping, /row\.prompt_visibility !== "free"/);

console.log("HOTRANK publication and prompt privacy boundary contract passed");
