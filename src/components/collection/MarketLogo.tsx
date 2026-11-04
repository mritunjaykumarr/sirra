"use client";

import React from "react";
import OutboundLink from "@/components/ui/OutboundLink";
import MarketLogoUi from "@/components/ui/MarketLogo";
import { MarketKey } from "@/content";

export interface MarketLogoProps {
  market: MarketKey;
  product?: string;
  className?: string;
}

export function MarketLogo({ market, product, className = "" }: MarketLogoProps) {
  return (
    <OutboundLink
      market={market}
      product={product}
      aria-label={`Buy on ${market}`}
      className={`flex-1 min-w-0 h-[40px] bg-cream border border-ink/15 text-ink flex items-center justify-center px-2 transition-all duration-200 hover:-translate-y-0.5 ${className}`}
    >
      <div className="flex items-center justify-center max-w-[70%] h-[18px]">
        <MarketLogoUi market={market} height={18} variant="compact" />
      </div>
    </OutboundLink>
  );
}

export default MarketLogo;
