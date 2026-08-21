"use client";

import Link from "next/link";
import {FormEvent, useState} from "react";
import {createSupabaseBrowserClient} from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/sign-in", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({email, password})});
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof payload.error === "string" ? payload.error : "Sign-in failed");
        return;
      }
      window.location.assign("/");
    } catch {
      setError("Auth unavailable");
    } finally {
      setSubmitting(false);
    }
  }

  async function continueWithGoogle() {
    setGoogleSubmitting(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = new URL("/auth/callback", window.location.origin).toString();
      const {data, error: oauthError} = await supabase.auth.signInWithOAuth({provider: "google", options: {redirectTo}});
      if (oauthError || !data.url) {
        setError("Google sign-in is unavailable");
        setGoogleSubmitting(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Google sign-in is unavailable");
      setGoogleSubmitting(false);
    }
  }

  return <main className="shell auth-shell"><section className="card auth-card">
    <div className="eyebrow pink">HOTRANK account</div>
    <h1 className="page-title serif">Sign in</h1>
    <p className="meta">Use your HOTRANK account to access your profile and saved work.</p>
    <form onSubmit={submit} className="auth-form">
      <label>Email<input className="input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required/></label>
      <label>Password<input className="input" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required/></label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="btn primary block" type="submit" disabled={submitting || googleSubmitting}>{submitting ? "Signing in…" : "Sign in"}</button>
    </form>
    <div className="auth-divider" aria-hidden="true"><span>or</span></div>
    <button className="btn google-btn block" type="button" onClick={continueWithGoogle} disabled={submitting || googleSubmitting}>
      <span className="google-mark" aria-hidden="true">G</span>{googleSubmitting ? "Connecting to Google…" : "Continue with Google"}
    </button>
    <Link className="view-all" href="/">Return to HOTRANK</Link>
  </section></main>;
}
