"use client";

import {Copy} from "lucide-react";
import {useState} from "react";

export function CopyPrompt({prompt, className = "btn primary"}: {prompt: string; className?: string}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const fallbackCopy = () => {
      const textarea = document.createElement("textarea"); textarea.value = prompt; textarea.style.position = "fixed"; textarea.style.opacity = "0";
      document.body.appendChild(textarea); textarea.select(); const copiedByFallback = document.execCommand("copy"); textarea.remove();
      if (!copiedByFallback) throw new Error("Clipboard unavailable");
    };
    try {
      if (navigator.clipboard?.writeText) {
        try { await navigator.clipboard.writeText(prompt); } catch { fallbackCopy(); }
      } else fallbackCopy();
      setCopied(true); window.setTimeout(() => setCopied(false), 1400);
    } catch { setCopied(false); }
  };
  return <button className={className} onClick={copy} type="button"><Copy size={16}/><span aria-live="polite">{copied ? "Copied" : "Copy Prompt"}</span></button>;
}
