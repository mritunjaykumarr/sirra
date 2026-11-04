"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import { COPY, IMAGES } from "@/content";
import { useGsap, isReducedMotion, parallax } from "@/lib/motion";
import gsap from "gsap";

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const heroData = IMAGES["hero-mist"];

  useGsap(() => {
    if (isReducedMotion()) {
      gsap.set(".hero-letter", { opacity: 1, y: 0 });
      gsap.set(".hero-item", { opacity: 1, y: 0 });
      if (imageRef.current) gsap.set(imageRef.current, { scale: 1 });
      return;
    }

    const tl = gsap.timeline();

    // Image scale animation: 1.08 to 1 over 2.4s
    if (imageRef.current) {
      tl.fromTo(
        imageRef.current,
        { scale: 1.08 },
        { scale: 1, duration: 2.4, ease: "power2.out" },
        0
      );
    }

    // Wordmark letters fade in with 0.12s stagger
    tl.fromTo(
      ".hero-letter",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" },
      0.3
    );

    // Tagline, label, and button follow
    tl.fromTo(
      ".hero-item",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.14, ease: "power3.out" },
      0.9
    );

    // Parallax on scroll: 0.15x drift
    if (imageRef.current && heroRef.current) {
      parallax(imageRef.current, 0.15, {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
      });
    }
  }, [], heroRef);

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative min-h-[100svh] w-full bg-ink text-cream overflow-hidden flex items-center"
    >
      {/* Background Image Layer (Desktop: right 55% with dissolve; Mobile: full-bleed background) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Desktop Image Container (hidden on mobile, block on md+) */}
        <div
          ref={imageRef}
          className="hidden md:block absolute right-0 top-0 w-[55%] h-full [mask-image:linear-gradient(to_right,transparent_0%,black_25%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_25%)]"
        >
          <Image
            src={heroData.src}
            alt={heroData.alt}
            width={heroData.width}
            height={heroData.height}
            placeholder="blur"
            blurDataURL={heroData.blurDataURL}
            priority
            quality={90}
            sizes="(max-width: 768px) 100vw, 55vw"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Mobile Full-Bleed Image Container (block on mobile, hidden on md+) */}
        <div className="block md:hidden absolute inset-0">
          <Image
            src={heroData.src}
            alt={heroData.alt}
            fill
            placeholder="blur"
            blurDataURL={heroData.blurDataURL}
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Mobile 55% Ink Gradient from bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/20" />
        </div>
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 md:px-10 py-24 md:py-32 flex flex-col justify-end md:justify-center min-h-[100svh]">
        <div className="max-w-2xl flex flex-col items-start gap-4 md:gap-6">
          {/* Top Label */}
          <div className="hero-item">
            <Label tone="light">FINE FRAGRANCE / 50ML EAU DE PARFUM</Label>
          </div>

          {/* Large SIRRA Wordmark with staggered letters */}
          <h1
            className="font-display font-medium uppercase tracking-[0.35em] pl-[0.35em] text-cream leading-none select-none text-[clamp(72px,12vw,180px)] -ml-2"
            aria-label="SIRRA"
          >
            {"SIRRA".split("").map((letter, idx) => (
              <span key={idx} className="hero-letter inline-block">
                {letter}
              </span>
            ))}
          </h1>

          {/* Cormorant Italic Tagline */}
          <p className="hero-item font-display italic text-gold text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-normal leading-tight">
            {COPY.hero.tagline}
          </p>

          {/* Bottom Label & Discover Collection Button */}
          <div className="hero-item flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-4">
            <Label tone="light">{COPY.hero.baseline}</Label>
            <Button variant="light" href="#collection">
              Discover the collection
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
