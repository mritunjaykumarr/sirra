"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import { COPY, IMAGES } from "@/content";
import { useGsap, parallax, wordReveal, maskReveal } from "@/lib/motion";

export function MantraSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const imageInnerRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLHeadingElement>(null);

  const bottle = IMAGES["mantra-bottle"];
  const statementWords = COPY.mantra.statement.split(" ");

  useGsap(() => {
    if (imageFrameRef.current) {
      maskReveal(imageFrameRef.current, { start: "top 75%" });
    }

    if (imageInnerRef.current && imageFrameRef.current) {
      parallax(imageInnerRef.current, 0.06, {
        trigger: imageFrameRef.current,
        start: "top bottom",
        end: "bottom top",
      });
    }

    if (statementRef.current) {
      wordReveal(statementRef.current, {
        start: "top 80%",
        end: "bottom 55%",
        scrub: 0.6,
      });
    }
  }, [], sectionRef);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-cream py-18 md:py-30 px-5 md:px-10 overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-0 items-stretch shadow-md">
        {/* Left Half: mantra-bottle.jpg with Parallax 0.06 */}
        <div className="md:col-span-6 flex items-center justify-center bg-ink">
          <div
            ref={imageFrameRef}
            className="relative w-full h-[440px] sm:h-[520px] md:h-full min-h-[500px] lg:min-h-[640px] overflow-hidden"
          >
            <div ref={imageInnerRef} className="absolute -top-[10%] left-0 w-full h-[120%]">
              <Image
                src={bottle.src}
                alt={bottle.alt}
                fill
                placeholder="blur"
                blurDataURL={bottle.blurDataURL}
                quality={90}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 680px"
                className="object-cover object-center grayscale"
              />
            </div>
          </div>
        </div>

        {/* Right Half: Solid Gold (#E0A52B) Background */}
        <div className="md:col-span-6 bg-gold text-ink p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          {/* Tag "THE BRAND MANTRA" in ink */}
          <div className="mb-8">
            <Tag color="ink">{COPY.mantra.tag}</Tag>
          </div>

          {/* Statement in Archivo 800 uppercase with wordReveal */}
          <h2
            ref={statementRef}
            className="font-sans font-extrabold text-2xl sm:text-3xl lg:text-4xl text-ink uppercase tracking-tight leading-[1.12] mb-6 select-none"
            aria-label={COPY.mantra.statement}
          >
            {statementWords.map((word, idx) => (
              <span
                key={idx}
                className="reveal-word inline-block mr-[0.22em] transition-opacity duration-150"
              >
                {word}
              </span>
            ))}
          </h2>

          {/* Ink Divider Rule */}
          <div className="w-20 md:w-28 h-[1px] bg-ink my-4 md:my-6" />

          {/* Cormorant Italic Lines */}
          <p className="font-display italic text-2xl sm:text-3xl lg:text-4xl text-ink leading-snug mb-6">
            {COPY.mantra.italicLines}
          </p>

          {/* "YOUR SIRRA." in Heartthrob Colour */}
          <div>
            <span className="font-sans font-extrabold text-heartthrob uppercase tracking-[0.2em] text-lg sm:text-xl lg:text-2xl">
              {COPY.mantra.baseline}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MantraSection;

