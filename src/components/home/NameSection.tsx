"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import Label from "@/components/ui/Label";
import Section from "@/components/ui/Section";
import { COPY, IMAGES } from "@/content";
import { useGsap, fadeUp, maskReveal } from "@/lib/motion";

export function NameSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const centerColRef = useRef<HTMLDivElement>(null);
  const stoneImageRef = useRef<HTMLDivElement>(null);

  const stone = IMAGES["name-stone"];

  useGsap(() => {
    if (leftColRef.current) {
      fadeUp(leftColRef.current, { start: "top 75%" });
    }
    if (centerColRef.current) {
      fadeUp(centerColRef.current, { start: "top 75%", delay: 0.15 });
    }
    if (stoneImageRef.current) {
      maskReveal(stoneImageRef.current, { start: "top 75%" });
    }
  }, [], sectionRef);

  return (
    <Section bg="cream" id="name" className="overflow-visible">
      <div
        ref={sectionRef}
        className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-0 items-stretch relative"
      >
        {/* Column 1: Cream Column (Desktop: 5 cols, Left) */}
        <div
          ref={leftColRef}
          className="md:col-span-5 flex flex-col justify-center pr-0 md:pr-4 lg:pr-8 relative z-20"
        >
          <div className="mb-6">
            <Tag>{COPY.name.tag}</Tag>
          </div>

          <div className="mb-4">
            <Label>{COPY.name.label}</Label>
          </div>

          {/* Huge Cormorant "SIRRA." overlapping into the middle column */}
          <h2 className="font-display font-medium text-ink uppercase tracking-tight text-[clamp(80px,11vw,200px)] leading-[0.88] select-none md:-mr-16 lg:-mr-24 relative z-30 drop-shadow-xs">
            {COPY.name.headline}
          </h2>

          <p className="font-sans font-bold text-lg sm:text-xl lg:text-2xl text-ink leading-snug mt-6 max-w-md">
            {COPY.name.sub}
          </p>
        </div>

        {/* Column 2: Ink Column (Desktop: 4 cols, Center) */}
        <div
          ref={centerColRef}
          className="md:col-span-4 bg-ink text-cream p-8 sm:p-10 lg:p-12 flex flex-col justify-center relative z-10 shadow-lg border border-ink/20"
        >
          <p className="font-sans text-sm sm:text-base text-cream/90 leading-relaxed font-normal">
            {COPY.name.definition}
          </p>

          <div className="w-16 h-[1px] bg-gold my-6 md:my-8" />

          <p className="font-display italic text-gold text-lg sm:text-xl lg:text-2xl leading-snug">
            {COPY.name.goldLines}
          </p>
        </div>

        {/* Column 3: Stone Image Column (Desktop: 3 cols, Right) */}
        <div className="md:col-span-3 flex items-center justify-center">
          <div
            ref={stoneImageRef}
            className="relative w-full max-w-[420px] md:max-w-none h-[480px] sm:h-[540px] md:h-full min-h-[500px] overflow-hidden shadow-xs bg-ink/10"
          >
            <Image
              src={stone.src}
              alt={stone.alt}
              fill
              placeholder="blur"
              blurDataURL={stone.blurDataURL}
              quality={90}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 30vw, 360px"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

export default NameSection;

