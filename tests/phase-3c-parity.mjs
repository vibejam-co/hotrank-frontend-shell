import assert from "node:assert/strict";
import {mapActivity, mapCreators, mapHome, mapRankings, mapSaved, mapSavedPrompts, mapSearch, mapSubmissionFlow} from "../lib/hotrank/adapters/supabase/mapping.ts";

const emptySnapshot = {profiles: [], creators: [], clips: [], rankings: [], submissions: [], followCounts: new Map(), igniteCounts: new Map(), saveCounts: new Map()};
const home = mapHome(emptySnapshot);
assert.equal(home.liveRankings.length, 0);
assert.equal(home.risingNow.length, 0);
assert.equal(home.editorPicks.length, 0);
assert.equal(home.hero.id, "empty-clip");
assert.deepEqual(mapRankings(emptySnapshot), {featured: [], rows: []});
assert.deepEqual(mapActivity().today, []);
assert.deepEqual(mapActivity().earlier, []);
assert.deepEqual(mapSaved(), {savedClips: [], collections: [], prompts: [], followedCreators: []});
assert.deepEqual(mapSavedPrompts().prompts, []);
assert.deepEqual(mapSearch(emptySnapshot), {clips: [], creators: []});
assert.deepEqual(mapSubmissionFlow().platforms, ["YouTube", "TikTok", "Instagram"]);
assert.equal(mapCreators(emptySnapshot).chart.length, 0);

for (const value of [home, mapRankings(emptySnapshot), mapCreators(emptySnapshot), mapActivity(), mapSaved(), mapSavedPrompts(), mapSearch(emptySnapshot), mapSubmissionFlow()]) {
  assert.equal(JSON.stringify(value).includes("submitter_id"), false);
  assert.equal(JSON.stringify(value).includes("dodo"), false);
}

console.log("HOTRANK Phase 3C empty-state/parity contract passed");
