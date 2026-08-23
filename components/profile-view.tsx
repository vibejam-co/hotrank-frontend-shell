"use client";

import {useCallback, useEffect, useState} from "react";
import {PromptCard} from "@/components/cards";
import {LocalTabs, FollowButton} from "@/components/interaction-controls";
import {ProfileActions} from "@/components/profile-actions";
import type {UserProfile} from "@/lib/hotrank/domain/types";

export function ProfileView() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const loadProfile = useCallback(() => {
    const controller = new AbortController();
    fetch("/api/hotrank/read?resource=profile", {cache: "no-store", signal: controller.signal})
      .then((response) => response.ok ? response.json() : null)
      .then((payload: {data?: UserProfile} | null) => setProfile(payload?.data ?? null))
      .catch(() => setProfile(null));
    return () => controller.abort();
  }, []);

  useEffect(() => loadProfile(), [loadProfile]);

  if (!profile) return <main className="shell"><div className="profile-identity"><div className="avatar" style={{width: 180, height: 180}} aria-hidden="true"/><div><h1 className="page-title serif" style={{marginBottom: 8}}>Loading profile</h1><div className="meta">Your profile will appear here.</div></div></div></main>;

  return <main className="shell"><div className="profile-identity"><img className="avatar" style={{width: 180, height: 180}} src={profile.avatar} alt={profile.name}/><div><h1 className="page-title serif" style={{marginBottom: 8}}>{profile.name}</h1><div style={{fontSize: 18}}>{profile.handle}</div><div className="meta">{profile.memberSinceLabel}</div><div className="stat-row" style={{marginTop: 24}}>{profile.stats.map((stat) => <div className="stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div></div>{profile.id !== "anonymous" && <ProfileActions profile={profile} onSaved={loadProfile}/>}</div><LocalTabs items={["SAVED", "FOLLOWING", "SUBMISSIONS", "ACTIVITY"]} initial="SAVED"/><div className="profile-lower section"><div><div className="section-head"><h2 className="serif">Recently Saved</h2><span className="view-all">View all</span></div><div className="work-grid">{profile.recentlySaved.map((clip, index) => <img key={`${clip.id}-${index}`} src={clip.poster} alt={`Recently saved creative ${index + 1}`}/>)}</div>{!profile.recentlySaved.length && <p className="meta">Nothing saved yet.</p>}</div><div><div className="section-head"><h2 className="serif">Collections</h2><span className="view-all">View all</span></div>{profile.collections.map((item) => <div className="card collection-card" key={item.id} style={{marginBottom: 12}}><img src={item.image} alt={`${item.title} collection`}/><div><h3 className="serif">{item.title}</h3><div className="meta">{item.countLabel.replace(" clips", " items")}</div></div></div>)}{!profile.collections.length && <p className="meta">No collections yet.</p>}<div className="view-all pink" style={{marginTop: 16}}>＋ New Collection</div></div><div><div className="section-head"><h2 className="serif">Creators You Follow</h2><span className="view-all">View all</span></div>{profile.followedCreators.map((creator) => <div className="follow-row" key={creator.id}><img src={creator.avatar} alt={`${creator.name} avatar`}/><span>{creator.name}<small className="meta" style={{display: "block"}}>{creator.handle}</small></span><FollowButton label="Following"/></div>)}{!profile.followedCreators.length && <p className="meta">No followed creators yet.</p>}<div className="discover-link pink">Discover more creators</div></div><div><div className="section-head"><h2 className="serif">Prompt Library</h2><span className="view-all">View all</span></div>{profile.promptLibrary.map((prompt) => <PromptCard key={prompt.id} prompt={prompt}/>)}{!profile.promptLibrary.length && <p className="meta">No prompts saved yet.</p>}</div></div></main>;
}
