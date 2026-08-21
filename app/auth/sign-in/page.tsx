"use client";

import Link from "next/link";
import {FormEvent, useState} from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  return <main className="shell auth-shell"><section className="card auth-card">
    <div className="eyebrow pink">HOTRANK account</div>
    <h1 className="page-title serif">Sign in</h1>
    <p className="meta">Use your HOTRANK account to access your profile and saved work.</p>
    <form onSubmit={submit} className="auth-form">
      <label>Email<input className="input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required/></label>
      <label>Password<input className="input" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required/></label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="btn primary block" type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</button>
    </form>
    <Link className="view-all" href="/">Return to HOTRANK</Link>
  </section></main>;
}
