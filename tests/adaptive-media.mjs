import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getSupportedMediaSource, getYouTubeVideoId} from "../lib/media.ts";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

assert.equal(getYouTubeVideoId("https://www.youtube.com/watch?v=abc123_DEF"), "abc123_DEF");
assert.equal(getYouTubeVideoId("https://youtube.com/shorts/shorts_123"), "shorts_123");
assert.equal(getYouTubeVideoId("https://www.youtube.com/embed/embed_123"), "embed_123");
assert.equal(getYouTubeVideoId("https://youtu.be/youtu_123?t=4"), "youtu_123");
assert.equal(getYouTubeVideoId("https://evil.example/embed/embed_123"), null);

assert.deepEqual(getSupportedMediaSource("https://cdn.example/video.mp4"), {kind: "direct", url: "https://cdn.example/video.mp4"});
assert.equal(getSupportedMediaSource("https://cdn.example/video.webm")?.kind, "direct");
assert.equal(getSupportedMediaSource("https://cdn.example/video.m3u8?token=redacted")?.kind, "direct");
assert.equal(getSupportedMediaSource(""), null);
assert.equal(getSupportedMediaSource("not a media URL"), null);
assert.equal(getSupportedMediaSource("https://cdn.example/poster.jpg"), null);

const cards = read("components/cards.tsx");
assert.match(cards, /<AdaptiveMedia[^>]*video=\{item\.video\}/);
assert.match(cards, /aria-hidden="true"/);

const media = read("components/adaptive-media.tsx");
assert.match(media, /<video/);
assert.match(media, /<iframe/);
assert.match(media, /autoplay=1&mute=\$\{soundPreference === "on" \? 0 : 1\}&playsinline=1&controls=0&rel=0/);
assert.match(media, /controls=1&rel=0/);
assert.match(media, /onError=\{handleMediaFailure\}/);
assert.match(media, /mode === "detail"/);
assert.match(media, /hotrank_preview_sound/);
assert.match(media, /postMessage\(JSON\.stringify\(\{event: "command"/);
assert.match(media, /prefers-reduced-motion/);
assert.match(media, /IntersectionObserver/);
assert.match(media, /activeStop\?\.\(\)/);
assert.match(media, /media-sound-control/);

console.log("HOTRANK adaptive media regression tests passed");
