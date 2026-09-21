"use client";

import Link from "next/link";
import {Flame} from "lucide-react";
import {useCallback, useState, type KeyboardEvent, type MouseEvent} from "react";
import {AdaptiveMedia} from "@/components/adaptive-media";
import {ClipCard} from "@/components/cards";
import {ClipQuickView} from "@/components/clip-quick-view";
import type {Clip, HomeData} from "@/lib/hotrank/domain/types";

export function LiveHome({home}: {home: HomeData}) {
  const {hero, liveRankings, risingNow, editorPicks} = home;
  const [selectedClip, setSelectedClip] = useState(hero);
  const [quickView, setQuickView] = useState<{clip: Clip; trigger: HTMLElement} | null>(null);

  const openQuickView = useCallback((clip: Clip, trigger: HTMLElement) => {
    setQuickView({clip, trigger});
  }, []);
  const closeQuickView = useCallback(() => setQuickView(null), []);
  const selectClip = useCallback((clip: Clip) => setSelectedClip(clip), []);
  const resetHero = useCallback(() => {
    if (!quickView) setSelectedClip(hero);
  }, [hero, quickView]);
  const activateHero = useCallback((event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    if (event.type === "keydown" && (event as KeyboardEvent<HTMLElement>).key !== "Enter" && (event as KeyboardEvent<HTMLElement>).key !== " ") return;
    if (event.type === "keydown") event.preventDefault();
    if ((event.target as HTMLElement).closest("button, a")) return;
    openQuickView(selectedClip, event.currentTarget);
  }, [openQuickView, selectedClip]);

  return <main className="shell">
    <div className="eyebrow"><span className="pink">●</span> LIVE　 <span className="muted">UPDATED 2 MINUTES AGO</span></div>
    <div className="home-hero section" onPointerLeave={resetHero}>
      <div className="card hero-card" role="group" tabIndex={0} aria-label={`${selectedClip.title} hero preview`} data-hero-clip={selectedClip.slug} onClick={activateHero} onKeyDown={activateHero}>
        <AdaptiveMedia key={selectedClip.id} poster={selectedClip.poster} video={selectedClip.video} ratio={selectedClip.ratio} alt={`${selectedClip.title} landscape`} label={<><div className="media-gradient"/><div className="media-caption"><h3 className="serif">{selectedClip.title}</h3><div className="meta">{selectedClip.creator.name}　<span className="heat"><Flame size={13}/> {selectedClip.heat}</span>　<span className={selectedClip.movement.direction === "down" ? "movement down" : "movement up"}>{selectedClip.movement.label}</span></div></div></>}/>
      </div>
      <div className="rank-list" aria-label="Live rankings 2 through 7">
        <div className="rank-head"><span>Rank</span><span></span><span>Title</span><span>Heat</span><span>Move</span></div>
        {liveRankings.map((clip, index) => <button type="button" className={`rank-item ${selectedClip.id === clip.id ? "active" : ""}`} aria-pressed={selectedClip.id === clip.id} data-rank={index + 2} key={clip.id} onPointerEnter={() => selectClip(clip)} onFocus={() => selectClip(clip)} onClick={(event) => openQuickView(clip, event.currentTarget)}><span className="rank-num">0{index + 2}</span><img className="rank-thumb" src={clip.poster} alt={`${clip.title} thumbnail`}/><span className="rank-title">{clip.title}<small className="meta" style={{display: "block"}}>{clip.creator.name}</small></span><span className="heat">{clip.heat}</span><span className={`movement ${clip.movement.direction === "down" ? "down" : "up"}`}>{clip.movement.label}</span></button>)}
        <Link className="rank-action" href="/rankings">VIEW FULL RANKINGS　›</Link>
      </div>
    </div>
    <section className="section"><div className="section-head"><h2 className="serif">Rising now</h2><Link className="view-all" href="/rankings">View all　›</Link></div><div className="rail">{risingNow.map((clip) => <ClipCard key={clip.id} item={clip} interaction="modal" onOpen={openQuickView}/>)}</div></section>
    <section className="section"><div className="section-head"><h2 className="serif">Editor picks</h2><Link className="view-all" href="/rankings">View all　›</Link></div><div className="editor-grid">{editorPicks.map((clip, index) => <ClipCard key={clip.id} item={clip} wide={index === 0} overlay interaction="modal" onOpen={openQuickView}/>)}</div></section>
    <ClipQuickView clip={quickView?.clip || null} trigger={quickView?.trigger || null} onClose={closeQuickView}/>
  </main>;
}
