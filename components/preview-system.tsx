"use client";
import {useEffect} from "react";
export function PreviewSystem() { useEffect(() => { const handler = () => { if (document.hidden) document.querySelectorAll("video").forEach(video => video.pause()); }; document.addEventListener("visibilitychange", handler); return () => document.removeEventListener("visibilitychange", handler); }, []); return null; }
