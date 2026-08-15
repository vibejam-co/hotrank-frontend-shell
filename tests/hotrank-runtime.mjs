import assert from "node:assert/strict";
import {fixtureAdapter} from "../lib/hotrank/adapters/fixture/index.ts";

const home = fixtureAdapter.getHome();
assert.equal(home.hero.ratio, "2.39:1");
assert.equal(home.liveRankings.length > 0, true);

const rankings = fixtureAdapter.getRankings();
assert.equal(rankings.featured.length > 0, true);
assert.equal(typeof rankings.rows[0].clip.creator.slug, "string");

const portrait = fixtureAdapter.getClipDetail("last-horizon", false);
assert.equal(portrait.ratio, "9:16");
assert.deepEqual(portrait.workflowLines?.length, 4);

const adara = fixtureAdapter.getCreator("adara-voss");
assert.equal(adara?.creator.slug, "adara-voss");
assert.equal(fixtureAdapter.getCreator("missing-creator"), null);

const search = fixtureAdapter.getSearch();
assert.equal(search.clips.length > 0, true);
assert.equal(search.creators.length > 0, true);

const profile = fixtureAdapter.getProfile();
assert.equal(profile.id, "user-lena-marlowe");
const activity = fixtureAdapter.getActivity();
assert.equal(activity.today.length > 0, true);

console.log("HOTRANK runtime adapter contract passed");
