import assert from "node:assert/strict";
import {
  getActivityData,
  getCreatorDirectory,
  getCreatorProfile,
  getClipDetail,
  getHomeData,
  getRankingsData,
  getSavedData,
  getSavedPromptsData,
  getSearchData,
  getSubmissionFlowData,
  getUserProfile,
} from "../lib/hotrank/services/index.ts";

const home = getHomeData();
assert.equal(home.hero.ratio, "2.39:1");
assert.equal(home.liveRankings.length > 0, true);

const rankings = getRankingsData();
assert.equal(rankings.featured.length > 0, true);
assert.equal(typeof rankings.rows[0].clip.creator.slug, "string");

const portrait = getClipDetail("last-horizon", false);
assert.equal(portrait.ratio, "9:16");
assert.deepEqual(portrait.workflowLines?.length, 4);

const adara = getCreatorProfile("adara-voss");
assert.equal(adara?.creator.slug, "adara-voss");
assert.equal(getCreatorProfile("missing-creator"), null);

const search = getSearchData();
assert.equal(search.clips.length > 0, true);
assert.equal(search.creators.length > 0, true);

const profile = getUserProfile();
assert.equal(profile.id, "user-lena-marlowe");
const activity = getActivityData();
assert.equal(activity.today.length > 0, true);

const directory = getCreatorDirectory();
assert.equal(directory.featured.slug.length > 0, true);
assert.equal(getSavedData().savedClips.length > 0, true);
assert.equal(getSavedPromptsData().prompts.length > 0, true);
assert.equal(getSubmissionFlowData().submission.rightsConfirmed, true);

console.log("HOTRANK runtime service contract passed");
