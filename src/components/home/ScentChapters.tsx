"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Tag from "@/components/ui/Tag";
import OutboundLink from "@/components/ui/OutboundLink";
import MarketLogo from "@/components/ui/MarketLogo";
import VideoSlot from "@/components/ui/VideoSlot";
import { COPY, IMAGES, PRODUCTS, ProductColor, MarketKey } from "@/content";
import videoManifest from "@/content/video-manifest.json";
import {
  useGsap,
  fadeUpStagger,
  attachPointerTilt,
  attachMagnetic,
  isReducedMotion,
  prefersFinePointer,
  refreshScrollOnReady,
  type InteractiveController,
} from "@/lib/motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface ScentChaptersProps {
  availableLogos?: Record<MarketKey, boolean>;
}

interface ChapterRuntimeControllers {
  floatTweens: gsap.core.Tween[];
  tiltController: InteractiveController | null;
  magneticController: InteractiveController | null;
}

export function ScentChapters({ availableLogos }: ScentChaptersProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const [activeSlug, setActiveSlug] = useState<string>(PRODUCTS[0].slug);

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

  const activeIndex = Math.max(
    0,
    PRODUCTS.findIndex((p) => p.slug === activeSlug)
  );

  // Refresh ScrollTrigger after fonts and assets load
  useEffect(() => {
    return refreshScrollOnReady();
  }, []);

  // ScrollSpy fallback for mobile, tablet, or reduced motion (viewport-relative)
  useEffect(() => {
    const handleScroll = () => {
      if (
        typeof window !== "undefined" &&
        window.innerWidth >= 1024 &&
        !isReducedMotion()
      ) {
        return;
      }
      const midY = window.innerHeight * 0.45;
      for (const p of PRODUCTS) {
        const el = document.getElementById(p.slug);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= midY && rect.bottom >= midY * 0.5) {
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
    const controllersBySlug = new Map<string, ChapterRuntimeControllers>();
    const finePointerDesktop = prefersFinePointer();
    const reduced = isReducedMotion();

    // Scents rail visibility
    const railEl = railRef.current;
    if (railEl && containerRef.current) {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 30%",
        end: "bottom 30%",
        onToggle: (self) => {
          if (reduced) {
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
    if (introEl && !reduced) {
      fadeUpStagger(Array.from(introEl.children), {
        trigger: introEl,
        start: "top 80%",
        stagger: 0.12,
      });
    }

    const mm = gsap.matchMedia();

    PRODUCTS.forEach((p, i) => {
      const chapterEl = document.getElementById(p.slug);
      if (!chapterEl) return;

      const wmInner = chapterEl.querySelector<HTMLElement>(".chapter-watermark-text");
      const wmOuter = chapterEl.querySelector<HTMLElement>(".chapter-watermark");
      const wmExit = chapterEl.querySelector<HTMLElement>(".chapter-watermark-exit");
      const rule = chapterEl.querySelector<HTMLElement>(".chapter-rule");
      const quoteRule = chapterEl.querySelector<HTMLElement>(".chapter-quote-rule");
      const quoteMark = chapterEl.querySelector<HTMLElement>(".chapter-quote-mark");
      const quoteWords = chapterEl.querySelectorAll<HTMLElement>(".reveal-word");
      const tagEnter = chapterEl.querySelector<HTMLElement>(".chapter-tag-enter");
      const roleInner = chapterEl.querySelector<HTMLElement>(".chapter-role-inner");
      const nameChars = chapterEl.querySelectorAll<HTMLElement>(".chapter-char");
      const detailItems = chapterEl.querySelectorAll<HTMLElement>(".chapter-detail-item");
      const photoClip = chapterEl.querySelector<HTMLElement>(".persona-photo-clip");
      const photoScale = chapterEl.querySelector<HTMLElement>(".persona-photo-scale");
      const frameStroke = chapterEl.querySelector<SVGGeometryElement>(".persona-frame-stroke");
      const trailLineDesktop = chapterEl.querySelector<HTMLElement>(".scent-trail-line-desktop");
      const trailItemsDesktop = chapterEl.querySelectorAll<HTMLElement>(".scent-trail-item-desktop");
      const trailLineMobile = chapterEl.querySelector<HTMLElement>(".scent-trail-line-mobile");
      const trailItemsMobile = chapterEl.querySelectorAll<HTMLElement>(".scent-trail-item-mobile");
      const bottleFloatEl = chapterEl.querySelector<HTMLElement>("[data-bottle-float]");
      const bottleShadowEl = chapterEl.querySelector<HTMLElement>("[data-bottle-shadow]");
      const orbitEl = chapterEl.querySelector<HTMLElement>("[data-orbit-ring]");
      const orbitDotEl = chapterEl.querySelector<SVGCircleElement>("[data-orbit-dot]");
      const plateTiltEl = chapterEl.querySelector<HTMLElement>("[data-plate-tilt]");
      const magneticEl = chapterEl.querySelector<HTMLElement>(".chapter-cta-magnetic");
      const packPlateScroll = chapterEl.querySelector<HTMLElement>(".pack-plate-scroll");
      const photoScroll = chapterEl.querySelector<HTMLElement>(".persona-photo-scroll");
      const photoParallax = chapterEl.querySelector<HTMLElement>(".persona-photo-parallax");
      const numeralEl = chapterEl.querySelector<HTMLElement>(".chapter-numeral");
      const atmosphereCircle = chapterEl.querySelector<HTMLElement>(".chapter-atmosphere-circle");

      if (reduced) {
        if (wmOuter) gsap.set(wmOuter, { opacity: 1 });
        if (wmExit) gsap.set(wmExit, { opacity: 1 });
        if (wmInner) gsap.set(wmInner, { opacity: 0.06, xPercent: 0 });
        if (frameStroke) gsap.set(frameStroke, { strokeDashoffset: 0 });
        if (photoClip) gsap.set(photoClip, { clipPath: "inset(0% 0% 0% 0%)" });
        if (photoScale) gsap.set(photoScale, { scale: 1 });
        if (quoteWords.length > 0) gsap.set(quoteWords, { opacity: 1 });
        if (quoteMark) gsap.set(quoteMark, { clipPath: "inset(0% 0% 0% 0%)", opacity: 0.9 });
        if (quoteRule) gsap.set(quoteRule, { scaleY: 1 });
        if (rule) gsap.set(rule, { scaleX: 1 });
        if (tagEnter) gsap.set(tagEnter, { x: 0, opacity: 1 });
        if (roleInner) gsap.set(roleInner, { yPercent: 0, opacity: 1 });
        if (nameChars.length > 0) gsap.set(nameChars, { yPercent: 0, opacity: 1 });
        if (detailItems.length > 0) gsap.set(detailItems, { y: 0, opacity: 1 });
        if (trailLineDesktop) gsap.set(trailLineDesktop, { scaleX: 1 });
        if (trailItemsDesktop.length > 0) gsap.set(trailItemsDesktop, { opacity: 1, y: 0, scale: 1 });
        if (trailLineMobile) gsap.set(trailLineMobile, { scaleY: 1 });
        if (trailItemsMobile.length > 0) gsap.set(trailItemsMobile, { opacity: 1, x: 0 });
        if (atmosphereCircle) gsap.set(atmosphereCircle, { scale: 1 });
        if (orbitDotEl) orbitDotEl.style.display = "none";
        return;
      }

      // Desktop choreography (>= 1024px) with batched timelines (minimum ScrollTrigger overhead)
      mm.add("(min-width: 1024px)", () => {
        const floatTweens: gsap.core.Tween[] = [];

        // Active chapter tracking for SCENTS rail & rolling 01 / 04 counter
        ScrollTrigger.create({
          trigger: chapterEl,
          start: "top 48%",
          end: "bottom 48%",
          onEnter: () => setActiveSlug(p.slug),
          onEnterBack: () => setActiveSlug(p.slug),
          onLeaveBack: () => {
            if (i > 0) setActiveSlug(PRODUCTS[i - 1].slug);
          },
        });

        // 1. Batched One-Shot Enter Timeline (Tag, Role, Name Chars, Quote Mark, Quote Rule, Paragraph/Reach, Photo Mask + Frame, Horizontal Trail)
        const enterTl = gsap.timeline({
          scrollTrigger: {
            trigger: chapterEl,
            start: "top 90%",
            once: true,
          },
        });

        if (photoClip) {
          enterTl.fromTo(
            photoClip,
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power3.out" },
            0
          );
        }
        if (photoScale) {
          enterTl.fromTo(
            photoScale,
            { scale: 1.12 },
            { scale: 1, duration: 1.1, ease: "power3.out" },
            0
          );
        }
        if (frameStroke) {
          enterTl.fromTo(
            frameStroke,
            { strokeDashoffset: 100 },
            { strokeDashoffset: 0, duration: 1.0, ease: "power2.out" },
            0.05
          );
        }
        if (tagEnter) {
          enterTl.fromTo(
            tagEnter,
            { x: -18, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
            0
          );
        }
        if (roleInner) {
          enterTl.fromTo(
            roleInner,
            { yPercent: 105, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
            0.06
          );
        }
        if (nameChars.length > 0) {
          enterTl.fromTo(
            nameChars,
            { yPercent: 110, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.65, stagger: 0.04, ease: "power3.out" },
            0.08
          );
        }
        if (quoteMark) {
          enterTl.fromTo(
            quoteMark,
            { clipPath: "inset(0% 100% 0% 0%)", opacity: 0 },
            { clipPath: "inset(0% 0% 0% 0%)", opacity: 0.9, duration: 0.8, ease: "power3.out" },
            0.12
          );
        }
        if (quoteRule) {
          enterTl.fromTo(
            quoteRule,
            { scaleY: 0 },
            { scaleY: 1, duration: 0.85, ease: "power3.out" },
            0.12
          );
        }
        if (detailItems.length > 0) {
          enterTl.fromTo(
            detailItems,
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" },
            0.14
          );
        }
        if (rule) {
          enterTl.fromTo(
            rule,
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 0.8, ease: "power3.out" },
            0.18
          );
        }
        if (trailLineDesktop) {
          enterTl.fromTo(
            trailLineDesktop,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.72, ease: "power2.out" },
            0.22
          );
        }
        if (trailItemsDesktop.length > 0) {
          enterTl.fromTo(
            trailItemsDesktop,
            { opacity: 0, y: 8, scale: 0.92 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.12, ease: "power3.out" },
            0.28
          );
        }

        // 2. Scrubbed Enter Motion (Quote Word Reveal 15->100%, Plate Scale 0.94->1, Photo -24->0, Watermark Enter Fade+Drift)
        const enterScrubTl = gsap.timeline({
          scrollTrigger: {
            trigger: chapterEl,
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });

        if (wmOuter) {
          enterScrubTl.fromTo(wmOuter, { opacity: 0 }, { opacity: 1, ease: "none" }, 0);
        }
        if (wmInner) {
          enterScrubTl.fromTo(
            wmInner,
            { xPercent: 12.5, opacity: 0.06 },
            { xPercent: 0, opacity: 0.1, ease: "none" },
            0
          );
        }
        if (packPlateScroll) {
          enterScrubTl.fromTo(packPlateScroll, { scale: 0.94 }, { scale: 1, ease: "none" }, 0);
        }
        if (photoScroll) {
          enterScrubTl.fromTo(photoScroll, { y: -24 }, { y: 0, ease: "none" }, 0);
        }

        // Short scroll range for quote word reveal so full opacity completes cleanly before center hold
        if (quoteWords.length > 0) {
          gsap.fromTo(
            quoteWords,
            { opacity: 0.15 },
            {
              opacity: 1,
              stagger: 0.04,
              ease: "none",
              scrollTrigger: {
                trigger: chapterEl,
                start: "top 92%",
                end: "top 45%",
                scrub: true,
              },
            }
          );
        }

        // 3. Continuous Subtle Scrub Parallax & Flat Circle Scale (full traversal)
        const parallaxScrubTl = gsap.timeline({
          scrollTrigger: {
            trigger: chapterEl,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
        if (atmosphereCircle) {
          parallaxScrubTl.fromTo(atmosphereCircle, { scale: 0.9 }, { scale: 1.1, ease: "none" }, 0);
        }
        if (numeralEl) {
          parallaxScrubTl.fromTo(numeralEl, { y: -5 }, { y: 5, ease: "none" }, 0);
        }
        if (photoParallax) {
          parallaxScrubTl.fromTo(photoParallax, { y: -6 }, { y: 6, ease: "none" }, 0);
        }

        // 4. Scoped will-change for active chapter only
        const currentContent = chapterEl.querySelector<HTMLElement>(".chapter-content");
        const currentOverlay = chapterEl.querySelector<HTMLElement>(".chapter-curtain-overlay");

        ScrollTrigger.create({
          trigger: chapterEl,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => {
            const wc = self.isActive ? "transform, opacity" : "auto";
            if (currentContent) currentContent.style.willChange = wc;
            if (currentOverlay) currentOverlay.style.willChange = self.isActive ? "opacity" : "auto";
            if (wmInner) wmInner.style.willChange = wc;
          },
        });

        // 5. Stacking Exit Transition + Watermark Fade-Out
        if (i < PRODUCTS.length - 1) {
          const nextProduct = PRODUCTS[i + 1];
          const nextChapterEl = document.getElementById(nextProduct.slug);
          if (nextChapterEl) {
            const exitTl = gsap.timeline({
              scrollTrigger: {
                trigger: nextChapterEl,
                start: "top bottom",
                end: "top top",
                scrub: true,
              },
            });
            if (wmExit) {
              exitTl.fromTo(wmExit, { opacity: 1 }, { opacity: 0, ease: "none" }, 0);
            }
            if (wmInner) {
              exitTl.fromTo(
                wmInner,
                { xPercent: 0, opacity: 0.1 },
                { xPercent: -12.5, opacity: 0.06, ease: "none", immediateRender: false },
                0
              );
            }
            if (currentContent) {
              exitTl.to(currentContent, { scale: 0.94, opacity: 0.4, ease: "none" }, 0);
            }
            if (currentOverlay) {
              exitTl.to(currentOverlay, { opacity: 0.3, ease: "none" }, 0);
            }
            exitTl.fromTo(
              nextChapterEl,
              { clipPath: "inset(8% 0% 0% 0%)", y: 60 },
              { clipPath: "inset(0% 0% 0% 0%)", y: 0, ease: "none" },
              0
            );
          }
        } else {
          const collectionTrigger = document.getElementById("collection") || chapterEl;
          const lastExitTl = gsap.timeline({
            scrollTrigger: {
              trigger: collectionTrigger,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          });
          if (wmExit) {
            lastExitTl.fromTo(wmExit, { opacity: 1 }, { opacity: 0, ease: "none" }, 0);
          }
          if (wmInner) {
            lastExitTl.fromTo(
              wmInner,
              { xPercent: 0, opacity: 0.1 },
              { xPercent: -12.5, opacity: 0.06, ease: "none", immediateRender: false },
              0
            );
          }
        }

        // 6. Desktop fine-pointer ONLY: float, orbit & dot, pointer tilt, magnetic CTA
        let tiltController: InteractiveController | null = null;
        let magneticController: InteractiveController | null = null;

        if (finePointerDesktop) {
          if (bottleFloatEl) {
            floatTweens.push(
              gsap.fromTo(
                bottleFloatEl,
                { y: 6 },
                { y: -6, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 }
              )
            );
          }
          if (bottleShadowEl) {
            floatTweens.push(
              gsap.fromTo(
                bottleShadowEl,
                { scale: 1 },
                { scale: 0.94, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 }
              )
            );
          }
          if (orbitEl) {
            floatTweens.push(
              gsap.to(orbitEl, {
                rotation: 360,
                duration: 60,
                ease: "none",
                repeat: -1,
              })
            );
          }
          if (orbitDotEl) {
            orbitDotEl.style.display = "block";
          }
          if (plateTiltEl) {
            tiltController = attachPointerTilt(plateTiltEl, {
              maxDeg: 4,
              perspective: 1000,
              easeFactor: 0.12,
            });
          }
          if (magneticEl) {
            magneticController = attachMagnetic(magneticEl, {
              maxPx: 6,
              easeFactor: 0.16,
            });
          }
        } else if (orbitDotEl) {
          orbitDotEl.style.display = "none";
        }

        controllersBySlug.set(p.slug, {
          floatTweens,
          tiltController,
          magneticController,
        });

        return () => {
          floatTweens.forEach((tw) => tw.kill());
          tiltController?.destroy();
          magneticController?.destroy();
          controllersBySlug.delete(p.slug);
        };
      });

      // Tablet & Mobile (< 1024px): batched simple fadeUp + maskReveal + vertical trail
      mm.add("(max-width: 1023px)", () => {
        if (wmOuter) gsap.set(wmOuter, { opacity: 1 });
        if (wmExit) gsap.set(wmExit, { opacity: 1 });
        if (wmInner) gsap.set(wmInner, { opacity: 0.06, xPercent: 0 });
        if (orbitDotEl) orbitDotEl.style.display = "none";
        if (quoteWords.length > 0) gsap.set(quoteWords, { opacity: 1 });
        if (atmosphereCircle) gsap.set(atmosphereCircle, { scale: 1 });

        const mobTl = gsap.timeline({
          scrollTrigger: {
            trigger: chapterEl,
            start: "top 86%",
            once: true,
          },
        });

        if (photoClip) {
          mobTl.fromTo(
            photoClip,
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power3.out" },
            0
          );
        }
        if (photoScale) {
          mobTl.fromTo(photoScale, { scale: 1.08 }, { scale: 1, duration: 0.9, ease: "power3.out" }, 0);
        }
        if (frameStroke) {
          mobTl.fromTo(frameStroke, { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.out" }, 0.05);
        }
        const titleEl = chapterEl.querySelector("h3");
        if (tagEnter) mobTl.fromTo(tagEnter, { x: -12, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 }, 0);
        if (roleInner) mobTl.fromTo(roleInner, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6 }, 0.05);
        if (titleEl) mobTl.fromTo(titleEl, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65 }, 0.08);
        if (quoteMark) mobTl.fromTo(quoteMark, { opacity: 0 }, { opacity: 0.9, duration: 0.6 }, 0.1);
        if (quoteRule) mobTl.fromTo(quoteRule, { scaleY: 0 }, { scaleY: 1, duration: 0.65 }, 0.1);
        if (detailItems.length > 0) mobTl.fromTo(detailItems, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.1 }, 0.14);
        if (rule) mobTl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.6 }, 0.18);
        if (trailLineMobile) mobTl.fromTo(trailLineMobile, { scaleY: 0 }, { scaleY: 1, duration: 0.65, ease: "power2.out" }, 0.2);
        if (trailItemsMobile.length > 0) mobTl.fromTo(trailItemsMobile, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35, stagger: 0.12 }, 0.25);
      });
    });

    // Off-screen pausing via IntersectionObserver for float, orbit, and tilt
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const target = entry.target as HTMLElement;
            const slug = target.id;
            const isInView = entry.isIntersecting;
            target.setAttribute("data-in-view", isInView ? "true" : "false");

            const ctrl = controllersBySlug.get(slug);
            if (!ctrl) return;

            ctrl.floatTweens.forEach((tw) => {
              if (isInView) {
                tw.play();
              } else {
                tw.pause();
              }
            });
            ctrl.tiltController?.setPaused(!isInView);
            ctrl.magneticController?.setPaused(!isInView);
          });
        },
        { threshold: 0.01, rootMargin: "60px 0px" }
      );

      PRODUCTS.forEach((p) => {
        const el = document.getElementById(p.slug);
        if (el) observer?.observe(el);
      });
    }

    return () => {
      observer?.disconnect();
      mm.revert();
    };
  }, [], containerRef);

  const scrollToChapter = (slug: string) => {
    const el = document.getElementById(slug);
    if (el) {
      const win = window as unknown as {
        lenis?: { scrollTo: (t: HTMLElement, o?: object) => void };
      };
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
      {/* Vertical Progress Rail + Rolling 01 / 04 Counter Above Dots (Solid flat plate, clear of text) */}
      <nav
        ref={railRef}
        aria-label="Scent chapters navigation"
        className="hidden lg:flex fixed left-3 xl:left-5 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-2.5 opacity-0 pointer-events-none"
      >
        {/* Rolling Cormorant Italic Counter */}
        <div
          data-rail-counter="true"
          aria-live="polite"
          className="flex items-center px-2 py-1 bg-cream border border-ink/15 font-display italic text-xs text-ink select-none"
        >
          <span className="inline-block h-[1.25em] overflow-hidden leading-[1.25em] align-middle">
            <span
              className="flex flex-col transition-transform duration-300 ease-out motion-reduce:transition-none"
              style={{ transform: `translateY(-${activeIndex * 25}%)` }}
            >
              {PRODUCTS.map((item) => (
                <span key={item.slug} className="block h-[1.25em] leading-[1.25em]">
                  {item.number}
                </span>
              ))}
            </span>
          </span>
          <span className="mx-0.5 text-ink/65">/</span>
          <span>04</span>
        </div>

        <div className="flex flex-col items-center gap-3.5 p-2 bg-cream border border-ink/15 rounded-full">
          <span className="font-sans text-[9px] uppercase tracking-widest text-ink/75 rotate-180 [writing-mode:vertical-lr] mb-1">
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
                  className={`block w-3 h-3 rounded-full transition-transform duration-300 ${
                    isActive
                      ? "scale-100"
                      : "scale-[0.65] bg-ink/30 group-hover:bg-ink/60"
                  }`}
                />
                <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 bg-ink text-cream text-[10px] font-sans font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-cream/15">
                  0{index + 1} · {p.name}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Intro Header Row */}
      <div className="w-full bg-cream pt-16 md:pt-24 pb-10 md:pb-14 px-5 md:px-12 lg:px-20 xl:px-24 border-b border-ink/10 z-10">
        <div className="scent-intro-header max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="mb-3">
              <Tag color="rust">
                {COPY.fourFlexes?.eyebrow || COPY.personaArchitecture?.heading || "ONE BELIEF · FOUR WAYS TO CARRY IT"}
              </Tag>
            </div>
            <h2 className="font-display text-[clamp(36px,4.5vw,68px)] text-ink leading-tight">
              {COPY.fourFlexes?.headline || "Pick the one that sounds like you."}
            </h2>
          </div>
          <p className="font-sans text-xs md:text-sm text-ink/75 max-w-xl leading-relaxed uppercase tracking-wider font-medium">
            {COPY.fourFlexes?.subhead || COPY.personaArchitecture?.subhead || "Every SIRRA scent is a different route to the same place: your own top-class. None outranks another."}
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

        const desktopMaskGradient = isEven
          ? "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 38%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%)"
          : "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 38%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%)";

        const mobileMaskGradient =
          "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)";

        const watermarkMaskVars = {
          "--wm-mask-desktop": desktopMaskGradient,
          "--wm-mask-mobile": mobileMaskGradient,
        } as React.CSSProperties;

        return (
          <article
            key={product.slug}
            id={product.slug}
            data-in-view="true"
            style={{ zIndex: (index + 1) * 10 }}
            className={`chapter-card relative lg:sticky lg:top-0 w-full min-h-[100svh] lg:h-[100svh] py-14 lg:py-0 px-5 md:px-12 lg:px-20 xl:px-24 flex items-center border-b border-ink/10 overflow-hidden ${bgClass}`}
          >
            {/* Screen reader anchor */}
            <span id={`chapter-${product.slug}`} className="sr-only" />

            {/* Solid Ink Overlay for Stacking Dimming */}
            <div
              className="chapter-curtain-overlay absolute inset-0 bg-ink pointer-events-none z-20 opacity-0"
              aria-hidden="true"
            />

            {/* Quiet Persona-Coloured Watermark (Scoped to media block on mobile/tablet and media col on desktop) */}
            <div
              aria-hidden="true"
              style={watermarkMaskVars}
              className="chapter-watermark absolute inset-x-0 top-0 h-[44%] lg:inset-0 lg:h-full pointer-events-none select-none overflow-hidden z-0 [mask-image:var(--wm-mask-mobile)] [-webkit-mask-image:var(--wm-mask-mobile)] lg:[mask-image:var(--wm-mask-desktop)] lg:[-webkit-mask-image:var(--wm-mask-desktop)]"
            >
              <div className="chapter-watermark-exit w-full h-full flex items-center">
                <span
                  className="chapter-watermark-text block font-display font-light text-[clamp(180px,22vw,360px)] leading-none uppercase whitespace-nowrap tracking-tight text-transparent opacity-[0.06]"
                  style={{
                    WebkitTextStroke: `1px ${tintHex}`,
                  }}
                >
                  {product.name}
                </span>
              </div>
            </div>

            {/* Chapter Content Grid */}
            <div className="chapter-content relative z-10 max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-14 items-center">
              {/* Media Side */}
              <div
                className={`chapter-media-col relative lg:col-span-6 w-full ${
                  isEven ? "lg:order-2" : "lg:order-1"
                }`}
              >
                {/* Flat Large Atmosphere Circle (5% Persona Colour, Zero Blur) */}
                <div
                  aria-hidden="true"
                  style={{ backgroundColor: tintHex, opacity: 0.05 }}
                  className="chapter-atmosphere-circle pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] sm:w-[460px] xl:w-[560px] aspect-square rounded-full z-0"
                />

                {/* Large Outlined Numeral ("01"–"04", 1px Persona Stroke at 8% Opacity, Parallax 0.05) */}
                <span
                  data-chapter-numeral="true"
                  aria-hidden="true"
                  style={{
                    WebkitTextStroke: `1px ${tintHex}`,
                    opacity: 0.08,
                  }}
                  className="chapter-numeral pointer-events-none select-none absolute -top-12 -left-2 sm:-top-16 sm:-left-6 font-display italic text-[clamp(120px,14vw,240px)] leading-none text-transparent z-0"
                >
                  {product.number}
                </span>

                <div className="relative z-10 w-full max-w-[560px] mx-auto flex items-start gap-6">
                  {/* 1. Pack-Shot Plate + Centered Orbit Ring + Float + Pointer Tilt */}
                  <div className="pack-plate-scroll relative w-[58%] aspect-[4/5]">
                    {/* Centered SVG Orbit Ring (120% Plate Width, 1px Dashed 2 10 Persona Colour) */}
                    <div
                      data-orbit-ring="true"
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square z-0"
                    >
                      <svg
                        viewBox="0 0 200 200"
                        className="w-full h-full overflow-visible"
                      >
                        <circle
                          cx="100"
                          cy="100"
                          r="99"
                          fill="none"
                          stroke={tintHex}
                          strokeOpacity={0.35}
                          strokeWidth="1"
                          strokeDasharray="2 10"
                          vectorEffect="non-scaling-stroke"
                        />
                        <circle
                          data-orbit-dot="true"
                          cx="100"
                          cy="1"
                          r="3.5"
                          fill={tintHex}
                          className="hidden lg:block motion-reduce:hidden"
                        />
                      </svg>
                    </div>

                    {/* Pointer Tilt Wrapper (Flat Grey Plate, Single Tight Contact Shadow Under Bottle Only) */}
                    <div data-plate-tilt="true" className="relative z-10 w-full h-full">
                      <div
                        tabIndex={0}
                        aria-label={`${product.name} bottle and fragrance profile`}
                        className="group/pack relative w-full h-full bg-[#ECECEA] border border-ink/10 overflow-hidden flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      >
                        {/* Centered Floating Bottle */}
                        <div
                          data-bottle-float="true"
                          className="relative w-[78%] h-[78%]"
                        >
                          <div className="relative w-full h-full transition-transform duration-500 group-hover/pack:scale-[1.03] motion-reduce:transition-none">
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
                        </div>

                        {/* Single Tight Contact Shadow Under Bottle Only (opacity 0.18, blur 8px <= 12px) */}
                        <div
                          data-bottle-shadow="true"
                          aria-hidden="true"
                          className="absolute bottom-[9%] left-1/2 -translate-x-1/2 w-[55%] h-3 bg-black/18 rounded-full blur-[8px] pointer-events-none"
                        />

                        {/* Hover / Keyboard Focus Solid Slide-Up Persona Notes Panel (Flat, No Blur) */}
                        <div
                          style={{ backgroundColor: tintHex }}
                          className="absolute inset-0 z-20 p-5 sm:p-6 text-cream flex flex-col justify-between translate-y-full group-hover/pack:translate-y-0 group-focus-within:translate-y-0 transition-transform duration-500 ease-out pointer-events-none group-hover/pack:pointer-events-auto group-focus-within:pointer-events-auto motion-reduce:transition-none"
                        >
                          <div>
                            <span className="block font-sans text-[10px] uppercase tracking-[0.2em] text-cream/80 font-semibold mb-1">
                              PROFILE
                            </span>
                            <p className="font-display italic text-base sm:text-lg text-cream leading-snug">
                              {product.profile}
                            </p>
                          </div>

                          <div>
                            <span className="block font-sans text-[10px] uppercase tracking-[0.2em] text-cream/80 font-semibold mb-1.5">
                              NOTES
                            </span>
                            <p className="font-sans text-xs sm:text-sm text-cream/95 leading-relaxed font-normal">
                              {product.notes.join(" · ")}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-cream/25 flex items-center justify-between">
                            <span className="font-sans text-[10px] uppercase tracking-wider text-cream/75">
                              {product.volume} {product.concentration}
                            </span>
                            <span className="font-display italic text-sm text-cream/90">
                              {product.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Lifestyle Photograph + 14px Drawn 1px Persona Frame + Parallax */}
                  <div className="persona-photo-scroll relative w-[calc(42%-24px)] translate-y-8 sm:translate-y-12 aspect-[3/4]">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="pointer-events-none absolute top-[14px] left-[14px] w-full h-full z-0 overflow-visible"
                    >
                      <rect
                        className="persona-frame-stroke"
                        x="0.5"
                        y="0.5"
                        width="99"
                        height="99"
                        fill="none"
                        stroke={tintHex}
                        strokeWidth="1"
                        pathLength={100}
                        strokeDasharray="100"
                        strokeDashoffset="100"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>

                    <div className="persona-photo-clip relative z-10 w-full h-full overflow-hidden border border-ink/10 bg-ink/10">
                      <div className="persona-photo-parallax relative -top-[6%] left-0 w-full h-[112%]">
                        <div className="persona-photo-scale relative w-full h-full">
                          {videoSrc ? (
                            <VideoSlot
                              src={videoSrc}
                              poster={personaImg}
                              alt={personaImg.alt}
                              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 320px"
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
                              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 320px"
                              className="object-cover object-center"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Side */}
              <div
                className={`lg:col-span-6 flex flex-col justify-center ${
                  isEven ? "lg:order-1" : "lg:order-2"
                }`}
              >
                {/* Mobile / Tablet chapter counter above Tag */}
                <div className="lg:hidden mb-1.5 font-display italic text-base text-ink/75 select-none">
                  {product.number} / 04
                </div>

                {/* Persona Tag & Role Line */}
                <div className="flex flex-wrap items-center gap-3 mb-2.5">
                  <div className="chapter-tag-enter inline-block">
                    <Tag color={product.color}>
                      {product.number} · {product.name.toUpperCase()}
                    </Tag>
                  </div>
                  <span className="inline-block overflow-hidden">
                    <span
                      data-chapter-role="true"
                      className={`chapter-role-inner inline-block font-sans font-bold text-xs uppercase tracking-widest ${roleColor}`}
                    >
                      {product.role}
                    </span>
                  </span>
                </div>

                {/* Scent Name: Masked Letter Boxes with 0.04s Stagger */}
                <h3
                  aria-label={product.name}
                  className="font-display font-light text-[clamp(40px,4.5vw,70px)] text-ink leading-none mb-4"
                >
                  {product.name.split(" ").map((word, wIdx, wordsArr) => (
                    <span
                      key={wIdx}
                      className={`inline-flex whitespace-nowrap ${
                        wIdx < wordsArr.length - 1 ? "mr-[0.26em]" : ""
                      }`}
                    >
                      {word.split("").map((char, cIdx) => (
                        <span
                          key={cIdx}
                          className="inline-block overflow-hidden align-bottom"
                        >
                          <span className="chapter-char inline-block">
                            {char}
                          </span>
                        </span>
                      ))}
                    </span>
                  ))}
                </h3>

                {/* Large Decorative Opening Quote Mark (96px Cormorant Italic in Persona Colour, 0.9 Opacity) */}
                <span
                  aria-hidden="true"
                  style={{ color: tintHex, opacity: 0.9 }}
                  className="chapter-quote-mark font-display italic text-[96px] leading-[0.8] h-11 overflow-hidden select-none pointer-events-none block"
                >
                  “
                </span>

                {/* Quote Row with Drawn ScaleY Rule + Scrubbed Word Reveal */}
                <div className="my-2 flex items-stretch gap-4 sm:gap-5">
                  <span
                    aria-hidden="true"
                    className="chapter-quote-rule w-[2px] shrink-0 origin-top bg-ink/25"
                  />
                  <p
                    data-chapter-quote="true"
                    aria-label={product.quote}
                    className="font-display italic text-[clamp(20px,2.2vw,30px)] text-ink leading-snug"
                  >
                    {product.quote.split(" ").map((word, wIdx) => (
                      <span
                        key={wIdx}
                        className="reveal-word inline-block mr-[0.24em]"
                      >
                        {word}
                      </span>
                    ))}
                  </p>
                </div>

                {/* Verbatim Body Paragraph */}
                <p
                  data-chapter-body="true"
                  className="chapter-detail-item font-sans text-xs sm:text-sm text-ink/85 leading-relaxed font-normal my-2.5"
                >
                  {product.body}
                </p>

                {/* Reach for it Occasion */}
                {product.reachForIt && (
                  <div
                    data-chapter-reach="true"
                    className="chapter-detail-item my-2.5 flex items-baseline gap-2 text-xs sm:text-sm text-ink/85 font-sans"
                  >
                    <span className="font-semibold text-ink uppercase tracking-wider text-[11px] shrink-0">
                      Reach for it:
                    </span>
                    <span className="italic">{product.reachForIt}</span>
                  </div>
                )}

                {/* Animated Persona Colour Rule */}
                <div className={`chapter-rule w-full h-[1.5px] my-3 ${ruleColor}`} />

                {/* Profile Line */}
                <div className="mb-3.5">
                  <span className="block font-sans text-[11px] uppercase tracking-[0.2em] text-ink/75 mb-0.5">
                    PROFILE
                  </span>
                  <p
                    data-chapter-profile="true"
                    className="font-display italic text-base sm:text-lg text-ink font-medium"
                  >
                    {product.profile}
                  </p>
                </div>

                {/* Notes Scent Trail */}
                <div
                  data-chapter-notes="true"
                  className="border-t border-ink/10 pt-3.5 mb-5"
                >
                  <span className="block font-sans text-[11px] uppercase tracking-[0.2em] text-ink/75 mb-3">
                    NOTES
                  </span>

                  {/* Desktop Horizontal Scent Trail */}
                  <div
                    data-scent-trail="true"
                    className="hidden lg:block relative pt-1"
                  >
                    <div
                      aria-hidden="true"
                      style={{ backgroundColor: tintHex }}
                      className="scent-trail-line-desktop origin-left h-[1px] w-full absolute top-[5px] left-0"
                    />
                    <div className="grid grid-cols-5 gap-3 relative z-10">
                      {product.notes.map((note, nIdx) => (
                        <div
                          key={nIdx}
                          className="scent-trail-item-desktop flex flex-col items-start"
                        >
                          <span
                            aria-hidden="true"
                            style={{ backgroundColor: tintHex }}
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                          />
                          <span
                            data-note-label="true"
                            className="font-display italic text-[19px] xl:text-[22px] leading-tight text-ink mt-2.5"
                          >
                            {note}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile & Tablet Vertical Scent Trail */}
                  <div className="lg:hidden relative pl-6 flex flex-col gap-3">
                    <div
                      aria-hidden="true"
                      style={{ backgroundColor: tintHex }}
                      className="scent-trail-line-mobile origin-top w-[1px] absolute top-2 bottom-2 left-[4.5px]"
                    />
                    {product.notes.map((note, nIdx) => (
                      <div
                        key={nIdx}
                        className="scent-trail-item-mobile relative flex items-center"
                      >
                        <span
                          aria-hidden="true"
                          style={{ backgroundColor: tintHex }}
                          className="w-2.5 h-2.5 rounded-full absolute -left-6 shrink-0"
                        />
                        <span
                          data-note-label="true"
                          className="font-display italic text-[22px] leading-snug text-ink"
                        >
                          {note}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Block */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pt-1">
                  <div className="chapter-cta-magnetic inline-block w-fit">
                    <Link
                      href={`/scent/${product.slug}`}
                      className="group/btn relative inline-flex items-center justify-center overflow-hidden bg-ink text-cream font-sans font-semibold uppercase text-xs md:text-sm tracking-wider px-6 py-3 transition-transform duration-300 ease-out hover:-translate-y-[2px] focus-visible:-translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold select-none motion-reduce:transition-none"
                    >
                      <span
                        aria-hidden="true"
                        style={{ backgroundColor: tintHex }}
                        className="absolute inset-0 scale-x-0 origin-left transition-transform duration-[400ms] ease-out group-hover/btn:scale-x-100 group-focus-visible/btn:scale-x-100 motion-reduce:transition-none"
                      />
                      <span className="relative z-10 text-cream">
                        Discover {product.name}
                      </span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-ink/75">
                      AVAILABLE ON
                    </span>
                    <div className="flex items-center gap-1.5">
                      <OutboundLink
                        market="amazon"
                        product={product.slug}
                        className="h-7 px-2.5 bg-cream border border-ink/15 hover:border-ink/50 text-ink flex items-center justify-center transition-transform duration-200 hover:-translate-y-0.5"
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
                        className="h-7 px-2.5 bg-cream border border-ink/15 hover:border-ink/50 text-ink flex items-center justify-center transition-transform duration-200 hover:-translate-y-0.5"
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
                        className="h-7 px-2.5 bg-cream border border-ink/15 hover:border-ink/50 text-ink flex items-center justify-center transition-transform duration-200 hover:-translate-y-0.5"
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
