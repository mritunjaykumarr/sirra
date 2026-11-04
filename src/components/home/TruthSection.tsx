"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import Section from "@/components/ui/Section";
import { COPY, IMAGES } from "@/content";
import { useGsap, fadeUpStagger, maskReveal, parallax } from "@/lib/motion";

export function TruthSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const imageInnerRef = useRef<HTMLDivElement>(null);

  const spray = IMAGES["truth-spray"];

  useGsap(() => {
    if (contentRef.current) {
      const items = contentRef.current.querySelectorAll(".truth-item");
      fadeUpStagger(Array.from(items), {
        trigger: contentRef.current,
        start: "top 75%",
        stagger: 0.12,
      });
    }

    if (imageFrameRef.current) {
      maskReveal(imageFrameRef.current, {
        start: "top 75%",
      });
    }

    if (imageInnerRef.current && imageFrameRef.current) {
      parallax(imageInnerRef.current, 0.08, {
        trigger: imageFrameRef.current,
        start: "top bottom",
        end: "bottom top",
      });
    }
  }, [], sectionRef);

  return (
    <Section bg="cream" id="truth" className="overflow-hidden">
      <div
        ref={sectionRef}
        className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20 items-center"
      >
        {/* Left Column: Spray Mist Image (Desktop: 6 cols, Mobile: order-1) */}
        <div className="md:col-span-6 flex items-center justify-center">
          <div
            ref={imageFrameRef}
            className="relative w-full max-w-[540px] md:max-w-none h-[440px] sm:h-[520px] md:h-[620px] overflow-hidden shadow-xs bg-ink"
          >
            <div ref={imageInnerRef} className="absolute -top-[10%] left-0 w-full h-[120%]">
              <Image
                src={spray.src}
                alt={spray.alt}
                fill
                placeholder="blur"
                blurDataURL={spray.blurDataURL}
                quality={90}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 620px"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Copy & Truth Statement (Desktop: 6 cols, Mobile: order-2) */}
        <div ref={contentRef} className="md:col-span-6 flex flex-col justify-center">
          <div className="truth-item mb-6 md:mb-8">
            <Tag>{COPY.truth.tag}</Tag>
          </div>

          {/* Muted Archivo line */}
          <p className="truth-item font-sans text-base sm:text-lg text-ink/65 leading-relaxed max-w-xl">
            {COPY.truth.bullets[0]}
          </p>

          {/* Large Cormorant statement */}
          <h2 className="truth-item font-display text-3xl sm:text-4xl md:text-5xl text-ink leading-[1.12] my-6 max-w-xl">
            {COPY.truth.bullets[1]}
          </h2>

          {/* Gold divider rule */}
          <div className="truth-item w-20 md:w-28 h-[1px] bg-gold my-4 md:my-6" />

          {/* Two-line rust Archivo uppercase conclusion */}
          <p className="truth-item font-sans font-extrabold text-xl sm:text-2xl lg:text-3xl text-rust uppercase tracking-tight leading-snug max-w-xl">
            {COPY.truth.statement}
          </p>
        </div>
      </div>
    </Section>
  );
}

export default TruthSection;

