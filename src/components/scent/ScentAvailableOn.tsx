"use client";

import React, { useRef } from "react";
import OutboundLink from "@/components/ui/OutboundLink";
import MarketLogo from "@/components/ui/MarketLogo";
import { Product, MarketKey, MARKETS } from "@/content";
import { useGsap, fadeUpStagger, isReducedMotion } from "@/lib/motion";

export interface ScentAvailableOnProps {
  product: Product;
  availableLogos?: Record<MarketKey, boolean>;
}

export function ScentAvailableOn({
  product,
  availableLogos,
}: ScentAvailableOnProps) {
  const containerRef = useRef<HTMLElement>(null);
  const tilesRef = useRef<HTMLDivElement>(null);

  const marketKeys: MarketKey[] = ["amazon", "flipkart", "meesho"];

  useGsap(() => {
    if (isReducedMotion()) return;

    if (tilesRef.current) {
      const tiles = tilesRef.current.querySelectorAll(".availability-tile");
      fadeUpStagger(Array.from(tiles), {
        trigger: tilesRef.current,
        start: "top 85%",
        stagger: 0.12,
      });
    }
  }, [], containerRef);

  return (
    <section
      id="available-on"
      ref={containerRef}
      className="relative z-20 w-full bg-ink text-cream py-20 md:py-32 px-5 md:px-12 border-b border-cream/15"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mb-12 md:mb-16 gap-3">
          <h2 className="font-display font-light text-[clamp(36px,4.5vw,64px)] text-cream leading-tight">
            Available on
          </h2>
          <p className="font-sans text-sm md:text-base text-cream/70 max-w-lg font-normal">
            Sirra is sold through trusted marketplaces. Pick the one you shop on.
          </p>
        </div>

        {/* 3 Availability Tiles (Same Prominence as Footer) */}
        <div
          ref={tilesRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl"
        >
          {marketKeys.map((key) => {
            const market = MARKETS[key];
            const hasLogo = availableLogos ? availableLogos[key] : market.hasLogo;

            return (
              <OutboundLink
                key={key}
                market={key}
                product={product.slug}
                data-market={key}
                aria-label={`Buy ${product.name} on ${market.name}`}
                className="availability-tile w-full bg-cream text-ink p-8 md:p-10 border border-cream/20 relative overflow-hidden flex flex-col items-center justify-between text-center min-h-[260px] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl focus-visible:-translate-y-2 focus-visible:shadow-2xl group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                {/* Gold 2px top sweep bar on hover/focus */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-0 right-0 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100 origin-left transition-transform duration-500 ease-out pointer-events-none"
                />

                {/* Centered Logo at 56px (max width 70% of tile) */}
                <div className="flex-1 w-full flex items-center justify-center">
                  <div className="h-[64px] flex items-center justify-center max-w-[70%] transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105">
                    <MarketLogo
                      market={key}
                      hasLogo={hasLogo}
                      height={56}
                      className="max-w-full object-contain"
                    />
                  </div>
                </div>

                {/* Hairline Divider */}
                <div className="w-full h-[1px] bg-ink/10 my-4" />

                {/* Bottom Action */}
                <div className="w-full flex flex-col items-center gap-3">
                  <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink/60">
                    BUY {product.name.toUpperCase()} ON {market.name.toUpperCase()}
                  </span>
                  <span className="font-sans font-bold text-xs uppercase tracking-wider px-5 py-2 rounded-full border border-ink/20 text-ink bg-transparent transition-all duration-300 group-hover:bg-ink group-hover:text-cream group-hover:border-ink group-focus-visible:bg-ink group-focus-visible:text-cream group-focus-visible:border-ink">
                    Open {market.name}
                  </span>
                </div>
              </OutboundLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ScentAvailableOn;
