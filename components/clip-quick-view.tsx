"use client";

import Link from "next/link";
import {X} from "lucide-react";
import {useEffect, useRef} from "react";
import {AdaptiveMedia} from "@/components/adaptive-media";
import type {Clip} from "@/lib/hotrank/domain/types";

export function ClipQuickView({clip, trigger, onClose}: {clip: Clip | null; trigger: HTMLElement | null; onClose: () => void}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!clip) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], iframe, video[controls], [tabindex]:not([tabindex='-1'])"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [clip, onClose, trigger]);

  if (!clip) return null;

  return <div className="quick-view-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={dialogRef} className="quick-view" role="dialog" aria-modal="true" aria-labelledby="clip-quick-view-title">
      <div className="quick-view-header"><span className="label">Quick view</span><button ref={closeRef} className="icon-btn quick-view-close" type="button" onClick={onClose} aria-label="Close quick view"><X size={18}/></button></div>
      <div className="quick-view-media"><AdaptiveMedia poster={clip.poster} video={clip.video} mode="detail" ratio={clip.ratio} alt={`${clip.title} clip`}/></div>
      <div className="quick-view-info">
        <div>
          <h2 id="clip-quick-view-title" className="serif">{clip.title}</h2>
          <div className="meta">{clip.creator.name}{clip.creator.handle ? ` · ${clip.creator.handle}` : ""}</div>
        </div>
        <div className="quick-view-stats"><span>{clip.rankLabel || "—"}</span><span>{clip.heat}</span><span className={clip.movement.direction === "down" ? "movement down" : "movement up"}>{clip.movement.label}</span></div>
      </div>
      {clip.description && <p className="quick-view-description">{clip.description}</p>}
      <div className="quick-view-actions"><Link className="btn primary" href={`/clips/${clip.slug}`} onClick={onClose}>View full clip</Link><button className="btn" type="button" onClick={onClose}>Keep browsing</button></div>
    </div>
  </div>;
}
