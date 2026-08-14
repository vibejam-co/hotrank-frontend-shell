"use client";

import {Clock, Grid2X2, Search as SearchIcon, Users, X} from "lucide-react";
import {useEffect, useMemo, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {ClipCard, CreatorCard} from "@/components/cards";
import {getSearchData} from "@/lib/hotrank";

export function SearchSurface() {
  const {clips, creators} = getSearchData();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("ALL RESULTS");
  const [highlight, setHighlight] = useState(0);
  const resultLinks = useMemo(() => clips.slice(0, 5).map((clip) => ({title: clip.title, href: `/clips/${clip.slug}`})), [clips]);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); }
    if (event.key === "ArrowDown") { event.preventDefault(); setHighlight((value) => Math.min(value + 1, resultLinks.length - 1)); }
    if (event.key === "ArrowUp") { event.preventDefault(); setHighlight((value) => Math.max(value - 1, 0)); }
    if (event.key === "Enter" && resultLinks[highlight]) router.push(resultLinks[highlight].href);
  };
  useEffect(() => {
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target === inputRef.current) return;
      if (event.key === "Escape") { event.preventDefault(); router.push("/?focus=search"); window.setTimeout(() => document.querySelector<HTMLElement>("[aria-label='Open search']")?.focus(), 50); }
      if (event.key === "ArrowDown") { event.preventDefault(); setHighlight((value) => Math.min(value + 1, resultLinks.length - 1)); }
      if (event.key === "ArrowUp") { event.preventDefault(); setHighlight((value) => Math.max(value - 1, 0)); }
      if (event.key === "Enter" && resultLinks[highlight]) router.push(resultLinks[highlight].href);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [highlight, resultLinks, router]);
  const close = () => { router.push("/?focus=search"); window.setTimeout(() => document.querySelector<HTMLElement>("[aria-label='Open search']")?.focus(), 50); };
  return <main className="search-surface" role="dialog" aria-modal="true" aria-labelledby="search-title">
    <div className="search-topline"><span id="search-title" className="label">Search HOTRANK</span><button className="btn" type="button" onClick={close} aria-label="Close search"><X size={16}/> Close <span className="kbd">Esc</span></button></div>
    <div className="search-input"><SearchIcon size={32}/><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleKeyDown} placeholder="Search clips, creators, or categories" aria-label="Search clips, creators, or categories"/><span className="kbd">/</span></div>
    <div className="search-columns"><div><h3><Clock size={15}/> Recent searches</h3><div className="chips">{["sprint finish","game winner","mic’d up","street fashion","dunk contest"].map((item) => <span className="tag" key={item}>{item}　×</span>)}</div></div><div><h3>↗ Trending searches</h3><ol>{["game winner","nba finals","last second","mic’d up"].map((item) => <li key={item}>{item}</li>)}</ol></div><div><h3><Grid2X2 size={15}/> Suggested categories</h3><div className="chips">{["Basketball","Football","Soccer","Music","Fashion","Gaming"].map((item) => <button type="button" className="tag pink" key={item} onClick={() => setQuery(item)}>◉　{item}</button>)}</div></div></div>
    <div className="tabs" role="tablist">{["ALL RESULTS","CLIPS","CREATORS","CATEGORIES"].map((item) => <button type="button" role="tab" aria-selected={tab === item} className={tab === item ? "active" : ""} key={item} onClick={() => setTab(item)}>{item}</button>)}</div>
    {tab !== "CREATORS" && <><div className="section-head"><h2 className="serif">◉　Clips</h2><span className="view-all">View all clips　›</span></div><div className="search-results">{clips.slice(0, 5).map((item, index) => <div data-search-highlight={highlight === index ? "true" : "false"} className={highlight === index ? "keyboard-highlight" : ""} key={item.id}><ClipCard item={item}/></div>)}</div></>}
    {tab !== "CLIPS" && <><div className="section-head section"><h2 className="serif"><Users size={20}/> Creators</h2><span className="view-all">View all creators　›</span></div><div className="search-results">{creators.slice(0, 5).map((item) => <CreatorCard key={item.id} creator={item}/>)}</div></>}
    <div className="meta" style={{textAlign:"center",marginTop:36}}>Use　<span className="kbd">↑</span> <span className="kbd">↓</span>　to navigate　　<span className="kbd">Enter</span> to select　　<span className="kbd">Esc</span> to close</div>
  </main>;
}
