"use client";

import React, { useRef } from "react";
import Wordmark from "./ui/Wordmark";
import OutboundLink from "./ui/OutboundLink";
import MarketLogo from "./ui/MarketLogo";
import { MARKETS, MarketKey } from "@/content";
import { useGsap, fadeUpStagger } from "@/lib/motion";

export function Footer() {
  const currentYear = 2026;
  const marketKeys: MarketKey[] = ["amazon", "flipkart", "meesho"];
  const tilesContainerRef = useRef<HTMLDivElement>(null);

  useGsap(() => {
    if (tilesContainerRef.current) {
      const tiles = tilesContainerRef.current.querySelectorAll(".availability-tile");
      fadeUpStagger(Array.from(tiles), {
        trigger: tilesContainerRef.current,
        start: "top 85%",
        stagger: 0.12,
      });
    }
  }, [], tilesContainerRef);

  return (
    <footer id="availability" className="bg-ink text-cream border-t border-cream/15 pt-20 md:pt-32 pb-16">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 flex flex-col gap-16 md:gap-24">
        {/* Availability Block */}
        <div className="flex flex-col items-center text-center gap-4">
          <h2 className="font-display text-[clamp(36px,4.5vw,64px)] text-cream leading-tight">
            Available on
          </h2>
          <p className="font-sans text-sm md:text-base text-cream/70 max-w-lg font-normal">
            Sirra is sold through trusted marketplaces. Pick the one you shop on.
          </p>

          {/* Three Equal Premium Cream Availability Tiles on Ink Footer */}
          <div
            ref={tilesContainerRef}
            className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-10"
          >
            {marketKeys.map((key) => {
              const market = MARKETS[key];

              return (
                <OutboundLink
                  key={key}
                  market={key}
                  data-market={key}
                  className="availability-tile w-full bg-cream text-ink p-8 md:p-10 border border-cream/20 relative overflow-hidden flex flex-col items-center justify-between text-center min-h-[260px] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl focus-visible:-translate-y-2 focus-visible:shadow-2xl group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {/* Gold 2px top sweep bar on hover/focus */}
                  <div
                    aria-hidden="true"
                    className="absolute top-0 left-0 right-0 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100 origin-left transition-transform duration-500 ease-out pointer-events-none"
                  />

                  {/* Top / Center: Centered Logo at 56px (max width 70% of tile) */}
                  <div className="flex-1 w-full flex items-center justify-center">
                    <div className="h-[64px] flex items-center justify-center max-w-[70%] transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105">
                      <MarketLogo
                        market={key}
                        height={56}
                        className="max-w-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Hairline Divider */}
                  <div className="w-full h-[1px] bg-ink/10 my-4" />

                  {/* Bottom: Label and Pill Button */}
                  <div className="w-full flex flex-col items-center gap-3">
                    <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink/60">
                      SHOP THE FULL COLLECTION
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

        {/* Brand Signoff & Copyright */}
        <div className="flex flex-col items-center gap-6 pt-12 border-t border-cream/10">
          <div className="flex flex-col items-center gap-3">
            <Wordmark size="lg" className="text-cream" />
            <p className="font-display italic text-rust text-xl md:text-2xl">
              Your Sirra.
            </p>
          </div>

          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs font-sans text-cream/45 uppercase tracking-widest">
            <span>Fine Fragrance / Eau de Parfum (50ml)</span>
            <span>&copy; {currentYear} SIRRA. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
