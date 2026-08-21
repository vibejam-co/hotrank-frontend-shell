"use client";

import Link from "next/link";
import {useEffect, useRef, useState} from "react";

type SessionUser = {id: string; email: string | null};

function fallbackInitial(email: string | null): string {
  return (email?.trim().charAt(0) || "H").toUpperCase();
}

export function AccountControl() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const controlRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/session", {cache: "no-store", signal: controller.signal})
      .then((response) => response.ok ? response.json() : {user: null})
      .then((payload: {user?: SessionUser | null}) => setUser(payload.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!controlRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        window.requestAnimationFrame(() => triggerRef.current?.focus());
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const signOut = async () => {
    setMenuOpen(false);
    setUser(null);
    await fetch("/api/auth/sign-out", {method: "POST"}).catch(() => undefined);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  if (loading) return <div className="account-control account-loading" aria-hidden="true"/>;
  if (!user) return <Link className="sign-in-link" href="/auth/sign-in">Sign in</Link>;

  const initial = fallbackInitial(user.email);
  return <div ref={controlRef} className="account-control">
    <button ref={triggerRef} className="account-trigger" type="button" aria-label="Open account menu" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
      <span className="avatar avatar-fallback" aria-hidden="true">{initial}</span>
    </button>
    {menuOpen && <div className="account-menu" role="menu" aria-label="Account menu">
      <div className="account-menu-identity" title={user.email ?? undefined}>{user.email ?? "HOTRANK member"}</div>
      <Link href="/profile" role="menuitem" onClick={() => setMenuOpen(false)}>Profile</Link>
      <Link href="/saved" role="menuitem" onClick={() => setMenuOpen(false)}>Saved</Link>
      <button type="button" role="menuitem" onClick={signOut}>Sign Out</button>
    </div>}
  </div>;
}
