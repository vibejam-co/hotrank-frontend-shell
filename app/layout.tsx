import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { PreviewSystem } from "@/components/preview-system";

export const metadata: Metadata = { title: "HOTRANK — Ranked AI media", description: "Discover the clips moving culture." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><PreviewSystem /><Header />{children}</body></html>;
}
