import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const profile = read("app/profile/page.tsx");
const profileView = read("components/profile-view.tsx");
const profileActions = read("components/profile-actions.tsx");
const saved = read("app/saved/page.tsx");
const savedView = read("components/saved-view.tsx");
const mapping = read("lib/hotrank/adapters/supabase/mapping.ts");
const server = read("lib/hotrank/services/server.ts");

assert.match(profileView, /\/api\/hotrank\/read\?resource=profile/);
assert.doesNotMatch(profile, /getUserProfile|Lena Marlowe|user-lena-marlowe/);
assert.doesNotMatch(profileView, /Lena Marlowe|Frontend demo state only/);
assert.doesNotMatch(profileActions, /Lena Marlowe|Frontend demo state only|defaultValue/);
assert.match(profileActions, /action: "update-profile"/);
assert.match(profileActions, /\/api\/hotrank\/mutations/);
assert.match(savedView, /\/api\/hotrank\/read\?resource=saved/);
assert.doesNotMatch(saved, /getSavedData|432 saved items|saved-horizon/);
assert.match(mapping, /snapshot\.profiles\.find\(\(row\) => row\.id === userId\)/);
assert.match(mapping, /identity\?\.email\?\.split\("@"\)\[0\]/);
assert.match(server, /client\.auth\.getUser\(\)/);
assert.match(server, /createSupabaseAdapter\(client/);

console.log("HOTRANK real profile boundary contract passed");
