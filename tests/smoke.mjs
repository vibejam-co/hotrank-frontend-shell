import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
assert.equal(existsSync(new URL("../app/clips/[id]/page.tsx", import.meta.url)), true, "dynamic clip route exists");
assert.equal(existsSync(new URL("../app/creators/[slug]/page.tsx", import.meta.url)), true, "dynamic creator route exists");
const clipDetail = read("components/clip-detail.tsx");
assert.match(clipDetail, /CopyPrompt/);
assert.match(clipDetail, /aria-expanded/);
const media = read("components/adaptive-media.tsx");
for (const ratio of ["9:16", "4:5", "1:1", "16:9", "2:1", "2.39:1"]) assert.match(media, new RegExp(ratio.replace(".", "\\.")));
assert.match(media, /IntersectionObserver/);
assert.match(media, /visibilitychange/);
const search = read("components/search-surface.tsx");
assert.match(search, /Escape/);
assert.match(search, /aria-modal/);
assert.match(search, /ArrowDown/);
console.log("HOTRANK targeted smoke tests passed");
