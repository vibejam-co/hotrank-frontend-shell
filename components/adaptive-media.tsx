"use client";

import Link from "next/link";
import {useCallback, useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode} from "react";
import {getSupportedMediaSource} from "@/lib/media";

export type MediaRatio = "9:16" | "4:5" | "1:1" | "16:9" | "2:1" | "2.39:1";

const ratioClass: Record<MediaRatio, string> = {
  "9:16": "ratio-portrait", "4:5": "ratio-four-five", "1:1": "ratio-square",
  "16:9": "ratio-wide", "2:1": "ratio-cinematic", "2.39:1": "ratio-ultrawide"
};

let activePreview: HTMLVideoElement | null = null;
let activeStop: (() => void) | null = null;
let hiddenListenerInstalled = false;

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewActive, setPreviewActive] = useState(false);
  const [youtubePreviewActive, setYoutubePreviewActive] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const source = useMemo(() => getSupportedMediaSource(video), [video]);
  const isDetail = mode === "detail";

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
    if (!element || mode !== "preview") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) stop();
    }, {threshold: 0.2});
    observer.observe(element);
    return () => { observer.disconnect(); stop(); };
  }, [mode, stop]);

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
      try {
        await element.play();
        setPreviewActive(true);
      } catch {
        handleMediaFailure();
      }
    }, 200);
  }, [handleMediaFailure, mode, source, stop]);

  const youtubePreviewSrc = source?.kind === "youtube"
    ? `https://www.youtube.com/embed/${source.videoId}?autoplay=1&mute=1&playsinline=1&controls=0&rel=0`
    : "";
  const youtubeDetailSrc = source?.kind === "youtube"
    ? `https://www.youtube.com/embed/${source.videoId}?playsinline=1&controls=1&rel=0`
    : "";

  const content = <div ref={mediaRef} className={`adaptive-media media ${ratioClass[ratio]} ${className}`} onPointerEnter={isDetail ? undefined : start} onPointerLeave={isDetail ? undefined : stop}>
    <img className="media-poster" src={poster} alt={alt}/>
    {!mediaFailed && source?.kind === "direct" && <video ref={videoRef} className={isDetail ? "detail-player" : `preview-video ${previewActive ? "is-active" : ""}`} src={source.url} poster={poster} muted={!isDetail} controls={isDetail} playsInline preload="metadata" onPlaying={() => setPreviewActive(true)} onPause={() => setPreviewActive(false)} onError={handleMediaFailure} aria-label={isDetail ? `${alt} video player` : `${alt} video preview`}/>}
    {!mediaFailed && source?.kind === "youtube" && !isDetail && youtubePreviewActive && <iframe className="preview-frame is-active" src={youtubePreviewSrc} title={`${alt} video preview`} allow={youtubeAllow} referrerPolicy="strict-origin-when-cross-origin" onError={handleMediaFailure}/>}
    {!mediaFailed && source?.kind === "youtube" && isDetail && <iframe className="detail-frame" src={youtubeDetailSrc} title={`${alt} video player`} allow={youtubeAllow} allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onError={handleMediaFailure}/>}
    <div className="media-gradient"/>{label}
  </div>;

  return href ? <Link href={href} className="media-link">{content}</Link> : content;
}
