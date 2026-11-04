"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Label from "@/components/ui/Label";
import { COPY, IMAGES } from "@/content";
import { useGsap, fadeUpStagger, maskReveal, isReducedMotion } from "@/lib/motion";

export function ManifestoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const portraitFrameRef = useRef<HTMLDivElement>(null);

  const voicePortrait = IMAGES["voice-portrait"];

  // The four persona manifesto lines
  const personaLines = [
    "The wanderer who owns a new city before learning the language.",
    "The one whose stillness says more than a room full of noise.",
    "The one whose accent, roots, and block are the loudest flex in the room.",
    "The one who loves fully, without apologizing for how much.",
  ];

  useGsap(() => {
    if (isReducedMotion()) return;

    if (columnRef.current) {
      const blocks = columnRef.current.querySelectorAll(".manifesto-block");
      fadeUpStagger(Array.from(blocks), {
        trigger: columnRef.current,
        start: "top 75%",
        stagger: 0.14,
      });
    }

    if (portraitFrameRef.current) {
      maskReveal(portraitFrameRef.current, {
        trigger: portraitFrameRef.current,
        start: "top 80%",
      });
    }
  }, [], sectionRef);

  return (
    <section
      id="manifesto"
      ref={sectionRef}
      className="w-full bg-ink text-cream py-20 md:py-32 px-5 md:px-10 overflow-hidden border-b border-cream/15"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col items-center">
        {/* Centered Column: max-w-[720px] */}
        <div
          ref={columnRef}
          className="w-full max-w-[720px] flex flex-col gap-8 md:gap-10 text-center"
        >
          {/* Label */}
          <div className="manifesto-block flex justify-center">
            <Label className="text-gold tracking-[0.25em]">
              {COPY.manifesto.label}
            </Label>
          </div>

          {/* Block 1 */}
          <p className="manifesto-block font-display text-2xl sm:text-3xl md:text-4xl text-cream font-light leading-snug">
            {COPY.manifesto.blocks[0]}
          </p>

          {/* Block 2 */}
          <p className="manifesto-block font-sans text-sm sm:text-base md:text-lg text-cream/80 font-normal leading-relaxed">
            {COPY.manifesto.blocks[1]}
          </p>

          {/* Block 3 */}
          <p className="manifesto-block font-sans text-sm sm:text-base md:text-lg text-cream/80 font-normal leading-relaxed">
            {COPY.manifesto.blocks[2]}
          </p>

          {/* Lead-in line */}
          <p className="manifesto-block font-display italic text-xl sm:text-2xl text-cream/90 font-medium pt-2">
            {COPY.manifesto.blocks[3]}
          </p>

          {/* The Four Persona Lines with Gold Dividing Rules */}
          <div className="manifesto-block w-full flex flex-col gap-4 py-4">
            {personaLines.map((line, idx) => (
              <React.Fragment key={idx}>
                <div className="w-16 h-[1px] bg-gold/60 mx-auto" />
                <p className="font-display italic text-xl sm:text-2xl md:text-3xl text-cream px-4 leading-snug">
                  {line}
                </p>
              </React.Fragment>
            ))}
            <div className="w-16 h-[1px] bg-gold/60 mx-auto" />
          </div>
        </div>

        {/* Closing Lines & Voice Portrait Area */}
        <div className="w-full max-w-[960px] mt-16 pt-12 border-t border-cream/15 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Closing Typography */}
          <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <h3 className="font-sans font-extrabold text-2xl sm:text-3xl md:text-4xl tracking-wider uppercase text-cream">
              {COPY.manifesto.closingLines.headline}
            </h3>
            <p className="font-display italic text-rust text-3xl sm:text-4xl md:text-5xl">
              {COPY.manifesto.closingLines.baseline}
            </p>
          </div>

          {/* Voice Portrait (beside on desktop, below on mobile, max 1.3x native) */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div
              ref={portraitFrameRef}
              className="relative w-full max-w-[340px] aspect-[3/4] overflow-hidden shadow-2xl border border-cream/20 bg-ink/40"
            >
              <Image
                src={voicePortrait.src}
                alt={voicePortrait.alt}
                fill
                quality={90}
                placeholder="blur"
                blurDataURL={voicePortrait.blurDataURL}
                sizes="(max-width: 768px) 300px, 340px"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ManifestoSection;

