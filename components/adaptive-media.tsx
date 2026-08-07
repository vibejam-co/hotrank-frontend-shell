"use client";

import Link from "next/link";
import {useEffect, useRef, useState} from "react";

export type MediaRatio = "9:16" | "4:5" | "1:1" | "16:9" | "2:1" | "2.39:1";

const ratioClass: Record<MediaRatio, string> = {
  "9:16": "ratio-portrait", "4:5": "ratio-four-five", "1:1": "ratio-square",
  "16:9": "ratio-wide", "2:1": "ratio-cinematic", "2.39:1": "ratio-ultrawide"
};

let activePreview: HTMLVideoElement | null = null;
let hiddenListenerInstalled = false;

function installHiddenListener() {
  if (hiddenListenerInstalled || typeof document === "undefined") return;
  hiddenListenerInstalled = true;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && activePreview) {
      activePreview.pause();
      activePreview = null;
    }
  });
}

export function AdaptiveMedia({
  poster, video, alt, ratio = "16:9", href, label, className = ""
}: {poster: string; video?: string; alt: string; ratio?: MediaRatio; href?: string; label?: React.ReactNode; className?: string}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { installHiddenListener(); }, []);
  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) { element.pause(); if (activePreview === element) activePreview = null; }
    }, {threshold: 0.2});
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const start = (event: React.PointerEvent) => {
    if (!video || event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const element = videoRef.current;
      if (!element) return;
      if (activePreview && activePreview !== element) activePreview.pause();
      activePreview = element;
      try { await element.play(); } catch { setReady(false); }
    }, 200);
  };
  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (videoRef.current) videoRef.current.pause();
    if (activePreview === videoRef.current) activePreview = null;
  };
  const content = <div className={`adaptive-media media ${ratioClass[ratio]} ${className}`} onPointerEnter={start} onPointerLeave={stop}>
    <img className={`media-poster ${ready ? "is-ready" : ""}`} src={poster} alt={alt}/>
    {video && <video ref={videoRef} className={`preview-video ${ready ? "is-ready" : ""}`} src={video} muted playsInline preload="metadata" onCanPlay={() => setReady(true)} aria-label={`${alt} video preview`}/>}<div className="media-gradient"/>{label}
  </div>;
  return href ? <Link href={href} className="media-link">{content}</Link> : content;
}
