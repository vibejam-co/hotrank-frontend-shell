import Image from "next/image";

type HotRankLogoProps = {
  variant?: "lockup" | "wordmark" | "icon";
  theme?: "dark" | "light";
  monochrome?: boolean;
  className?: string;
  priority?: boolean;
};

export function HotRankLogo({
  variant = "lockup",
  theme = "dark",
  monochrome = false,
  className = "",
  priority = false,
}: HotRankLogoProps) {
  const iconSrc =
    monochrome
      ? theme === "dark"
        ? "/brand/hotrank-icon-white.svg"
        : "/brand/hotrank-icon-black.svg"
      : "/brand/hotrank-icon-pink.svg";
  const wordmarkSrc =
    variant === "lockup"
      ? monochrome
        ? theme === "dark"
          ? "/brand/hotrank-wordmark-complete-white.svg"
          : "/brand/hotrank-wordmark-complete-black.svg"
        : theme === "dark"
          ? "/brand/hotrank-wordmark-complete-dark.svg"
          : "/brand/hotrank-wordmark-complete-light.svg"
      : variant === "wordmark"
        ? monochrome
          ? theme === "dark"
            ? "/brand/hotrank-wordmark-white.svg"
            : "/brand/hotrank-wordmark-black.svg"
          : theme === "dark"
            ? "/brand/hotrank-wordmark-dark.svg"
            : "/brand/hotrank-wordmark-light.svg"
        : "";
  const src =
    variant === "icon"
      ? iconSrc
      : wordmarkSrc;

  const logoClassName = [
    variant === "lockup"
      ? "hotrank-logo-lockup"
      : variant === "wordmark"
        ? "hotrank-logo-wordmark"
        : "hotrank-logo-icon",
    className,
  ].filter(Boolean).join(" ");

  if (variant === "lockup") {
    return (
      <span className={logoClassName} aria-label="HOTRANK">
        <Image
          src={iconSrc}
          alt=""
          width={100}
          height={100}
          className="hotrank-logo-lockup-mark"
          priority={priority}
        />
        <Image
          src={wordmarkSrc}
          alt="HOTRANK"
          width={620}
          height={170}
          className="hotrank-logo-lockup-wordmark"
          priority={priority}
        />
      </span>
    );
  }

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
