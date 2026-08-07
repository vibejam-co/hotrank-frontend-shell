"use client";

import {useState} from "react";

export function ProfileActions(){
  const [surface,setSurface]=useState<"edit"|"settings"|null>(null);
  return <div><button className="btn" type="button" onClick={()=>setSurface(surface==="edit"?null:"edit")}>✎ Edit Profile</button><button className="btn" type="button" style={{marginLeft:10}} onClick={()=>setSurface(surface==="settings"?null:"settings")}>⚙ Settings</button>{surface&&<div className="card profile-action-panel" role="region" aria-label={`${surface} profile panel`}><strong>{surface==="edit"?"Edit Profile":"Settings"}</strong><p className="meta">Frontend demo state only; changes are not persisted.</p>{surface==="edit"?<input className="input" aria-label="Display name" defaultValue="Lena Marlowe"/>:<label className="meta"><input type="checkbox" defaultChecked/> Email activity updates</label>}</div>}</div>;
}
