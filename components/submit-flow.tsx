"use client";

import {CheckCircle, LockKeyhole} from "lucide-react";
import {useState} from "react";

const steps = ["Add Source", "Details", "Creator", "Review"];
const platforms = ["YouTube", "TikTok", "Instagram"];

export function SubmitFlow() {
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState("");
  const [source, setSource] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creatorHandle, setCreatorHandle] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [promptText, setPromptText] = useState("");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [status, setStatus] = useState("");

  const submit = async () => {
    setStatus("Submitting for review…");
    const response = await fetch("/api/hotrank/mutations", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({action: "create-submission", input: {sourceUrl: source, platform, title, creatorHandle, canonicalUrl, promptText, creatorNotes: description, rightsConfirmed}}),
    }).catch(() => null);
    const payload = await response?.json().catch(() => null);
    if (!response?.ok) {
      setStatus(payload?.error === "Authentication required" ? "Sign in to submit your work." : payload?.error || "Submission needs changes.");
      return;
    }
    setStatus("Submitted for review. It will remain private until approved.");
  };

  return <><div className="submit-steps" aria-label="Submission progress">{steps.map((label, index) => <button key={label} type="button" className={step === index + 1 ? "active" : ""} onClick={() => setStep(index + 1)}><span>{index + 1}</span>{label}</button>)}</div><div className="submit-layout section"><section className="card form-card"><h2>1. Add your clip source</h2><p>Paste a link to your clip from any supported platform.</p><label className="sr-only" htmlFor="source">Clip source URL</label><input id="source" className="input" value={source} onChange={(event) => setSource(event.target.value)} placeholder="https://…"/><div className="eyebrow" style={{textAlign: "center", margin: "28px 0"}}>or choose a platform</div><div className="platforms">{platforms.map((item) => <button type="button" className={`platform ${platform === item ? "active" : ""}`} key={item} onClick={() => setPlatform(item)}><strong>{item === "YouTube" ? "▶" : item === "TikTok" ? "♪" : "◎"} {item}</strong><small className="meta" style={{display: "block"}}>Shorts or Video</small></button>)}</div><div className="card" style={{padding: 14}}><strong className="movement up"><CheckCircle size={16}/> Server validation on submit</strong><div className="meta">The source is checked before a private review record is created.</div></div><div className="card" style={{padding: 14, marginTop: 24}}><LockKeyhole size={28}/><strong style={{display: "block", marginTop: 8}}>Your privacy matters</strong><p className="meta">Prompt and creator notes stay private until an approved public projection allows them.</p></div></section><section className="card form-card"><h2>2. Add details</h2><div className="field"><label htmlFor="title">Title (required)</label><input id="title" className="input" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={140}/></div><div className="field"><label htmlFor="description">Description (optional)</label><textarea id="description" className="textarea" value={description} onChange={(event) => setDescription(event.target.value)}/></div><div className="field"><label htmlFor="prompt">Private prompt (optional)</label><textarea id="prompt" className="textarea" value={promptText} onChange={(event) => setPromptText(event.target.value)} placeholder="Stored privately when provided."/></div><h2 style={{marginTop: 30}}>3. Creator</h2><div className="field"><label htmlFor="creator">Creator handle / attribution</label><input id="creator" className="input" value={creatorHandle} onChange={(event) => setCreatorHandle(event.target.value)} placeholder="@your-handle"/></div><div className="field"><label htmlFor="attribution">Canonical attribution URL</label><input id="attribution" className="input" value={canonicalUrl} onChange={(event) => setCanonicalUrl(event.target.value)} placeholder="https://…"/></div></section><aside className="card preview-card"><div className="section-head"><strong>Preview</strong><span className="movement up">Private until approved</span></div><div className="media"><img src="/media/submit-preview.png" alt="Submission preview placeholder"/></div><div className="checklist">{["Supported platform", "Valid source URL", "Creator attribution", "Rights declaration"].map((item) => <div className="check" key={item}>{item}<span style={{float: "right"}}>{item === "Rights declaration" ? (rightsConfirmed ? "Yes" : "Required") : "Pending"}</span></div>)}</div><label className="card confirmation" style={{padding: 14, marginTop: 14, display: "block"}}><strong>Original work confirmation</strong><span style={{display: "block", marginTop: 8}}><input type="checkbox" checked={rightsConfirmed} onChange={(event) => setRightsConfirmed(event.target.checked)}/> I confirm this clip is my original work and I have the rights to share it.</span></label></aside></div><div className="submit-footer"><button className="btn" type="button" disabled={step === 1} onClick={() => setStep((value) => Math.max(1, value - 1))}>Back</button><button className="btn primary" type="button" disabled={!rightsConfirmed} onClick={() => step === 4 ? submit() : setStep((value) => Math.min(4, value + 1))}>{step === 4 ? "Submit for review" : "Continue"}　→</button></div>{status && <p className="meta" role="status" style={{marginTop: 16}}>{status}</p>}</>;
}
