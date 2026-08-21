"use client";

import Link from "next/link";
import {Bell, Menu, Search, X} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {usePathname} from "next/navigation";
import {HotRankLogo} from "@/components/brand/HotRankLogo";
import {AccountControl} from "@/components/account-control";

const mobileMenuId = "hotrank-mobile-menu";
const primaryLinks = [
  ["LIVE", "/"],
  ["RANKINGS", "/rankings"],
  ["CREATORS", "/creators"],
  ["SUBMIT", "/submit"]
] as const;

export function Header(){
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const active = (p:string) => path === p || path.startsWith(p+"/");

  useEffect(()=>{
    if(window.location.search.includes("focus=search")){
      window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>{
        document.querySelector<HTMLElement>("[aria-label='Open search']")?.focus();
        window.history.replaceState({},"",window.location.pathname);
      }));
    }
  },[path]);

  useEffect(()=>{
    setMenuOpen(false);
  },[path]);

  useEffect(()=>{
    if(!menuOpen) return;
    const firstItem = menuRef.current?.querySelector<HTMLElement>("[role='menuitem']");
    window.requestAnimationFrame(()=>firstItem?.focus());
    const handleKeyDown = (event:KeyboardEvent) => {
      if(event.key === "Escape"){
        event.preventDefault();
        setMenuOpen(false);
        window.requestAnimationFrame(()=>triggerRef.current?.focus());
      }
    };
    const handlePointerDown = (event:PointerEvent) => {
      const target = event.target as Node;
      if(!headerRef.current?.contains(target) && !menuRef.current?.contains(target)) setMenuOpen(false);
    };
    document.addEventListener("keydown",handleKeyDown);
    document.addEventListener("pointerdown",handlePointerDown);
    return () => {
      document.removeEventListener("keydown",handleKeyDown);
      document.removeEventListener("pointerdown",handlePointerDown);
    };
  },[menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    window.requestAnimationFrame(()=>triggerRef.current?.focus());
  };

  return <>
    <header ref={headerRef} className="header">
      <Link href="/" className="brand-logo" aria-label="HOTRANK home"><HotRankLogo variant="primary" priority/></Link>
      <nav className="nav" aria-label="Primary navigation">
        {primaryLinks.map(([label,href])=><Link className={active(href)&&!(href==="/"&&path!=="/")?"active":""} aria-current={active(href)&&!(href==="/"&&path!=="/")?"page":undefined} href={href} key={href}>{label}</Link>)}
      </nav>
      <div className="header-spacer"/>
      <Link href="/search" className="search-pill" aria-label="Open search"><Search size={16}/>Search by title or creator</Link>
      <button className="icon-btn" type="button" aria-label="Notifications"><Bell size={18}/></button>
      <AccountControl/>
      <button ref={triggerRef} className="icon-btn mobile-menu" type="button" aria-label={menuOpen?"Close menu":"Open menu"} aria-expanded={menuOpen} aria-controls={mobileMenuId} aria-haspopup="menu" onClick={()=>menuOpen?closeMenu():setMenuOpen(true)}>
        {menuOpen?<X size={19}/>:<Menu size={19}/>} 
      </button>
    </header>
    {menuOpen&&<nav ref={menuRef} id={mobileMenuId} className="mobile-menu-panel" aria-label="Mobile navigation" role="menu">
      {primaryLinks.map(([label,href])=><Link role="menuitem" className={active(href)&&!(href==="/"&&path!=="/")?"active":""} aria-current={active(href)&&!(href==="/"&&path!=="/")?"page":undefined} href={href} key={href} onClick={()=>window.setTimeout(closeMenu,0)}>{label}</Link>)}
    </nav>}
  </>;
}
