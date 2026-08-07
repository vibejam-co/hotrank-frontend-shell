import Link from "next/link";

export function Logo({compact = false}: {compact?: boolean}) {
  return <Link href="/" className={`brand-logo ${compact ? "brand-logo-compact" : ""}`} aria-label="HOTRANK home">
    <span>HOTR</span>
    <svg className="brand-a" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M14 2 26 25H2L14 2Z" fill="none" stroke="currentColor" strokeWidth="3"/>
      <path d="m10.5 17.5 3.5-7 3.5 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span>NK</span>
  </Link>;
}
