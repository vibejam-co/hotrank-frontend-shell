import Image from "next/image";

export type HotRankLogoProps = {
  variant?: "primary" | "light" | "iconPink" | "iconWhite" | "iconBlack";
  priority?: boolean;
  className?: string;
  alt?: string;
};

const artwork = {
  primary: "/brand/hotrank/v2/hotrank-wordmark-dark-trimmed.png",
  light: "/brand/hotrank/v2/hotrank-light.png",
  iconPink: "/brand/hotrank/v2/hotrank-icon-pink-trimmed.png",
  iconWhite: "/brand/hotrank/v2/hotrank-icon-white.png",
  iconBlack: "/brand/hotrank/v2/hotrank-icon-black.png",
} as const;

const dimensions = {
  primary: { width: 998, height: 243 },
  light: { width: 1536, height: 1024 },
  iconPink: { width: 680, height: 635 },
  iconWhite: { width: 1536, height: 1024 },
  iconBlack: { width: 1536, height: 1024 },
} as const;

export function HotRankLogo({
  variant = "primary",
  priority = false,
  className = "",
  alt = variant.startsWith("icon") ? "HOTRANK mark" : "HOTRANK",
}: HotRankLogoProps) {
  return (
    <Image
      src={artwork[variant]}
      alt={alt}
      width={dimensions[variant].width}
      height={dimensions[variant].height}
      unoptimized
      priority={priority}
      className={["hotrank-logo", `hotrank-logo-${variant}`, className].filter(Boolean).join(" ")}
    />
  );
}
