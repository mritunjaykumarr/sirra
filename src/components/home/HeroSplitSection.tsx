"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import { COPY, IMAGES, PRODUCTS } from "@/content";
import { useGsap, isReducedMotion, parallax } from "@/lib/motion";
import gsap from "gsap";

export function HeroSplitSection() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const wordmarkBoxRef = useRef<HTMLDivElement>(null);

  const heroPanels = PRODUCTS.map((product) => ({
    slug: product.slug,
    name: product.name.toUpperCase(),
    role: product.role,
    color: product.color,
    image: IMAGES[product.image],
  }));

  useGsap(() => {
    if (isReducedMotion()) {
      gsap.set(".hero-panel", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".hero-panel-img", { scale: 1 });
      gsap.set(".hero-letter", { opacity: 1, y: 0 });
      gsap.set(".hero-center-item", { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline();

    // 1. Panels reveal with clip-path from bottom, staggered 0.15s
    tl.fromTo(
      ".hero-panel",
      { clipPath: "inset(100% 0% 0% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.4,
        stagger: 0.15,
        ease: "power3.out",
      },
      0
    );

    // 2. Each image scales from 1.15 to 1 over 1.8s
    tl.fromTo(
      ".hero-panel-img",
      { scale: 1.15 },
      {
        scale: 1,
        duration: 1.8,
        ease: "power2.out",
      },
      0.1
    );

    // 3. Wordmark letters fade in with 0.12s stagger
    tl.fromTo(
      ".hero-letter",
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
      },
      0.8
    );

    // 4. Tagline, label, and button follow
    tl.fromTo(
      ".hero-center-item",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.14,
        ease: "power3.out",
      },
      1.3
    );

    // Alternating scroll parallax: +0.05 and -0.05 on panels
    const panels = document.querySelectorAll(".hero-panel-inner");
    panels.forEach((p, idx) => {
      const dir = idx % 2 === 0 ? 0.05 : -0.05;
      parallax(p, dir, { trigger: heroRef.current as Element });
    });

    // Wordmark moves slightly with scroll (0.1x)
    if (wordmarkBoxRef.current) {
      parallax(wordmarkBoxRef.current, 0.1, { trigger: heroRef.current as Element });
    }
  }, [], heroRef);

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative w-full h-[100svh] min-h-[640px] bg-ink text-cream overflow-hidden"
    >
      {/* Top Header Legibility Gradient (Max 45% ink behind header only) */}
      <div className="absolute top-0 left-0 w-full h-44 bg-gradient-to-b from-ink/45 via-ink/15 to-transparent z-20 pointer-events-none" />

      {/* DESKTOP FOUR-PANEL SPLIT (>= 900px) */}
      <div className="hidden min-[900px]:flex w-full h-full">
        {heroPanels.map((panel) => {
          const isCurrentActive = activeSlug === panel.slug;
          const isOtherActive = activeSlug !== null && !isCurrentActive;

          return (
            <a
              key={panel.slug}
              href={`#${panel.slug}`}
              onMouseEnter={() => setActiveSlug(panel.slug)}
              onMouseLeave={() => setActiveSlug(null)}
              onFocus={() => setActiveSlug(panel.slug)}
              onBlur={() => setActiveSlug(null)}
              className={`hero-panel relative h-full transition-[flex-grow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden flex flex-col justify-end p-6 lg:p-8 cursor-pointer border-r border-ink/40 last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:z-30 select-none ${
                isCurrentActive
                  ? "flex-[2.2] max-w-[1000px]"
                  : isOtherActive
                  ? "flex-[0.65]"
                  : "flex-1"
              }`}
            >
              {/* Image with subtle overlay */}
              <div className="hero-panel-inner absolute inset-0 w-full h-full pointer-events-none">
                <Image
                  src={panel.image.src}
                  alt={panel.image.alt}
                  fill
                  priority
                  placeholder="blur"
                  blurDataURL={panel.image.blurDataURL}
                  quality={90}
                  sizes="(max-width: 900px) 50vw, (max-width: 1440px) 40vw, 550px"
                  className="hero-panel-img object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
              </div>

              {/* Bottom Metadata */}
              <div className="relative z-10 flex flex-col items-start gap-1">
                <Tag color={panel.color} className="text-[11px] py-1.5 px-3">
                  {panel.name}
                </Tag>
                <span className="font-display italic text-cream text-lg lg:text-xl drop-shadow-md">
                  {panel.role}
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {/* MOBILE & TABLET 2x2 GRID (< 900px) */}
      <div className="grid min-[900px]:hidden grid-cols-2 grid-rows-2 w-full h-full">
        {heroPanels.map((panel, idx) => {
          const isTopRow = idx < 2;

          return (
            <a
              key={panel.slug}
              href={`#${panel.slug}`}
              className={`hero-panel relative w-full h-full overflow-hidden flex flex-col p-4 border border-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold select-none ${
                isTopRow ? "justify-start pt-24" : "justify-end pb-5"
              }`}
            >
              <div className="hero-panel-inner absolute inset-0 w-full h-full pointer-events-none">
                <Image
                  src={panel.image.src}
                  alt={panel.image.alt}
                  fill
                  priority
                  placeholder="blur"
                  blurDataURL={panel.image.blurDataURL}
                  quality={90}
                  sizes="50vw"
                  className="hero-panel-img object-cover object-center"
                />
                <div
                  className={`absolute inset-0 ${
                    isTopRow
                      ? "bg-gradient-to-b from-ink/80 via-ink/25 to-transparent"
                      : "bg-gradient-to-t from-ink/80 via-ink/25 to-transparent"
                  }`}
                />
              </div>

              <div className="relative z-10 flex flex-col items-start gap-1">
                <Tag color={panel.color} className="text-[10px] py-1 px-2.5">
                  {panel.name}
                </Tag>
                <span className="font-display italic text-cream text-xs sm:text-sm drop-shadow-md line-clamp-1">
                  {panel.role}
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {/* OVERLAID CENTRED BRAND STATEMENT (Pointer-events none, centred) */}
      <div
        ref={wordmarkBoxRef}
        className="absolute inset-0 pointer-events-none z-30 flex flex-col items-center justify-center px-4 text-center"
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3 md:gap-5">
          {/* Wordmark (clamp 64px to 180px, tracking 0.4em) */}
          <h1
            className="font-display font-medium uppercase tracking-[0.4em] pl-[0.4em] text-cream leading-none select-none text-[clamp(48px,9vw,160px)] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
            aria-label="SIRRA"
          >
            {"SIRRA".split("").map((letter, idx) => (
              <span key={idx} className="hero-letter inline-block">
                {letter}
              </span>
            ))}
          </h1>

          {/* Tagline in Cormorant Italic Gold */}
          <p className="hero-center-item font-display italic text-gold text-2xl sm:text-3xl md:text-5xl leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
            {COPY.hero.tagline}
          </p>

          {/* Baseline & Button (pointer-events auto) */}
          <div className="hero-center-item flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Label tone="light" className="drop-shadow-sm">
              {COPY.hero.baseline}
            </Label>
            <div className="pointer-events-auto">
              <Button variant="light" href="#collection" className="shadow-lg">
                Discover the collection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSplitSection;
