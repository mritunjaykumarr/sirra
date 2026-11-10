"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { COPY, IMAGES } from "@/content";
import { useGsap, isReducedMotion, fadeUp, fadeUpStagger, maskReveal } from "@/lib/motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function RangeStorySection() {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const beat5Ref = useRef<HTMLDivElement>(null);
  const voicePortraitRef = useRef<HTMLDivElement>(null);

  const voicePortrait = IMAGES["voice-portrait"];
  const rangeStory = COPY.rangeStory;

  useGsap(() => {
    const nav = typeof navigator !== "undefined" ? (navigator as unknown as { connection?: { saveData?: boolean } }) : null;
    const isSaveData = nav?.connection?.saveData === true;
    const isReduced = isReducedMotion() || isSaveData;
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 900;

    // Mobile / Reduced Motion Mode: No pin, simple linear entrance
    if (isReduced || !isDesktop) {
      if (progressBarRef.current) {
        gsap.set(progressBarRef.current, { scaleY: 1 });
      }

      const beats = containerRef.current?.querySelectorAll(".range-story-beat");
      if (beats && beats.length > 0) {
        if (isReduced) {
          gsap.set(beats, { opacity: 1, y: 0, clearProps: "all" });
        } else {
          fadeUpStagger(Array.from(beats), {
            trigger: containerRef.current || undefined,
            start: "top 75%",
            stagger: 0.15,
          });
        }
      }

      if (voicePortraitRef.current && !isReduced) {
        maskReveal(voicePortraitRef.current, {
          trigger: voicePortraitRef.current,
          start: "top 80%",
        });
      }
      return;
    }

    // Desktop Pinned Stage (Beats 1 to 3)
    if (stageRef.current) {
      const beat1 = stageRef.current.querySelector<HTMLElement>(".range-beat-1");
      const beat2 = stageRef.current.querySelector<HTMLElement>(".range-beat-2");
      const beat3 = stageRef.current.querySelector<HTMLElement>(".range-beat-3");

      if (beat1 && beat2 && beat3) {
        // Mark stage active for scoped styling
        stageRef.current.setAttribute("data-pinned-stage", "active");

        // Initially hide beats before driving with scrub timeline
        gsap.set([beat1, beat2, beat3], {
          opacity: 0,
          y: 24,
          willChange: "transform, opacity",
        });

        // Single master timeline with scrub: true (no numeric lag, Lenis already smooths)
        const masterTl = gsap.timeline({
          scrollTrigger: {
            trigger: stageRef.current,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            start: "top top",
            end: "+=170%",
            scrub: true,
            onEnter: () => {
              gsap.set([beat1, beat2, beat3], { willChange: "transform, opacity" });
            },
            onLeave: () => {
              gsap.set([beat1, beat2, beat3], { willChange: "auto" });
            },
            onEnterBack: () => {
              gsap.set([beat1, beat2, beat3], { willChange: "transform, opacity" });
            },
            onLeaveBack: () => {
              gsap.set([beat1, beat2, beat3], { willChange: "auto" });
            },
          },
        });

        // Thin gold progress line maps directly to pin progress (0 to 3 duration)
        if (progressBarRef.current) {
          masterTl.fromTo(
            progressBarRef.current,
            { scaleY: 0 },
            { scaleY: 1, ease: "none", duration: 3 },
            0
          );
        }

        // ==============================================================
        // NON-OVERLAPPING STAGE WINDOWS (duration 1.0 unit each, total 3)
        // 0.15 fade in & rise 24px, 0.55 hold, 0.15 fade out & rise 24px, 0.15 empty
        // ==============================================================

        // Beat 1 (Window: 0.00 to 1.00)
        masterTl.fromTo(
          beat1,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.15, ease: "power1.out" },
          0.0
        );
        masterTl.to(
          beat1,
          { opacity: 0, y: -24, duration: 0.15, ease: "power1.in" },
          0.70
        );

        // Beat 2 (Window: 1.00 to 2.00) - Starts only after Beat 1 is at opacity 0
        masterTl.fromTo(
          beat2,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.15, ease: "power1.out" },
          1.0
        );
        masterTl.to(
          beat2,
          { opacity: 0, y: -24, duration: 0.15, ease: "power1.in" },
          1.70
        );

        // Beat 3 (Window: 2.00 to 3.00) - Starts only after Beat 2 is at opacity 0
        masterTl.fromTo(
          beat3,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.15, ease: "power1.out" },
          2.0
        );
        masterTl.to(
          beat3,
          { opacity: 0, y: -24, duration: 0.15, ease: "power1.in" },
          2.70
        );
      }
    }

    // Beat 5: Normal flow entrance with fadeUp (no scrub lag)
    if (beat5Ref.current) {
      fadeUp(beat5Ref.current, {
        trigger: beat5Ref.current,
        start: "top 80%",
      });
    }

    if (voicePortraitRef.current) {
      maskReveal(voicePortraitRef.current, {
        trigger: voicePortraitRef.current,
        start: "top 80%",
      });
    }

    // Refresh ScrollTrigger once fonts and route hydration finish
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [], containerRef);

  return (
    <section
      id="range"
      ref={containerRef}
      className="relative w-full bg-ink text-cream border-b border-cream/15"
    >
      {/* Thin Gold Progress Line on Left Edge */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold/20 z-30 pointer-events-none"
      >
        <div
          ref={progressBarRef}
          className="w-full h-full bg-gold origin-top scale-y-0"
        />
      </div>

      {/* Static Grain Texture Overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04] pointer-events-none z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: "soft-light",
        }}
      />

      {/* ============================================================== */}
      {/* BEATS 1 TO 3: ONE PINNED STAGE (Height 100svh, Centred)       */}
      {/* ============================================================== */}
      <div
        ref={stageRef}
        className="relative w-full min-[900px]:h-[100svh] min-[900px]:overflow-hidden flex flex-col items-center justify-center px-6 py-20 min-[900px]:py-0 z-20"
      >
        <div className="w-full max-w-4xl min-[900px]:grid min-[900px]:grid-cols-1 min-[900px]:grid-rows-1 min-[900px]:place-items-center">
          {/* Beat 1 */}
          <div className="range-story-beat range-beat-1 min-[900px]:col-start-1 min-[900px]:row-start-1 w-full flex flex-col items-center text-center gap-6 mb-16 min-[900px]:mb-0">
            <h2 className="font-display italic text-3xl sm:text-4xl md:text-6xl text-cream leading-tight">
              {rangeStory.beat1.line1}
            </h2>
            <div className="w-16 h-[1px] bg-gold/60" />
            <p className="font-sans text-base sm:text-lg md:text-2xl text-cream/80 max-w-2xl font-light leading-relaxed">
              {rangeStory.beat1.line2}
            </p>
          </div>

          {/* Beat 2 */}
          <div className="range-story-beat range-beat-2 min-[900px]:col-start-1 min-[900px]:row-start-1 w-full flex flex-col items-center text-center gap-6 mb-16 min-[900px]:mb-0">
            <h2 className="font-display italic text-3xl sm:text-4xl md:text-6xl text-cream leading-tight">
              {rangeStory.beat2.line1}
            </h2>
            <div className="w-16 h-[1px] bg-gold/60" />
            <p className="font-display text-2xl sm:text-3xl md:text-5xl text-gold font-light leading-snug">
              {rangeStory.beat2.line2}
            </p>
          </div>

          {/* Beat 3 */}
          <div className="range-story-beat range-beat-3 min-[900px]:col-start-1 min-[900px]:row-start-1 w-full flex flex-col items-center text-center gap-6">
            <p className="font-display italic text-2xl sm:text-3xl md:text-5xl text-cream/90 max-w-3xl leading-snug">
              “{rangeStory.beat3.text.replace(/^“|”$/g, "")}”
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BEAT 5: CLOSING HEROIC STATEMENT & VOICE PORTRAIT              */}
      {/* Follows after the pin in normal flow with fadeUp              */}
      {/* ============================================================== */}
      <div
        ref={beat5Ref}
        className="range-story-beat range-beat-5 relative z-20 w-full py-20 md:py-32 px-5 md:px-10 border-t border-cream/10"
      >
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
          {/* Headline & Rust Baseline (Col 1 to 7) */}
          <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="font-sans font-extrabold uppercase text-cream tracking-tight leading-none text-[clamp(44px,7.5vw,110px)] select-none">
              {rangeStory.beat5.headline}
            </h2>
            <p className="font-display italic text-rust text-[clamp(36px,5.5vw,84px)] mt-4 leading-tight">
              {rangeStory.beat5.baseline}
            </p>
          </div>

          {/* Voice Portrait (Col 8 to 12): Beside on desktop, below on mobile */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div
              ref={voicePortraitRef}
              className="relative w-full max-w-[340px] aspect-[3/4] overflow-hidden shadow-2xl border border-cream/20 bg-ink/40"
            >
              <Image
                src={voicePortrait.src}
                alt={voicePortrait.alt}
                fill
                quality={90}
                placeholder="blur"
                blurDataURL={voicePortrait.blurDataURL}
                sizes="(max-width: 768px) 300px, 340px"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RangeStorySection;
