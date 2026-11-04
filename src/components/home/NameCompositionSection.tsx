"use client";

import React, { useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Label from "@/components/ui/Label";
import Section from "@/components/ui/Section";
import { COPY, IMAGES } from "@/content";
import { useGsap, fadeUp, maskReveal, isReducedMotion } from "@/lib/motion";
import gsap from "gsap";

export function NameCompositionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const centerColRef = useRef<HTMLDivElement>(null);
  const stoneImageRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const goldRuleRef = useRef<HTMLDivElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const headingCreamRef = useRef<HTMLHeadingElement>(null);

  const stone = IMAGES["name-stone"];

  const updateClipPath = useCallback(() => {
    if (!centerColRef.current || !headingWrapperRef.current || !headingCreamRef.current) return;
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      // Mobile: vertically stacked, no horizontal color-flip needed
      headingCreamRef.current.style.clipPath = "polygon(0 0, 0 0, 0 0, 0 0)";
      return;
    }

    const colRect = centerColRef.current.getBoundingClientRect();
    const headingRect = headingWrapperRef.current.getBoundingClientRect();

    const left = colRect.left - headingRect.left;
    const right = colRect.right - headingRect.left;

    if (right <= 0 || left >= headingRect.width + 100) {
      headingCreamRef.current.style.clipPath = "polygon(0 0, 0 0, 0 0, 0 0)";
    } else {
      headingCreamRef.current.style.clipPath = `polygon(${left}px -60px, ${right}px -60px, ${right}px calc(100% + 60px), ${left}px calc(100% + 60px))`;
    }
  }, []);

  useEffect(() => {
    updateClipPath();
    window.addEventListener("resize", updateClipPath);
    return () => window.removeEventListener("resize", updateClipPath);
  }, [updateClipPath]);

  useGsap(() => {
    if (leftColRef.current) {
      fadeUp(leftColRef.current, { start: "top 75%" });
    }
    if (centerColRef.current) {
      fadeUp(centerColRef.current, { start: "top 75%", delay: 0.15 });
    }

    // Gold rule draws in scaleX 0 to 1 on enter
    if (goldRuleRef.current) {
      if (isReducedMotion()) {
        gsap.set(goldRuleRef.current, { scaleX: 1 });
      } else {
        gsap.fromTo(
          goldRuleRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: centerColRef.current,
              start: "top 75%",
            },
          }
        );
      }
    }

    // Scrubbed horizontal drift of about 4% on the word (transform only)
    if (headingWrapperRef.current && sectionRef.current) {
      if (!isReducedMotion()) {
        gsap.to(headingWrapperRef.current, {
          xPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            onUpdate: updateClipPath,
          },
        });
      }
    }

    // Stone image keeps maskReveal and gets a 1px gold outline offset 8px fading in after reveal
    if (stoneImageRef.current) {
      maskReveal(stoneImageRef.current, { start: "top 75%" });
    }

    if (outlineRef.current) {
      if (isReducedMotion()) {
        gsap.set(outlineRef.current, { opacity: 1 });
      } else {
        gsap.fromTo(
          outlineRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.8,
            delay: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: stoneImageRef.current,
              start: "top 75%",
            },
          }
        );
      }
    }
  }, [updateClipPath], sectionRef);

  return (
    <Section bg="cream" id="name" className="overflow-visible py-16 md:py-24">
      <div
        ref={sectionRef}
        className="@container grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-0 items-stretch relative"
      >
        {/* Column 1: Cream Column (Desktop: 5 cols, Left) */}
        <div
          ref={leftColRef}
          className="md:col-span-5 flex flex-col justify-center pr-0 md:pr-4 lg:pr-6 relative z-20 mb-2 md:mb-0"
        >
          <div className="mb-3 md:mb-4">
            <Label>{COPY.name.label}</Label>
          </div>

          {/* Huge Cormorant "SIRRA." overlapping into the dark column */}
          <div ref={headingWrapperRef} className="relative z-30 select-none pb-1">
            {/* Bottom layer: ink text */}
            <h2 className="font-display font-medium text-ink uppercase tracking-tight text-[clamp(44px,11cqi,160px)] leading-[0.88] whitespace-nowrap">
              {COPY.name.headline}
            </h2>

            {/* Top layer: cream text, aria-hidden, clipped to the dark column */}
            <h2
              ref={headingCreamRef}
              aria-hidden="true"
              style={{ clipPath: "polygon(0 0, 0 0, 0 0, 0 0)" }}
              className="absolute inset-0 font-display font-medium text-cream uppercase tracking-tight text-[clamp(44px,11cqi,160px)] leading-[0.88] whitespace-nowrap pointer-events-none select-none"
            >
              {COPY.name.headline}
            </h2>
          </div>
        </div>

        {/* Column 2: Ink Column (Desktop: 4 cols, Center) */}
        <div
          ref={centerColRef}
          className="md:col-span-4 bg-ink text-cream p-7 sm:p-9 lg:p-12 flex flex-col justify-center relative z-10 shadow-lg border border-ink/20"
        >
          <div
            ref={goldRuleRef}
            className="w-16 h-[1px] bg-gold mb-6 md:mb-8 origin-left"
          />

          <p className="font-display italic text-gold text-xl sm:text-2xl lg:text-3xl leading-snug">
            {COPY.name.goldLines}
          </p>
        </div>

        {/* Column 3: Stone Image Column (Desktop: 3 cols, Right) */}
        <div className="md:col-span-3 flex items-center justify-center p-2 sm:p-3">
          <div className="relative w-full max-w-[420px] md:max-w-none h-[420px] sm:h-[480px] md:h-full min-h-[440px]">
            {/* 1px gold outline offset 8px that fades in after reveal */}
            <div
              ref={outlineRef}
              className="absolute -inset-2 border border-gold pointer-events-none opacity-0 z-20"
              aria-hidden="true"
            />

            <div
              ref={stoneImageRef}
              className="relative w-full h-full overflow-hidden shadow-xs bg-ink/10 z-10"
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
      </div>
    </Section>
  );
}

export default NameCompositionSection;
