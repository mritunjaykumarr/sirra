"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import { COPY, IMAGES } from "@/content";
import { useGsap, isReducedMotion, fadeUpStagger } from "@/lib/motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function IntroStatementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const headlineLine1Ref = useRef<HTMLSpanElement>(null);
  const headlineLine2Ref = useRef<HTMLSpanElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const leftPortraitRef = useRef<HTMLDivElement>(null);
  const rightPortraitRef = useRef<HTMLDivElement>(null);
  const leftImgRef = useRef<HTMLDivElement>(null);
  const rightImgRef = useRef<HTMLDivElement>(null);
  const factsRef = useRef<HTMLDivElement>(null);

  useGsap(() => {
    if (!sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    if (isReducedMotion()) {
      if (watermarkRef.current) gsap.set(watermarkRef.current, { xPercent: 0, opacity: 1 });
      if (headlineLine1Ref.current) gsap.set(headlineLine1Ref.current, { yPercent: 0 });
      if (headlineLine2Ref.current) gsap.set(headlineLine2Ref.current, { yPercent: 0 });
      if (underlineRef.current) gsap.set(underlineRef.current, { scaleX: 1 });
      if (leftPortraitRef.current) gsap.set(leftPortraitRef.current, { clipPath: "inset(0 0 0% 0)", opacity: 1 });
      if (rightPortraitRef.current) gsap.set(rightPortraitRef.current, { clipPath: "inset(0 0 0% 0)", opacity: 1 });
      return;
    }

    // 1. Watermark horizontal scrubbed drift (~6%)
    if (watermarkRef.current) {
      gsap.fromTo(
        watermarkRef.current,
        { xPercent: -3 },
        {
          xPercent: 3,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }

    // 2. Headline masked reveal (translateY 110% to 0, 0.9s power3.out, 0.12s stagger) + underline draw
    const lines = [headlineLine1Ref.current, headlineLine2Ref.current].filter(Boolean);
    if (lines.length > 0) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: lines[0],
          start: "top 80%",
        },
      });

      tl.fromTo(
        lines,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
        }
      );

      if (underlineRef.current) {
        tl.fromTo(
          underlineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        );
      }
    }

    // 3. Flanking portraits mask reveals + counter parallax
    if (leftPortraitRef.current) {
      gsap.fromTo(
        leftPortraitRef.current,
        { clipPath: "inset(0 0 100% 0)", opacity: 0 },
        {
          clipPath: "inset(0 0 0% 0)",
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: leftPortraitRef.current,
            start: "top 75%",
          },
        }
      );

      if (leftImgRef.current) {
        gsap.fromTo(
          leftImgRef.current,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    }

    if (rightPortraitRef.current) {
      gsap.fromTo(
        rightPortraitRef.current,
        { clipPath: "inset(0 0 100% 0)", opacity: 0 },
        {
          clipPath: "inset(0 0 0% 0)",
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          delay: 0.15,
          scrollTrigger: {
            trigger: rightPortraitRef.current,
            start: "top 75%",
          },
        }
      );

      if (rightImgRef.current) {
        gsap.fromTo(
          rightImgRef.current,
          { yPercent: 8 },
          {
            yPercent: -8,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    }

    // 4. Facts strip fade up stagger
    if (factsRef.current) {
      const items = factsRef.current.querySelectorAll(".fact-col");
      fadeUpStagger(Array.from(items), {
        trigger: factsRef.current,
        start: "top 85%",
        stagger: 0.12,
      });
    }
  }, [], sectionRef);

  const coverImg = IMAGES["cover-portrait"];
  const womanImg = IMAGES["snapshot-woman"];

  return (
    <section
      ref={sectionRef}
      id="intro"
      className="relative w-full bg-cream overflow-hidden py-20 md:py-[140px]"
    >
      {/* Background outlined giant 'SIRRA' watermark drifting horizontally */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden z-0"
      >
        <span
          ref={watermarkRef}
          style={{
            WebkitTextStroke: "1px rgba(20, 19, 18, 0.08)",
            color: "transparent",
            letterSpacing: "0.2em",
          }}
          className="font-display font-normal text-[clamp(160px,28vw,420px)] leading-none uppercase whitespace-nowrap pl-[0.2em]"
        >
          SIRRA
        </span>
      </div>

      <div className="relative max-w-[1440px] mx-auto px-5 md:px-10 z-10">
        {/* Tablet / Mobile Overlapping Pair (above Tag) */}
        <div className="flex lg:hidden items-center justify-center mb-8">
          <div className="relative flex items-center justify-center -space-x-8">
            <div className="relative w-[130px] sm:w-[140px] aspect-[3/4] overflow-hidden shadow-lg border border-gold/30 z-10">
              <Image
                src={coverImg.src}
                alt={coverImg.alt}
                fill
                sizes="140px"
                placeholder="blur"
                blurDataURL={coverImg.blurDataURL}
                className="object-cover object-center"
              />
            </div>
            <div className="relative w-[130px] sm:w-[140px] aspect-[3/4] overflow-hidden shadow-xl border border-gold/40 z-20 translate-y-3">
              <Image
                src={womanImg.src}
                alt={womanImg.alt}
                fill
                sizes="140px"
                placeholder="blur"
                blurDataURL={womanImg.blurDataURL}
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* Central Content Container with Desktop Flanking Portraits */}
        <div className="relative max-w-[960px] mx-auto flex flex-col items-center text-center">
          {/* Tag */}
          <div className="mb-6 md:mb-8">
            <Tag>{COPY.name.tag}</Tag>
          </div>

          {/* Desktop Left Portrait: 40px above headline top, 1px gold outline offset 10px */}
          <div
            ref={leftPortraitRef}
            aria-hidden="true"
            className="hidden lg:block absolute -left-[220px] xl:-left-[260px] -top-10 w-[220px] xl:w-[240px] h-[293px] xl:h-[320px] overflow-hidden outline outline-1 outline-gold outline-offset-[10px] z-10 shadow-2xl bg-ink/10"
          >
            <div ref={leftImgRef} className="relative w-full h-[120%] -top-[10%]">
              <Image
                src={coverImg.src}
                alt={coverImg.alt}
                fill
                sizes="240px"
                placeholder="blur"
                blurDataURL={coverImg.blurDataURL}
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Desktop Right Portrait: 80px lower, 1px gold outline offset 10px */}
          <div
            ref={rightPortraitRef}
            aria-hidden="true"
            className="hidden lg:block absolute -right-[220px] xl:-right-[260px] top-20 w-[220px] xl:w-[240px] h-[293px] xl:h-[320px] overflow-hidden outline outline-1 outline-gold outline-offset-[10px] z-10 shadow-2xl bg-ink/10"
          >
            <div ref={rightImgRef} className="relative w-full h-[120%] -top-[10%]">
              <Image
                src={womanImg.src}
                alt={womanImg.alt}
                fill
                sizes="240px"
                placeholder="blur"
                blurDataURL={womanImg.blurDataURL}
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Large Cormorant Headline Revealed from Masked Line Boxes */}
          <h2 className="font-display text-[clamp(36px,5.2vw,76px)] text-ink leading-[1.1] tracking-tight mb-8">
            <span className="block overflow-hidden py-1">
              <span ref={headlineLine1Ref} className="block">
                Punjabi for the absolute{" "}
                <span className="relative inline-block">
                  peak.
                  <span
                    ref={underlineRef}
                    aria-hidden="true"
                    className="absolute left-0 bottom-1 sm:bottom-2 h-[2px] bg-gold w-full origin-left scale-x-0"
                  />
                </span>
              </span>
            </span>
            <span className="block overflow-hidden py-1">
              <span ref={headlineLine2Ref} className="block italic text-rust">
                The best there is.
              </span>
            </span>
          </h2>

          {/* Definition Paragraph (Archivo 18px) */}
          <p className="font-sans text-base md:text-lg lg:text-[18px] text-ink/80 leading-relaxed max-w-2xl mb-12 font-normal">
            {COPY.name.definition}
          </p>

          {/* Three-Column Facts Strip with Hairline Dividers using COPY.snapshot */}
          <div
            ref={factsRef}
            className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 border-y border-ink/10 py-6 mb-12"
          >
            {/* Col 1: Category */}
            <div className="fact-col flex flex-col items-center justify-center text-center px-4 md:border-r border-ink/10">
              <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink/60 mb-1.5">
                CATEGORY
              </span>
              <span className="font-display text-[22px] sm:text-[26px] text-ink leading-tight">
                {COPY.snapshot.category}
              </span>
            </div>

            {/* Col 2: Core Idea */}
            <div className="fact-col flex flex-col items-center justify-center text-center px-4 md:border-r border-ink/10">
              <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink/60 mb-1.5">
                CORE IDEA
              </span>
              <span className="font-display italic text-[24px] sm:text-[28px] text-ink leading-tight">
                {COPY.snapshot.coreIdea}
              </span>
            </div>

            {/* Col 3: Positioning */}
            <div className="fact-col flex flex-col items-center justify-center text-center px-4">
              <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink/60 mb-1.5">
                POSITIONING
              </span>
              <span className="font-display text-[20px] sm:text-[24px] text-ink leading-tight">
                {COPY.snapshot.positioning}
              </span>
            </div>
          </div>

          {/* Discover the Collection Action Button */}
          <div>
            <Button variant="dark" href="#collection">
              Discover the collection
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default IntroStatementSection;
