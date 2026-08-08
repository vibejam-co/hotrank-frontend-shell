"use client";

import Link from "next/link";
import {useEffect, useRef, useState} from "react";

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
    if (document.hidden && activePreview) {
      activeStop?.();
    }
  });
}

export function AdaptiveMedia({
  poster, video, alt, ratio = "16:9", href, label, className = ""
}: {poster: string; video?: string; alt: string; ratio?: MediaRatio; href?: string; label?: React.ReactNode; className?: string}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  useEffect(() => { installHiddenListener(); }, []);
  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const element = videoRef.current;
    if (element) element.pause();
    setPreviewActive(false);
    if (activePreview === element) {
      activePreview = null;
      activeStop = null;
    }
  };
  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) stop();
    }, {threshold: 0.2});
    observer.observe(element);
    return () => { observer.disconnect(); stop(); };
  }, []);
  const start = (event: React.PointerEvent) => {
    if (!video || event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const element = videoRef.current;
      if (!element) return;
      activeStop?.();
      activePreview = element;
      activeStop = stop;
      try { await element.play(); } catch { stop(); }
    }, 200);
  };
  const content = <div className={`adaptive-media media ${ratioClass[ratio]} ${className}`} onPointerEnter={start} onPointerLeave={stop}>
    <img className="media-poster" src={poster} alt={alt}/>
    {video && <video ref={videoRef} className={`preview-video ${previewActive ? "is-active" : ""}`} src={video} muted playsInline preload="metadata" onCanPlay={() => setVideoReady(true)} onPlaying={() => setPreviewActive(true)} onPause={() => setPreviewActive(false)} data-video-ready={videoReady} aria-label={`${alt} video preview`}/>}<div className="media-gradient"/>{label}
  </div>;
  return href ? <Link href={href} className="media-link">{content}</Link> : content;
}
