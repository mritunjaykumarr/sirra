"use client";

import React, { useRef } from "react";
import Tag from "@/components/ui/Tag";
import Section from "@/components/ui/Section";
import { COPY } from "@/content";
import { useGsap, fadeUp, wordReveal } from "@/lib/motion";

export function FlexSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const pullRef = useRef<HTMLDivElement>(null);

  useGsap(() => {
    if (introRef.current) {
      fadeUp(introRef.current, { start: "top 75%" });
    }
    if (pullRef.current) {
      wordReveal(pullRef.current, {
        start: "top 80%",
        end: "bottom 50%",
        scrub: 0.6,
      });
    }
  }, [], sectionRef);

  const pullWords = COPY.flex.pullStatement.split(" ");

  return (
    <Section bg="cream" id="flexes-intro">
      <div ref={sectionRef} className="flex flex-col">
        {/* Section Tag */}
        <div className="mb-10 md:mb-16">
          <Tag>{COPY.flex.tag}</Tag>
        </div>

        {/* Two-column Paragraphs with Generous Whitespace */}
        <div
          ref={introRef}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 lg:gap-24 items-start"
        >
          {/* Left Column (Desktop: 6 cols) */}
          <div className="md:col-span-6">
            <p className="font-display text-2xl sm:text-3xl md:text-4xl leading-relaxed text-ink/90 font-normal">
              {COPY.flex.paragraphs[0]}
            </p>
          </div>

          {/* Right Column (Desktop: 6 cols) */}
          <div className="md:col-span-6 flex flex-col gap-6 pt-1">
            <p className="font-sans text-base sm:text-lg text-ink/80 leading-relaxed font-normal">
              {COPY.flex.paragraphs[1]}
            </p>
            <p className="font-sans text-base sm:text-lg text-ink/80 leading-relaxed font-normal">
              {COPY.flex.paragraphs[2]}
            </p>
          </div>
        </div>

        {/* Hairline Rust Rule */}
        <div className="w-full h-[1px] bg-rust/35 my-14 md:my-20" />

        {/* Pull Statement with Word-by-word Scrub Reveal */}
        <div ref={pullRef} className="w-full">
          <h2
            className="font-sans font-extrabold uppercase tracking-tight text-ink text-[clamp(44px,7.5vw,128px)] leading-[0.92] select-none"
            aria-label={COPY.flex.pullStatement}
          >
            {pullWords.map((word, idx) => (
              <span
                key={idx}
                className="reveal-word inline-block mr-[0.22em] transition-opacity duration-150"
              >
                {word}
              </span>
            ))}
          </h2>
        </div>
      </div>
    </Section>
  );
}

export default FlexSection;

