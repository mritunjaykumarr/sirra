import React from "react";
import Image from "next/image";
import { MARKETS, MarketKey } from "@/content/markets";

export interface MarketLogoProps {
  market: MarketKey;
  className?: string;
  hasLogo?: boolean;
  logoSrc?: string;
  height?: number;
  width?: number;
  variant?: "default" | "compact";
}

export function MarketLogo({
  market,
  className = "",
  hasLogo,
  logoSrc,
  height,
  width,
  variant = "default",
}: MarketLogoProps) {
  const m = MARKETS[market];
  if (!m) return null;

  const isAvailable = hasLogo !== undefined ? hasLogo : m.hasLogo;
  const src = logoSrc || m.logo;
  const baseH = height ?? (variant === "compact" ? 18 : 56);
  const scale = m.heightScale ?? 1.0;
  const h = Math.round(baseH * scale);
  const w =
    width ??
    (m.logoHeight && m.logoWidth ? Math.round((h / m.logoHeight) * m.logoWidth) : 160);

  if (isAvailable && src) {
    const isSvg = src.toLowerCase().endsWith(".svg");

    return (
      <Image
        src={src}
        alt={m.name}
        width={w}
        height={h}
        unoptimized={isSvg}
        className={`object-contain max-w-full ${className}`}
        style={{ height: `${h}px`, width: "auto" }}
      />
    );
  }

  // Missing logo text fallback:
  // Compact style for collection chips: Archivo 700, 11px, uppercase, tracking 0.12em
  if (variant === "compact") {
    return (
      <span
        className={`font-sans font-bold uppercase tracking-[0.12em] text-[11px] leading-none truncate text-ink ${className}`}
      >
        {m.name}
      </span>
    );
  }

  // Default large style for footer tiles: Archivo 800, 28px
  return (
    <span
      className={`font-sans font-extrabold uppercase tracking-wider text-[28px] leading-tight text-ink ${className}`}
    >
      {m.name}
    </span>
  );
}

export default MarketLogo;
