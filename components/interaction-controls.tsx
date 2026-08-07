"use client";

import {useState} from "react";

export function LocalTabs({items, initial}: {items: string[]; initial: string}) {
  const [active, setActive] = useState(initial);
  return <div className="profile-tabs" role="tablist">{items.map(item=><button type="button" role="tab" aria-selected={active===item} className={active===item?"pink":""} onClick={()=>setActive(item)} key={item}>{item}</button>)}</div>;
}

export function FollowButton({label="Follow"}: {label?: string}) { const [following, setFollowing] = useState(label === "Following"); return <button type="button" className={`btn ${following ? "" : "primary"}`} onClick={()=>setFollowing(value=>!value)}>{following ? "Following" : "Follow"}</button>; }
