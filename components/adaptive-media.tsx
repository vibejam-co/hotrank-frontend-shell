"use client";

import Link from "next/link";
import {Volume2, VolumeX} from "lucide-react";
import {useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode} from "react";
import {getSupportedMediaSource} from "@/lib/media";

export type MediaRatio = "9:16" | "4:5" | "1:1" | "16:9" | "2:1" | "2.39:1";

const ratioClass: Record<MediaRatio, string> = {
  "9:16": "ratio-portrait", "4:5": "ratio-four-five", "1:1": "ratio-square",
  "16:9": "ratio-wide", "2:1": "ratio-cinematic", "2.39:1": "ratio-ultrawide"
};

let activePreview: HTMLVideoElement | null = null;
let activeStop: (() => void) | null = null;
let hiddenListenerInstalled = false;
type SoundPreference = "on" | "off";

function readSoundPreference(): SoundPreference {
  if (typeof window === "undefined") return "off";
  try { return window.localStorage.getItem("hotrank_preview_sound") === "on" ? "on" : "off"; } catch { return "off"; }
}

function writeSoundPreference(value: SoundPreference) {
  try { window.localStorage.setItem("hotrank_preview_sound", value); } catch { /* Storage may be unavailable in private contexts. */ }
}

function installHiddenListener() {
  if (hiddenListenerInstalled || typeof document === "undefined") return;
  hiddenListenerInstalled = true;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) activeStop?.();
  });
}

const youtubeAllow = "autoplay; encrypted-media; picture-in-picture";

export function AdaptiveMedia({
  poster, video, alt, ratio = "16:9", href, label, className = "", mode = "preview"
}: {poster: string; video?: string; alt: string; ratio?: MediaRatio; href?: string; label?: ReactNode; className?: string; mode?: "preview" | "detail"}) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewActive, setPreviewActive] = useState(false);
  const [youtubePreviewActive, setYoutubePreviewActive] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [soundPreference, setSoundPreference] = useState<SoundPreference>("off");
  const [previewMuted, setPreviewMuted] = useState(true);
  const [pageOrigin, setPageOrigin] = useState("");
  const source = useMemo(() => getSupportedMediaSource(video), [video]);
  const isDetail = mode === "detail";

  useEffect(() => {
    setSoundPreference(readSoundPreference());
    setPageOrigin(encodeURIComponent(window.location.origin));
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    const element = videoRef.current;
    if (element) {
      element.pause();
      try { element.currentTime = 0; } catch { /* A source may reject seeking before metadata. */ }
    }
    setPreviewActive(false);
    setYoutubePreviewActive(false);
    setPreviewMuted(true);
    if (activePreview === element) activePreview = null;
    if (activeStop === stop) activeStop = null;
  }, []);

  useEffect(() => { installHiddenListener(); }, []);

  useEffect(() => {
    setMediaFailed(false);
    stop();
  }, [source, mode, stop]);

  useEffect(() => {
    const element = mediaRef.current;
    if (!element || mode !== "preview" || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) stop();
    }, {threshold: 0.2});
    observer.observe(element);
    return () => { observer.disconnect(); stop(); };
  }, [mode, stop]);

  useEffect(() => () => stop(), [stop]);

  const handleMediaFailure = useCallback(() => {
    setMediaFailed(true);
    stop();
  }, [stop]);

  const start = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!source || mode !== "preview" || event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      activeStop?.();
      activeStop = stop;
      if (source.kind === "youtube") {
        setYoutubePreviewActive(true);
        return;
      }
      const element = videoRef.current;
      if (!element) return;
      activePreview = element;
      const wantsSound = soundPreference === "on";
      element.muted = !wantsSound;
      setPreviewMuted(!wantsSound);
      try {
        await element.play();
        setPreviewActive(true);
      } catch {
        if (wantsSound) {
          element.muted = true;
          setPreviewMuted(true);
          try {
            await element.play();
            setPreviewActive(true);
            return;
          } catch { /* Fall through to the safe poster fallback. */ }
        }
        handleMediaFailure();
      }
    }, 200);
  }, [handleMediaFailure, mode, soundPreference, source, stop]);

  const postYoutubeCommand = useCallback((func: "mute" | "unMute" | "playVideo") => {
    const frame = youtubeRef.current;
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage(JSON.stringify({event: "command", func, args: []}), "https://www.youtube.com");
  }, []);

  const toggleSound = useCallback(async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const next: SoundPreference = previewMuted ? "on" : "off";
    setSoundPreference(next);
    writeSoundPreference(next);
    if (source?.kind === "youtube") {
      if (next === "on") {
        postYoutubeCommand("unMute");
        postYoutubeCommand("playVideo");
      } else {
        postYoutubeCommand("mute");
      }
      setPreviewMuted(next === "off");
      return;
    }
    const element = videoRef.current;
    if (!element) return;
    if (next === "on") {
      element.muted = false;
      try {
        await element.play();
        setPreviewMuted(false);
      } catch {
        element.muted = true;
        setPreviewMuted(true);
      }
    } else {
      element.muted = true;
      setPreviewMuted(true);
    }
  }, [postYoutubeCommand, previewMuted, source]);

  const youtubePreviewSrc = source?.kind === "youtube"
    ? `https://www.youtube.com/embed/${source.videoId}?autoplay=1&mute=${soundPreference === "on" ? 0 : 1}&playsinline=1&controls=0&rel=0&enablejsapi=1${pageOrigin ? `&origin=${pageOrigin}` : ""}`
    : "";
  const youtubeDetailSrc = source?.kind === "youtube"
    ? `https://www.youtube.com/embed/${source.videoId}?playsinline=1&controls=1&rel=0&enablejsapi=1${pageOrigin ? `&origin=${pageOrigin}` : ""}`
    : "";

  const content = <div ref={mediaRef} className={`adaptive-media media ${ratioClass[ratio]} ${className}`} onPointerEnter={isDetail ? undefined : start} onPointerLeave={isDetail ? undefined : stop}>
    <img className="media-poster" src={poster} alt={alt}/>
    {!mediaFailed && source?.kind === "direct" && <video
      ref={videoRef}
      className={isDetail ? "detail-player" : `preview-video ${previewActive ? "is-active" : ""}`}
      src={source.url}
      poster={poster}
      muted={isDetail ? false : previewMuted}
      controls={isDetail}
      playsInline
      preload="metadata"
      onPlaying={() => setPreviewActive(true)}
      onPause={() => setPreviewActive(false)}
      onError={handleMediaFailure}
      aria-label={isDetail ? `${alt} video player` : `${alt} video preview`}
    />}
    {!mediaFailed && source?.kind === "youtube" && !isDetail && youtubePreviewActive && <iframe
      ref={youtubeRef}
      className="preview-frame is-active"
      src={youtubePreviewSrc}
      title={`${alt} video preview`}
      allow={youtubeAllow}
      referrerPolicy="strict-origin-when-cross-origin"
      onError={handleMediaFailure}
    />}
    {!mediaFailed && source?.kind === "youtube" && isDetail && <iframe
      ref={youtubeRef}
      className="detail-frame"
      src={youtubeDetailSrc}
      title={`${alt} video player`}
      allow={youtubeAllow}
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      onError={handleMediaFailure}
    />}
    {!isDetail && (previewActive || youtubePreviewActive) && <button type="button" className="media-sound-control" onClick={toggleSound} aria-label={previewMuted ? "Turn preview sound on" : "Mute preview"} title={previewMuted ? "Turn sound on" : "Mute preview"}>{previewMuted ? <VolumeX size={15}/> : <Volume2 size={15}/>}</button>}
    <div className="media-gradient"/>{label}
  </div>;

  return href ? <Link href={href} className="media-link">{content}</Link> : content;
}
