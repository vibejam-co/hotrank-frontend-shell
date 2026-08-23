"use client";

import {useEffect, useState} from "react";
import {Tabs, ClipCard, PromptCard} from "@/components/cards";
import {FollowButton} from "@/components/interaction-controls";
import type {SavedData} from "@/lib/hotrank/domain/types";

export function SavedView() {
  const [active, setActive] = useState("CLIPS");
  const [data, setData] = useState<SavedData | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/hotrank/read?resource=saved", {cache: "no-store", signal: controller.signal})
      .then((response) => response.ok ? response.json() : null)
      .then((payload: {data?: SavedData} | null) => setData(payload?.data ?? {savedClips: [], collections: [], prompts: [], followedCreators: []}))
      .catch(() => setData({savedClips: [], collections: [], prompts: [], followedCreators: []}));
    return () => controller.abort();
  }, []);
  const safeData = data ?? {savedClips: [], collections: [], prompts: [], followedCreators: []};
  const {savedClips, collections, prompts, followedCreators} = safeData;
  const totalItems = savedClips.length + collections.length + prompts.length + followedCreators.length;
  const collectionSection = <section className="section saved-collections"><div className="section-head"><h2 className="serif">Collections</h2><span className="view-all">View all collections　›</span></div>{collections.length ? <div className="collection-grid">{collections.map((item) => <div className="card collection-card" key={item.id}><img src={item.image} alt={`${item.title} cover`}/><div><h2 className="serif">{item.title}</h2><div className="meta">{item.countLabel}</div><button className="icon-btn" type="button" style={{marginTop: 18}} aria-label={`Open ${item.title}`}><span className="pink">▮</span></button></div></div>)}</div> : <p className="meta">No collections yet.</p>}</section>;
  return <main className="shell"><div className="saved-heading"><h1 className="page-title serif">Saved</h1><div className="saved-tools"><span className="meta">{totalItems} saved items</span><button className="select" type="button">Newest saved⌄</button></div></div><Tabs onChange={setActive}/>{active === "CLIPS" && <><section><div className="section-head"><h2 className="serif">Recently Saved</h2><span className="view-all">View all　›</span></div>{savedClips.length ? <div className="rail saved-rail">{savedClips.map((clip) => <ClipCard key={clip.id} item={clip} saved/>)}</div> : <p className="meta">Nothing saved yet.</p>}</section>{collectionSection}</>}{active === "PROMPTS" && <section><div className="section-head"><h2 className="serif">Prompt Library</h2><span className="view-all">View all　›</span></div>{prompts.length ? prompts.map((prompt) => <PromptCard key={prompt.id} prompt={prompt}/>) : <p className="meta">No prompts saved yet.</p>}</section>}{active === "COLLECTIONS" && collectionSection}{active === "FOLLOWING" && <section><div className="section-head"><h2 className="serif">Creators You Follow</h2><span className="view-all">View all　›</span></div>{followedCreators.length ? followedCreators.map((creator) => <div className="follow-row" key={creator.id}><img src={creator.avatar} alt={`${creator.name} avatar`}/><span>{creator.name}<small className="meta" style={{display: "block"}}>Creator</small></span><FollowButton label="Following"/></div>) : <p className="meta">No followed creators yet.</p>}</section>}</main>;
}
