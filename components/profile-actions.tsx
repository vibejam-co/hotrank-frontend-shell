"use client";

import {FormEvent, useState} from "react";
import type {UserProfile} from "@/lib/hotrank/domain/types";

interface ProfileActionsProps {
  profile: UserProfile;
  onSaved?: () => void;
}

const usernameFor = (displayName: string, handle: string) => {
  const explicit = handle.trim().replace(/^@/, "");
  if (explicit) return explicit;
  return displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "hotrank-member";
};

export function ProfileActions({profile, onSaved}: ProfileActionsProps) {
  const [surface, setSurface] = useState<"edit" | "settings" | null>(null);
  const [displayName, setDisplayName] = useState(profile.name === "HOTRANK member" ? "" : profile.name);
  const [handle, setHandle] = useState(profile.handle.replace(/^@/, ""));
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = displayName.trim();
    const nextHandle = handle.trim().replace(/^@/, "");
    if (!nextName) {
      setStatus("Add a display name before saving.");
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const response = await fetch("/api/hotrank/mutations", {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({
          action: "update-profile",
          input: {
            profileId: profile.id,
            username: usernameFor(nextName, nextHandle),
            displayName: nextName,
            handle: nextHandle,
            avatarUrl: profile.avatar,
            bio: profile.bio ?? "",
            links: profile.links ?? [],
          },
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as {error?: string} | null;
        setStatus(payload?.error === "Authentication required" ? "Sign in to edit your profile." : "Profile changes could not be saved.");
        return;
      }
      setStatus("Profile saved.");
      onSaved?.();
    } catch {
      setStatus("Profile changes could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return <div>
    <button className="btn" type="button" onClick={() => {setSurface(surface === "edit" ? null : "edit"); setStatus(null);}}>✎ Edit Profile</button>
    <button className="btn" type="button" style={{marginLeft: 10}} onClick={() => {setSurface(surface === "settings" ? null : "settings"); setStatus(null);}}>⚙ Settings</button>
    {surface === "edit" && <form className="card profile-action-panel" onSubmit={saveProfile} aria-label="Edit profile">
      <strong>Edit Profile</strong>
      <p className="meta">Update the public identity connected to your authenticated account.</p>
      <label className="field"><span>Display name</span><input className="input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name"/></label>
      <label className="field"><span>Handle</span><input className="input" value={handle} onChange={(event) => setHandle(event.target.value)} autoComplete="username"/></label>
      <button className="btn primary" type="submit" disabled={saving || profile.id === "anonymous"}>{saving ? "Saving…" : "Save profile"}</button>
      {profile.id === "anonymous" && <p className="meta">Sign in to edit your profile.</p>}
      {status && <p className="meta" role="status">{status}</p>}
    </form>}
    {surface === "settings" && <div className="card profile-action-panel" role="region" aria-label="Profile settings">
      <strong>Settings</strong>
      <p className="meta">Account and notification settings will use your authenticated session.</p>
      <p className="meta">No password, token, or private prompt data is handled here.</p>
    </div>}
  </div>;
}
