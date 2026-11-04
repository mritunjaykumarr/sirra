"use client";

import React from "react";
import { COPY } from "@/content";

export function MarqueeSection() {
  const phrase = `${COPY.hero.tagline} · ${COPY.hero.baseline} · `;
  // Repeat to ensure seamless continuous stream across any ultrawide screen
  const stream = Array(6).fill(phrase).join(" ");

  return (
    <div className="relative w-full bg-ink text-gold py-5 md:py-7 overflow-hidden border-y border-gold/25 select-none">
      {/* Screen reader only single accessible text */}
      <span className="sr-only">
        {COPY.hero.tagline} {COPY.hero.baseline}
      </span>

      {/* Visual Marquee Track */}
      <div
        aria-hidden="true"
        className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none whitespace-nowrap"
      >
        <span className="font-display italic text-[clamp(28px,3.5vw,56px)] tracking-wide pr-8">
          {stream}
        </span>
        <span className="font-display italic text-[clamp(28px,3.5vw,56px)] tracking-wide pr-8">
          {stream}
        </span>
      </div>
    </div>
  );
}

export default MarqueeSection;

