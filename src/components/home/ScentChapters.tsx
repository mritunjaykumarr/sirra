"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import OutboundLink from "@/components/ui/OutboundLink";
import MarketLogo from "@/components/ui/MarketLogo";
import VideoSlot from "@/components/ui/VideoSlot";
import { COPY, IMAGES, PRODUCTS, ProductColor, MarketKey } from "@/content";
import videoManifest from "@/content/video-manifest.json";
import { useGsap, fadeUpStagger, isReducedMotion } from "@/lib/motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface ScentChaptersProps {
  availableLogos?: Record<MarketKey, boolean>;
}

export function ScentChapters({ availableLogos }: ScentChaptersProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const [activeSlug, setActiveSlug] = useState<string>("wayfarer");

  const personaColorHex: Record<ProductColor, string> = {
    wayfarer: "#1E3A6B",
    equinox: "#8B7A5E",
    silkSmoke: "#252220",
    heartthrob: "#7A1E26",
  };

  const roleColorClasses: Record<ProductColor, string> = {
    wayfarer: "text-wayfarer",
    equinox: "text-equinox",
    silkSmoke: "text-silkSmoke",
    heartthrob: "text-heartthrob",
  };

  const ruleColorClasses: Record<ProductColor, string> = {
    wayfarer: "bg-wayfarer",
    equinox: "bg-equinox",
    silkSmoke: "bg-silkSmoke",
    heartthrob: "bg-heartthrob",
  };

  // ScrollSpy fallback for mobile, tablet, or reduced motion
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 1024 && !isReducedMotion()) {
        return;
      }
      const scrollPos = window.scrollY + window.innerHeight * 0.45;
      for (const p of PRODUCTS) {
        const el = document.getElementById(p.slug);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSlug(p.slug);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useGsap(() => {
    // Scents rail visibility: visible only while #scents is on screen (fade in at 30% viewport, fade out when leaving)
    const railEl = railRef.current;
    if (railEl && containerRef.current) {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 30%",
        end: "bottom 30%",
        onToggle: (self) => {
          if (isReducedMotion()) {
            gsap.set(railEl, {
              opacity: self.isActive ? 1 : 0,
              pointerEvents: self.isActive ? "auto" : "none",
            });
          } else {
            gsap.to(railEl, {
              opacity: self.isActive ? 1 : 0,
              duration: self.isActive ? 0.35 : 0.25,
              pointerEvents: self.isActive ? "auto" : "none",
              overwrite: true,
            });
          }
        },
      });
    }

    // Intro header reveal
    const introEl = containerRef.current?.querySelector(".scent-intro-header");
    if (introEl && !isReducedMotion()) {
      fadeUpStagger(Array.from(introEl.children), {
        trigger: introEl,
        start: "top 80%",
        stagger: 0.12,
      });
    }

    // Persona rule reveal
    PRODUCTS.forEach((p) => {
      const chapterEl = document.getElementById(p.slug);
      if (!chapterEl) return;
      const rule = chapterEl.querySelector(".chapter-rule");
      if (rule && !isReducedMotion()) {
        gsap.fromTo(
          rule,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: rule,
              start: "top 85%",
            },
          }
        );
      }
    });

    // Stacking Curtain Motion (Desktop >= 1024px & reduced motion false)
    if (isReducedMotion() || typeof window === "undefined" || window.innerWidth < 1024) {
      return;
    }

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      PRODUCTS.forEach((p, i) => {
        const chapterEl = document.getElementById(p.slug);
        if (!chapterEl) return;

        // Giant watermark drift across seam
        const watermark = chapterEl.querySelector(".chapter-watermark-text");
        if (watermark) {
          gsap.fromTo(
            watermark,
            { xPercent: 12 },
            {
              xPercent: -12,
              ease: "none",
              scrollTrigger: {
                trigger: chapterEl,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }

        // Curtain transitions between chapter i and incoming chapter i + 1
        if (i < PRODUCTS.length - 1) {
          const nextProduct = PRODUCTS[i + 1];
          const nextChapterEl = document.getElementById(nextProduct.slug);
          if (!nextChapterEl) return;

          const currentContent = chapterEl.querySelector(".chapter-content");
          const currentOverlay = chapterEl.querySelector(".chapter-curtain-overlay");

          // Scale down (1 -> 0.94), dim (1 -> 0.4), and overlay darkens (0 -> 30%)
          if (currentContent && currentOverlay) {
            gsap.to(currentContent, {
              scale: 0.94,
              opacity: 0.4,
              ease: "none",
              scrollTrigger: {
                trigger: nextChapterEl,
                start: "top bottom",
                end: "top top",
                scrub: true,
              },
            });

            gsap.to(currentOverlay, {
              opacity: 0.3,
              ease: "none",
              scrollTrigger: {
                trigger: nextChapterEl,
                start: "top bottom",
                end: "top top",
                scrub: true,
              },
            });
          }

          // Incoming chapter clip-path inset(8%) to inset(0%) and translate 60px to 0
          gsap.fromTo(
            nextChapterEl,
            {
              clipPath: "inset(8% 0% 0% 0%)",
              y: 60,
            },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: nextChapterEl,
                start: "top bottom",
                end: "top top",
                scrub: true,
                onUpdate: (self) => {
                  if (self.progress >= 0.5) {
                    setActiveSlug(nextProduct.slug);
                  } else {
                    setActiveSlug(p.slug);
                  }
                },
              },
            }
          );
        }
      });
    });

    return () => {
      mm.revert();
    };
  }, [], containerRef);

  const scrollToChapter = (slug: string) => {
    const el = document.getElementById(slug);
    if (el) {
      const win = window as unknown as { lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } };
      if (win.lenis) {
        win.lenis.scrollTo(el, { offset: 0 });
      } else {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section
      id="scents"
      ref={containerRef}
      className="relative w-full flex flex-col"
    >
      {/* Vertical Progress Rail (Visible on Large Screens only when #scents is on screen) */}
      <nav
        ref={railRef}
        aria-label="Scent chapters navigation"
        className="hidden lg:flex fixed left-5 xl:left-8 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-4 p-2.5 bg-cream/90 backdrop-blur-md border border-ink/10 rounded-full shadow-lg opacity-0 pointer-events-none transition-opacity"
      >
        <span className="font-sans text-[9px] uppercase tracking-widest text-ink/50 rotate-180 [writing-mode:vertical-lr] mb-1">
          SCENTS
        </span>
        {PRODUCTS.map((p, index) => {
          const isActive = activeSlug === p.slug;
          const activeColor = personaColorHex[p.color];

          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => scrollToChapter(p.slug)}
              aria-label={`Scroll to ${p.name}`}
              className="group relative flex items-center justify-center p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
            >
              <span
                style={isActive ? { backgroundColor: activeColor } : undefined}
                className={`block rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-3 h-3 scale-110 shadow-sm"
                    : "w-2 h-2 bg-ink/25 group-hover:bg-ink/60"
                }`}
              />
              {/* Tooltip on hover */}
              <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 bg-ink text-cream text-[10px] font-sans font-semibold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                0{index + 1} · {p.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Intro Header Row */}
      <div className="w-full bg-cream pt-16 md:pt-24 pb-10 md:pb-14 px-5 md:px-12 border-b border-ink/10 z-10">
        <div className="scent-intro-header max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="mb-3">
              <Tag color="rust">
                {COPY.personaArchitecture.heading}
              </Tag>
            </div>
            <h2 className="font-display text-[clamp(36px,4.5vw,68px)] text-ink leading-tight">
              The catalogue story
            </h2>
          </div>
          <p className="font-sans text-xs md:text-sm text-ink/75 max-w-xl leading-relaxed uppercase tracking-wider font-medium">
            {COPY.personaArchitecture.intro}
          </p>
        </div>
      </div>

      {/* Four Scent Chapters with Desktop Stacking Curtain Motion */}
      {PRODUCTS.map((product, index) => {
        const isEven = index % 2 === 1;
        const bgClass = isEven ? "bg-[#EAE5DA]" : "bg-cream";
        const videoSrc = (videoManifest as Record<string, string | null>)[product.slug];
        const personaImg = IMAGES[product.image];
        const packShot = product.packShot;
        const roleColor = roleColorClasses[product.color];
        const ruleColor = ruleColorClasses[product.color];
        const tintHex = personaColorHex[product.color];

        return (
          <article
            key={product.slug}
            id={product.slug}
            style={{ zIndex: (index + 1) * 10 }}
            className={`chapter-card relative lg:sticky lg:top-0 w-full min-h-[100svh] lg:h-[100svh] py-14 lg:py-0 px-5 md:px-12 lg:px-16 flex items-center border-b border-ink/10 overflow-hidden ${bgClass}`}
          >
            {/* Screen reader anchor */}
            <span id={`chapter-${product.slug}`} className="sr-only" />

            {/* Solid Ink Overlay for Stacking Dimming (Scrubbed 0 to 30%) */}
            <div
              className="chapter-curtain-overlay absolute inset-0 bg-ink pointer-events-none z-20 opacity-0 transition-opacity"
              aria-hidden="true"
            />

            {/* Giant Outlined Scent Name (180px-360px, 1px stroke at 30%) drifting right-to-left across seam */}
            <div
              aria-hidden="true"
              className="chapter-watermark absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none select-none overflow-hidden z-0"
            >
              <span
                className="chapter-watermark-text block font-display font-light text-[clamp(180px,22vw,360px)] leading-none uppercase whitespace-nowrap tracking-tight text-transparent opacity-30"
                style={{
                  WebkitTextStroke: "1px #141312",
                }}
              >
                {product.name}
              </span>
            </div>

            {/* Chapter Content Grid */}
            <div className="chapter-content relative z-10 max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-14 items-center">
              {/* Media Side: Two Crisp Side-by-Side Blocks with 24px Gap, Zero Frosted Glass, Zero Glows */}
              <div
                className={`chapter-media-col lg:col-span-6 w-full ${
                  isEven ? "lg:order-2" : "lg:order-1"
                }`}
              >
                <div className="relative w-full max-w-[560px] mx-auto flex items-start gap-6">
                  {/* 1. Pack-Shot Plate: 58% width, aspect 4/5, grey #ECECEA, single contact shadow opacity 0.18 */}
                  <div
                    tabIndex={0}
                    aria-label={`${product.name} bottle and fragrance profile`}
                    className="group/pack relative w-[58%] aspect-[4/5] bg-[#ECECEA] border border-ink/10 shadow-[0_12px_24px_-6px_rgba(0,0,0,0.18)] overflow-hidden flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    {/* Centered Pack Shot Bottle */}
                    <div className="relative w-[78%] h-[78%] transition-transform duration-500 group-hover/pack:scale-[1.03]">
                      <Image
                        src={packShot.src}
                        alt={packShot.alt}
                        fill
                        quality={90}
                        placeholder="blur"
                        blurDataURL={packShot.blurDataURL}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 45vw, 320px"
                        className="object-contain object-center mix-blend-multiply"
                      />
                    </div>

                    {/* Single Contact Shadow Under Bottle (opacity 0.18, blur 6px) */}
                    <div
                      aria-hidden="true"
                      className="absolute bottom-[9%] left-1/2 -translate-x-1/2 w-[55%] h-3 bg-black/18 rounded-full blur-[6px] pointer-events-none"
                    />

                    {/* Hover / Keyboard Focus Solid Slide-Up Persona Notes Panel */}
                    <div
                      style={{ backgroundColor: tintHex }}
                      className="absolute inset-0 z-20 p-5 sm:p-6 text-cream flex flex-col justify-between translate-y-full group-hover/pack:translate-y-0 group-focus-within:translate-y-0 transition-transform duration-500 ease-out pointer-events-none group-hover/pack:pointer-events-auto group-focus-within:pointer-events-auto shadow-2xl"
                    >
                      <div>
                        <span className="block font-sans text-[10px] uppercase tracking-[0.2em] text-cream/75 font-semibold mb-1">
                          PROFILE
                        </span>
                        <p className="font-display italic text-base sm:text-lg text-cream leading-snug">
                          {product.profile}
                        </p>
                      </div>

                      <div>
                        <span className="block font-sans text-[10px] uppercase tracking-[0.2em] text-cream/75 font-semibold mb-1.5">
                          NOTES
                        </span>
                        <p className="font-sans text-xs sm:text-sm text-cream/90 leading-relaxed font-normal">
                          {product.notes.join(" · ")}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-cream/20 flex items-center justify-between">
                        <span className="font-sans text-[10px] uppercase tracking-wider text-cream/60">
                          {product.volume} {product.concentration}
                        </span>
                        <span className="font-display italic text-sm text-cream/80">
                          {product.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Lifestyle Photograph: offset by 48px, aspect 3/4, max 1.3x native */}
                  <div className="relative w-[calc(42%-24px)] translate-y-8 sm:translate-y-12 aspect-[3/4] overflow-hidden border border-ink/10 shadow-lg bg-ink/10">
                    {videoSrc ? (
                      <VideoSlot
                        src={videoSrc}
                        poster={personaImg}
                        alt={personaImg.alt}
                        sizes="(max-width: 640px) 40vw, (max-width: 1024px) 35vw, 240px"
                        quality={90}
                      />
                    ) : (
                      <Image
                        src={personaImg.src}
                        alt={personaImg.alt}
                        fill
                        quality={90}
                        placeholder="blur"
                        blurDataURL={personaImg.blurDataURL}
                        sizes="(max-width: 640px) 40vw, (max-width: 1024px) 35vw, 240px"
                        className="object-cover object-center"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Text Side */}
              <div
                className={`lg:col-span-6 flex flex-col justify-center ${
                  isEven ? "lg:order-1" : "lg:order-2"
                }`}
              >
                {/* Persona Tag & Role */}
                <div className="flex flex-wrap items-center gap-3 mb-2.5">
                  <Tag color={product.color}>
                    {product.number} · {product.name.toUpperCase()}
                  </Tag>
                  <span
                    className={`font-sans font-bold text-xs uppercase tracking-widest ${roleColor}`}
                  >
                    {product.role}
                  </span>
                </div>

                {/* Scent Name */}
                <h3 className="font-display font-light text-[clamp(40px,4.5vw,70px)] text-ink leading-none mb-3">
                  {product.name}
                </h3>

                {/* Large Cormorant Italic Quote */}
                <p className="font-display italic text-[clamp(20px,2.2vw,30px)] text-ink leading-snug border-l-2 border-ink/25 pl-4 sm:pl-5 my-2">
                  {product.quote}
                </p>

                {/* Verbatim Body Paragraph */}
                <p className="font-sans text-xs sm:text-sm text-ink/80 leading-relaxed font-normal my-2.5">
                  {product.body}
                </p>

                {/* Animated Persona Colour Rule */}
                <div className={`chapter-rule w-full h-[1.5px] my-3 ${ruleColor}`} />

                {/* Profile Line */}
                <div className="mb-3">
                  <span className="block font-sans text-[11px] uppercase tracking-[0.2em] text-ink/60 mb-0.5">
                    PROFILE
                  </span>
                  <p className="font-display italic text-base sm:text-lg text-ink font-medium">
                    {product.profile}
                  </p>
                </div>

                {/* Clean Notes Row Below Story: Hairline border, Cormorant italic 22px, small persona dot */}
                <div className="border-t border-ink/10 pt-3.5 mb-5">
                  <span className="block font-sans text-[11px] uppercase tracking-[0.2em] text-ink/60 mb-1.5">
                    NOTES
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span
                      style={{ backgroundColor: tintHex }}
                      className="w-2 h-2 rounded-full shrink-0"
                      aria-hidden="true"
                    />
                    <p className="font-display italic text-lg sm:text-[22px] leading-snug text-ink">
                      {product.notes.join(" · ")}
                    </p>
                  </div>
                </div>

                {/* Action Block: Primary Discover Button + Secondary Marketplace Row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pt-1">
                  <Button variant="dark" href={`/scent/${product.slug}`}>
                    Discover {product.name}
                  </Button>

                  {/* Secondary Marketplace Row */}
                  <div className="flex items-center gap-2.5">
                    <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-ink/60">
                      AVAILABLE ON
                    </span>
                    <div className="flex items-center gap-1.5">
                      <OutboundLink
                        market="amazon"
                        product={product.slug}
                        className="h-7 px-2.5 bg-cream border border-ink/15 hover:border-ink/50 text-ink flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                        aria-label={`Buy ${product.name} on Amazon`}
                      >
                        <MarketLogo
                          market="amazon"
                          hasLogo={availableLogos?.amazon}
                          height={13}
                          variant="compact"
                        />
                      </OutboundLink>
                      <OutboundLink
                        market="flipkart"
                        product={product.slug}
                        className="h-7 px-2.5 bg-cream border border-ink/15 hover:border-ink/50 text-ink flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                        aria-label={`Buy ${product.name} on Flipkart`}
                      >
                        <MarketLogo
                          market="flipkart"
                          hasLogo={availableLogos?.flipkart}
                          height={14}
                          variant="compact"
                        />
                      </OutboundLink>
                      <OutboundLink
                        market="meesho"
                        product={product.slug}
                        className="h-7 px-2.5 bg-cream border border-ink/15 hover:border-ink/50 text-ink flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                        aria-label={`Buy ${product.name} on Meesho`}
                      >
                        <MarketLogo
                          market="meesho"
                          hasLogo={availableLogos?.meesho}
                          height={14}
                          variant="compact"
                        />
                      </OutboundLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default ScentChapters;
