"use client";

import {useState} from "react";
import {Tabs, ClipCard, PromptCard} from "@/components/cards";
import {FollowButton} from "@/components/interaction-controls";
import {getSavedData} from "@/lib/hotrank";

export default function Saved() {
  const [active, setActive] = useState("CLIPS");
  const {savedClips, collections, prompts, followedCreators} = getSavedData();
  const collectionSection = <section className="section saved-collections"><div className="section-head"><h2 className="serif">Collections</h2><span className="view-all">View all collections　›</span></div><div className="collection-grid">{collections.map((item) => <div className="card collection-card" key={item.id}><img src={item.image} alt={`${item.title} cover`}/><div><h2 className="serif">{item.title}</h2><div className="meta">{item.countLabel}</div><button className="icon-btn" type="button" style={{marginTop: 18}} aria-label={`Open ${item.title}`}><span className="pink">▮</span></button></div></div>)}</div></section>;
  return <main className="shell"><div className="saved-heading"><h1 className="page-title serif">Saved</h1><div className="saved-tools"><span className="meta">432 saved items</span><button className="select" type="button">Newest saved⌄</button></div></div><Tabs onChange={setActive}/>{active === "CLIPS" && <><section><div className="section-head"><h2 className="serif">Recently Saved</h2><span className="view-all">View all　›</span></div><div className="rail saved-rail">{savedClips.map((clip) => <ClipCard key={clip.id} item={clip} saved/>)}</div></section>{collectionSection}</>}{active === "PROMPTS" && <section><div className="section-head"><h2 className="serif">Prompt Library</h2><span className="view-all">View all　›</span></div>{prompts.map((prompt) => <PromptCard key={prompt.id} prompt={prompt}/>)}</section>}{active === "COLLECTIONS" && collectionSection}{active === "FOLLOWING" && <section><div className="section-head"><h2 className="serif">Creators You Follow</h2><span className="view-all">View all　›</span></div>{followedCreators.map((creator) => <div className="follow-row" key={creator.id}><img src={creator.avatar} alt={`${creator.name} avatar`}/><span>{creator.name}<small className="meta" style={{display: "block"}}>Director · ranked creator</small></span><FollowButton label="Following"/></div>)}</section>}</main>;
}
