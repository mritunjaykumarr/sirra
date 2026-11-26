"use client";

import React from "react";
import { COPY } from "@/content";

export function MarqueeSection() {
  const phrase = "AVAILABLE ON AMAZON · FLIPKART · MEESHO · 50ML EAU DE PARFUM · “YOU'RE ALREADY THE PEAK.” · SIRRA · ";
  // Repeat to ensure seamless continuous stream across any ultrawide screen
  const stream = Array(4).fill(phrase).join(" ");

  return (
    <div className="w-full flex flex-col">
      {/* Visual Marquee Track: Clickable link to #availability */}
      <a
        href="#availability"
        title="Available on Amazon, Flipkart, and Meesho — view where to buy"
        className="group relative block w-full bg-ink text-gold py-5 md:py-6 overflow-hidden border-y border-gold/25 select-none hover:bg-[#1a1816] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <span className="sr-only">
          Available on Amazon, Flipkart, Meesho. Fine Fragrance 50ml Eau de Parfum.
        </span>
        <div
          aria-hidden="true"
          className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none whitespace-nowrap"
          style={{ animationDuration: "75s" }}
        >
          <span className="font-display italic text-[clamp(24px,3vw,44px)] tracking-wide pr-8">
            {stream}
          </span>
          <span className="font-display italic text-[clamp(24px,3vw,44px)] tracking-wide pr-8">
            {stream}
          </span>
        </div>
      </a>

      {/* Skim Strip: Three Quick Hits */}
      <div className="w-full bg-cream text-ink py-10 md:py-14 px-5 md:px-10 border-b border-ink/10">
        <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-8">
          <div className="text-center max-w-2xl">
            <p className="font-display italic text-2xl md:text-3xl text-rust mb-1.5">
              Sirra (Punjabi): the absolute peak.
            </p>
            <p className="font-sans text-sm md:text-base text-ink/75 font-normal">
              We bottled it for those who already live there.
            </p>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pt-4 border-t border-ink/10">
            {COPY.hero.skimStrip.map((hit, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center md:items-start text-center md:text-left gap-1 p-3"
              >
                <span className="font-display text-xl md:text-2xl text-ink font-semibold">
                  {hit.title}
                </span>
                <span className="font-sans text-xs md:text-sm text-ink/70">
                  {hit.desc}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-ink/50 font-medium">
              {COPY.hero.footerLine}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarqueeSection;
