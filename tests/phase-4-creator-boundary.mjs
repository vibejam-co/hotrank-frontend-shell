import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const route = read("app/api/hotrank/mutations/route.ts");
const mutations = read("lib/hotrank/adapters/supabase/mutations.ts");
const sql = read("supabase/migrations/20260819050917_establish_server_write_boundary.sql");

assert.match(route, /case "claim-creator"/);
assert.match(route, /mutation\.claimCreator\(user\.id/);
assert.match(mutations, /hotrank_claim_creator/);
assert.match(sql, /where id = p_creator_id\s+and \(user_id is null or private\.is_admin_actor\(p_actor_id\)\)/i);
assert.doesNotMatch(route, /creatorId:\s*user\.id/);

console.log("HOTRANK creator identity boundary contract passed");
