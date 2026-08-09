import Image from "next/image";

type HotRankLogoProps = {
  variant?: "wordmark" | "icon";
  theme?: "dark" | "light";
  monochrome?: boolean;
  className?: string;
  priority?: boolean;
};

export function HotRankLogo({
  variant = "wordmark",
  theme = "dark",
  monochrome = false,
  className = "",
  priority = false,
}: HotRankLogoProps) {
  const src =
    variant === "icon"
      ? monochrome
        ? theme === "dark"
          ? "/brand/hotrank-icon-white.svg"
          : "/brand/hotrank-icon-black.svg"
        : "/brand/hotrank-icon-pink.svg"
      : monochrome
        ? theme === "dark"
          ? "/brand/hotrank-wordmark-white.svg"
          : "/brand/hotrank-wordmark-black.svg"
        : theme === "dark"
          ? "/brand/hotrank-wordmark-dark.svg"
          : "/brand/hotrank-wordmark-light.svg";

  const logoClassName = [
    variant === "wordmark" ? "hotrank-logo-wordmark" : "hotrank-logo-icon",
    className,
  ].filter(Boolean).join(" ");

  return (
    <Image
      src={src}
      alt={variant === "wordmark" ? "HOTRANK" : "HOTRANK mark"}
      width={variant === "wordmark" ? 920 : 100}
      height={variant === "wordmark" ? 170 : 100}
      className={logoClassName}
      priority={priority}
    />
  );
}
