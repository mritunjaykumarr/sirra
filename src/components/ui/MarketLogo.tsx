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

  if (isAvailable && src) {
    const isSvg = src.toLowerCase().endsWith(".svg");
    const imgAspect = m.logoWidth / m.logoHeight;
    const visibleH = Math.round(baseH * scale);
    const visibleW = width ?? Math.round(visibleH * imgAspect);

    return (
      <span
        className={`market-logo-wrapper relative inline-flex items-center justify-center shrink-0 ${className}`}
        style={{ width: `${visibleW}px`, height: `${baseH}px` }}
      >
        <Image
          src={src}
          alt={m.name}
          width={visibleW}
          height={visibleH}
          unoptimized={isSvg}
          className="object-contain shrink-0 max-h-none"
          style={{
            width: `${visibleW}px`,
            height: `${visibleH}px`,
          }}
        />
      </span>
    );
  }

  // Missing logo text fallback:
  if (variant === "compact") {
    return (
      <span
        className={`font-sans font-bold uppercase tracking-[0.12em] text-[11px] leading-none truncate text-ink ${className}`}
      >
        {m.name}
      </span>
    );
  }

  return (
    <span
      className={`font-sans font-extrabold uppercase tracking-wider text-[28px] leading-tight text-ink ${className}`}
    >
      {m.name}
    </span>
  );
}

export default MarketLogo;
