export type SupportedMediaSource =
  | {kind: "direct"; url: string}
  | {kind: "youtube"; videoId: string};

const youtubeHosts = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);
const youtubeIdPattern = /^[A-Za-z0-9_-]{6,}$/;
const directMediaPattern = /\.(?:mp4|webm|m3u8)$/i;

function validYoutubeId(value: string | null | undefined): string | null {
  return value && youtubeIdPattern.test(value) ? value : null;
}

export function getYouTubeVideoId(value: string): string | null {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase();
    if (!youtubeHosts.has(hostname) || (url.protocol !== "https:" && url.protocol !== "http:")) return null;

    if (hostname === "youtu.be") return validYoutubeId(url.pathname.split("/").filter(Boolean)[0]);
    if (url.pathname === "/watch") return validYoutubeId(url.searchParams.get("v"));

    const [kind, id] = url.pathname.split("/").filter(Boolean);
    if (kind === "shorts" || kind === "embed") return validYoutubeId(id);
    return null;
  } catch {
    return null;
  }
}

export function getSupportedMediaSource(value?: string): SupportedMediaSource | null {
  if (!value?.trim()) return null;
  const youtubeVideoId = getYouTubeVideoId(value);
  if (youtubeVideoId) return {kind: "youtube", videoId: youtubeVideoId};

  try {
    const url = new URL(value.trim());
    if ((url.protocol !== "https:" && url.protocol !== "http:") || !directMediaPattern.test(url.pathname)) return null;
    return {kind: "direct", url: url.toString()};
  } catch {
    return null;
  }
}
