import Link from "next/link";

export function Logo({compact = false}: {compact?: boolean}) {
  return <Link href="/" className={`brand-logo ${compact ? "brand-logo-compact" : ""}`} aria-label="HOTRANK home">
    <span>HOTR</span>
    <svg className="brand-a" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M14 1 26 25H2L14 1Z" fill="currentColor"/>
      <path d="m14 9 5 10h-10L14 9Z" fill="var(--bg)"/>
    </svg>
    <span>NK</span>
  </Link>;
}
