"use client";

import {createBrowserClient} from "@supabase/ssr";

const projectRef = "csuejshnycgbfvtjbxoq";
const projectUrl = `https://${projectRef}.supabase.co`;

export function createSupabaseBrowserClient() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) throw new Error("HOTRANK Supabase browser configuration is missing");
  return createBrowserClient(projectUrl, key);
}
