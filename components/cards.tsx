"use client";

import Link from "next/link";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {Bookmark, Flame, Play} from "lucide-react";
import {AdaptiveMedia} from "@/components/adaptive-media";
import {CopyPrompt} from "@/components/copy-prompt";
import type {Clip, Creator, Prompt} from "@/lib/hotrank/domain/types";

export function ClipCard({item, wide = false, saved = false, overlay = false}: {item: Clip; wide?: boolean; saved?: boolean; overlay?: boolean}) {
  return <Link href={`/clips/${item.slug}`} className={`card ${wide ? "wide-card" : ""} ${saved ? "saved-card" : ""} ratio-card-${item.ratio.replace(/[:.]/g, "-")}`}><AdaptiveMedia poster={item.poster} video={item.video} alt={`${item.title} by ${item.creator.name}`} ratio={item.ratio} href={undefined} label={<><div className="media-gradient"/><span className="play" aria-hidden="true"><Play size={16} fill="currentColor"/></span>{overlay && <div className="media-caption"><h3 className="serif">{item.title}</h3><div className="meta">{item.creator.name} · <span className="heat"><Flame size={12}/> {item.heat}</span> <span className={`movement ${item.movement.direction === "down" ? "down" : "up"}`}>{item.movement.label}</span></div></div>}</>}/>{!saved && !overlay && <div className="clip-card-body"><div><h3 className="serif">{item.title}</h3><div className="meta">{item.creator.name}</div></div><div className="clip-card-metric"><span className="heat"><Flame size={12}/> {item.heat}</span><span className={`movement ${item.movement.direction === "down" ? "down" : "up"}`}>{item.movement.label}</span></div></div>}{saved && <div className="saved-card-body"><div><h3 className="serif">{item.title}</h3><div className="meta">by {item.creator.name}</div></div><div className="saved-card-stat"><strong className="pink">#{item.rankLabel || "—"}</strong><span className="heat"><Flame size={12}/> {item.heat}</span><span className="icon-btn" aria-hidden="true"><Bookmark size={15} className="pink"/></span></div></div>}</Link>;
}

export function CreatorCard({creator}: {creator: Creator}) {
  return <Link href={`/creators/${creator.slug}`} className="card creator-card"><img src={creator.avatar} alt={`${creator.name} portrait`}/><div className="creator-overlay"><h3 className="serif">{creator.name}</h3><div className="meta">{creator.followersLabel}</div></div></Link>;
}

export function PromptCard({prompt}: {prompt: Prompt}) {
  return <div className="card prompt-card">{prompt.image && <img src={prompt.image} alt={`${prompt.title} prompt reference`}/>}<div><div className="label pink">▮ {prompt.savedAtLabel}</div><h3 className="serif">{prompt.title}</h3><p>{prompt.copy}</p><div className="chips"><span className="tag">cinematic</span><span className="tag">landscape</span><CopyPrompt prompt={prompt.copy} className="btn prompt-copy-button"/></div></div></div>;
}

export function Tabs({active = "CLIPS", items = ["CLIPS", "PROMPTS", "COLLECTIONS", "FOLLOWING"], onChange}: {active?: string; items?: string[]; onChange?: (item: string) => void}) {
  const [selected, setSelected] = useState(active);
  const router = useRouter();
  const choose = (item: string) => { setSelected(item); onChange?.(item); if (!onChange && item === "PROMPTS") router.push("/saved/prompts"); else if (!onChange && active === "PROMPTS") router.push("/saved"); };
  return <div className="tabs" role="tablist">{items.map((item) => <button type="button" role="tab" aria-selected={selected === item} className={selected === item ? "active" : ""} key={item} onClick={() => choose(item)}>{item}</button>)}</div>;
}
