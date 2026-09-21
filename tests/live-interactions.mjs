import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const page = read("app/page.tsx");
const liveHome = read("components/live-home.tsx");
const quickView = read("components/clip-quick-view.tsx");
const cards = read("components/cards.tsx");
const media = read("components/adaptive-media.tsx");
const detailRoute = read("app/clips/[id]/page.tsx");

assert.match(page, /<LiveHome home=\{home\}\/>/);
assert.match(liveHome, /<button type="button" className=\{`rank-item/);
assert.match(liveHome, /onPointerEnter=\{\(\) => selectClip\(clip\)\}/);
assert.match(liveHome, /onFocus=\{\(\) => selectClip\(clip\)\}/);
assert.match(liveHome, /onClick=\{\(event\) => openQuickView\(clip, event\.currentTarget\)\}/);
assert.match(liveHome, /data-rank=\{index \+ 2\}/);
assert.match(liveHome, /data-hero-clip=\{selectedClip\.slug\}/);
assert.match(liveHome, /<Link className="rank-action" href="\/rankings">/);
assert.match(liveHome, /interaction="modal"/);
assert.match(liveHome, /<ClipQuickView/);

const clipCardBody = cards.split("export function CreatorCard")[0];
assert.match(clipCardBody, /<article role="group"/);
assert.doesNotMatch(clipCardBody, /<Link href=\{`\/clips/);
assert.match(clipCardBody, /event\.target as HTMLElement\)\.closest\("button, a"\)/);

assert.match(quickView, /role="dialog" aria-modal="true"/);
assert.match(quickView, /event\.key === "Escape"/);
assert.match(quickView, /trigger\?\.focus\(\)/);
assert.match(quickView, /document\.body\.style\.overflow/);
assert.match(quickView, /View full clip/);
assert.match(quickView, /mode="detail"/);
assert.match(quickView, /event\.target === event\.currentTarget/);

assert.match(media, /setSoundPreference\(next\)/);
assert.match(media, /writeSoundPreference\(next\)/);
assert.match(media, /element\.muted = true/);
assert.match(media, /try \{\n\s+await element\.play\(\);/);
assert.match(media, /source\?\.kind === "youtube"/);
assert.match(media, /"https:\/\/www\.youtube\.com"/);
assert.match(media, /activeStop\?\.\(\)/);
assert.match(media, /event\.pointerType !== "mouse"/);
assert.match(media, /prefers-reduced-motion/);
assert.match(media, /<button type="button" className="media-sound-control"/);

assert.match(detailRoute, /<ClipDetail/);
assert.match(read("components/clip-detail.tsx"), /mode="detail"/);

console.log("HOTRANK live interaction regression tests passed");
