"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Tag from "@/components/ui/Tag";
import Label from "@/components/ui/Label";
import VideoSlot from "@/components/ui/VideoSlot";
import { IMAGES, Product, ProductColor } from "@/content";
import videoManifest from "@/content/video-manifest.json";
import { useGsap, isReducedMotion } from "@/lib/motion";
import gsap from "gsap";

export interface ScentHeroProps {
  product: Product;
}

const roleColorHex: Record<ProductColor, string> = {
  wayfarer: "#5B84C4",
  equinox: "#C4B294",
  silkSmoke: "#D96B47",
  heartthrob: "#D95B68",
};

export function ScentHero({ product }: ScentHeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  const personaImg = IMAGES[product.image];
  const videoSrc = (videoManifest as Record<string, string | null>)[product.slug];

  useGsap(() => {
    if (isReducedMotion()) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 1. Profile first (fades and rises)
    tl.fromTo(
      ".hero-profile-item",
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 },
      0.1
    );

    // 2. Video / media fades in
    if (mediaRef.current) {
      tl.fromTo(
        mediaRef.current,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 1.1 },
        0.2
      );
    }

    // 3. Other text lines rise (breadcrumb, tag, role, quote, body)
    const riseItems = containerRef.current?.querySelectorAll(".hero-rise-item");
    if (riseItems && riseItems.length > 0) {
      tl.fromTo(
        Array.from(riseItems),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 },
        0.35
      );
    }

    // Scroll-linked transition: hero media scales down slightly as Notes section slides over (desktop only)
    if (typeof window !== "undefined" && window.innerWidth >= 1024 && mediaRef.current) {
      const notesSection = document.getElementById("scent-notes");
      if (notesSection) {
        gsap.to(mediaRef.current, {
          scale: 0.94,
          opacity: 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: notesSection,
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      }
    }
  }, [], containerRef);

  return (
    <section
      ref={containerRef}
      id="scent-hero"
      className="scent-hero-container relative w-full min-h-[700px] h-auto lg:h-[100svh] bg-ink text-cream overflow-hidden flex flex-col justify-center pt-24 md:pt-28 pb-10 px-5 sm:px-8 md:px-12 lg:px-16 lg:sticky lg:top-0 z-10"
    >
      <div className="relative z-10 w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* Left Half: Strict order top to bottom */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          {/* 1. Breadcrumb Label "THE COLLECTION" (links to /#collection) */}
          <div className="hero-rise-item mb-3">
            <Link
              href="/#collection"
              className="inline-flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold py-1"
            >
              <Label className="text-cream/70 group-hover:text-gold transition-colors tracking-[0.25em] text-xs font-semibold cursor-pointer">
                &larr; THE COLLECTION
              </Label>
            </Link>
          </div>

          {/* 2. Tag "01 · WAYFARER" style */}
          <div className="hero-rise-item mb-4">
            <Tag color={product.color} className="text-[10px] py-1 px-3">
              {product.number} · {product.name.toUpperCase()}
            </Tag>
          </div>

          {/* 3. Label "PROFILE" */}
          <div className="hero-profile-item mb-1">
            <Label className="tracking-[0.25em] text-cream/60 text-xs font-semibold">
              PROFILE
            </Label>
          </div>

          {/* 4. Profile large in Cormorant italic (clamp 32px to 56px), verbatim */}
          <p
            style={{ fontSize: "clamp(32px, 4.2vw, 56px)" }}
            className="hero-profile-item font-display italic text-cream leading-tight mb-5"
          >
            {product.profile}
          </p>

          {/* 5. Label with the role in the persona colour */}
          <div className="hero-rise-item mb-2">
            <span
              style={{ color: roleColorHex[product.color] }}
              className="font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.25em]"
            >
              {product.role}
            </span>
          </div>

          {/* 6. Quote in Cormorant italic (clamp 28px to 44px) */}
          <p
            style={{ fontSize: "clamp(28px, 3.2vw, 44px)" }}
            className="hero-rise-item font-display italic text-gold leading-tight max-w-xl border-l-2 border-gold/40 pl-4 sm:pl-6 my-3"
          >
            {product.quote}
          </p>

          {/* 7. Personality body paragraph (Archivo 17px, max width 60ch), verbatim */}
          <p className="hero-rise-item font-sans text-[17px] text-cream/80 leading-relaxed max-w-[60ch] mt-2 font-normal">
            {product.body}
          </p>
        </div>

        {/* Right Half: Media with VideoSlot */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end items-center">
          <div
            ref={mediaRef}
            className="hero-media-wrapper relative w-full max-w-[460px] aspect-[4/5] overflow-hidden border border-cream/15 shadow-2xl bg-ink/30"
          >
            <VideoSlot
              slug={product.slug}
              src={videoSrc}
              poster={personaImg}
              alt={personaImg.alt}
              aspectRatio="4/5"
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 460px"
              quality={90}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ScentHero;
