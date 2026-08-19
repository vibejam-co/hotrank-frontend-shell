import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migrationDir = path.join(root, "supabase", "migrations");
const sql = fs.readdirSync(migrationDir)
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => fs.readFileSync(path.join(migrationDir, file), "utf8"))
  .join("\n");

for (const table of [
  "profiles", "submissions", "creators", "clips", "rankings",
  "follows", "ignites", "saves", "prompt_unlocks",
]) {
  assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  assert.match(sql, new RegExp(`alter table public\\.${table} force row level security`, "i"));
}

assert.match(sql, /create table if not exists private\.admin_users/i);
assert.match(sql, /profiles\.is_admin is legacy state/i);
assert.match(sql, /private\.is_admin_actor\(p_actor_id\)/i);
assert.match(sql, /revoke all privileges on table[\s\S]*from public, anon, authenticated/i);
assert.match(sql, /create view public\.public_submissions/i);

const publicSubmission = sql.match(/create view public\.public_submissions[\s\S]*?where s\.status/s)?.[0] ?? "";
for (const forbidden of ["is_admin", "workflow_notes", "creator_notes", "prompt_price", "ai_stack", "submitter_id", "dodo_payment_id"]) {
  assert.doesNotMatch(publicSubmission, new RegExp(`\\b${forbidden}\\b`, "i"));
}

for (const functionName of [
  "hotrank_update_profile", "hotrank_create_submission", "hotrank_update_submission",
  "hotrank_moderate_submission", "hotrank_claim_creator", "hotrank_save_submission",
  "hotrank_follow_profile", "hotrank_add_ignite", "hotrank_upsert_ranking",
]) {
  assert.match(sql, new RegExp(`create or replace function public\\.${functionName}`, "i"));
}

assert.match(sql, /grant execute on function %s to service_role/i);
assert.match(sql, /revoke all on function %s from public, anon, authenticated/i);
assert.match(sql, /set search_path = pg_catalog/i);
assert.doesNotMatch(sql, /DODO_PAYMENTS_SECRET_KEY|DODO_PAYMENTS_WEBHOOK_SECRET/i);

const services = fs.readFileSync(path.join(root, "lib", "hotrank", "services", "index.ts"), "utf8");
assert.match(services, /fixtureAdapter/);
assert.doesNotMatch(services, /supabase|payment|dodo/i);

console.log("HOTRANK Phase 3B static security-negative tests passed");
