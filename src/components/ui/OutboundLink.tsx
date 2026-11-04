"use client";

import React from "react";
import { MARKETS, MarketKey } from "@/content/markets";
import { buildOutboundUrl } from "@/lib/outbound";

export interface OutboundLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  market: MarketKey | string;
  product?: string;
  url?: string;
  className?: string;
  children: React.ReactNode;
}

export function OutboundLink({
  market,
  product,
  url,
  className = "",
  children,
  onClick,
  ...rest
}: OutboundLinkProps) {
  // Determine base URL from prop or MARKETS constant
  const baseUrl =
    url || (market in MARKETS ? MARKETS[market as MarketKey]?.url : "#") || "#";

  const destinationUrl = buildOutboundUrl(baseUrl, {
    product,
    market,
  });

  const isPlaceholder = !destinationUrl || destinationUrl === "#";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isPlaceholder) {
      e.preventDefault();
    } else {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sirra:outbound", {
            detail: {
              market,
              product,
              url: destinationUrl,
            },
          })
        );
      }
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <a
      href={destinationUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      data-market={market}
      className={`inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}

export default OutboundLink;

