"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import VideoSlot from "@/components/ui/VideoSlot";
import HeroDustCanvas from "@/components/home/HeroDustCanvas";
import { COPY, IMAGES, PRODUCTS, HERO_MODE, HERO_DATA } from "@/content";
import { useGsap, isReducedMotion } from "@/lib/motion";
import gsap from "gsap";

const INTRO_STORAGE_KEY = "sirra-hero-intro";

export function HeroFragranceSection() {
  const heroRef = useRef<HTMLElement>(null);
  const wordmarkBlockRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const btnSweepRef = useRef<HTMLDivElement>(null);
  const wordmarkSweepRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const scrollCueBarRef = useRef<HTMLDivElement>(null);
  const dustLayerRef = useRef<HTMLDivElement>(null);
  const cursorPosRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const hasHoverSweepPlayed = useRef(false);

  const isSingleMode = HERO_MODE === "single";
  const heroVideo = HERO_DATA.video?.src;

  const heroPanels = PRODUCTS.map((product) => ({
    slug: product.slug,
    image: IMAGES[product.image],
  }));

  // Tagline split into words for word-by-word reveal
  const taglineWords = COPY.hero.tagline.replace(/^“|”$/g, "").split(" ");

  // Shared horizontal gradient blend masks (10% of each panel width) to eliminate vertical seams
  const desktopMaskStyles = [
    {
      WebkitMaskImage: "linear-gradient(to right, black 0%, black 90%, transparent 100%)",
      maskImage: "linear-gradient(to right, black 0%, black 90%, transparent 100%)",
    },
    {
      WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
      maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
    },
    {
      WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
      maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
    },
    {
      WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 100%)",
      maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 100%)",
    },
  ];

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[SIRRA HERO] Mode: ${HERO_MODE} — ${HERO_DATA.reason}`);
    }
  }, []);

  useGsap(() => {
    // Check reduced motion or Save-Data
    const nav = typeof navigator !== "undefined" ? (navigator as unknown as { connection?: { saveData?: boolean } }) : null;
    const isSaveData = nav?.connection?.saveData === true;
    const isReduced = isReducedMotion() || isSaveData;

    // Check session replay
    let isShortIntro = false;
    try {
      if (typeof window !== "undefined") {
        isShortIntro = Boolean(sessionStorage.getItem(INTRO_STORAGE_KEY));
        if (!isShortIntro) {
          sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
        }
      }
    } catch {
      // Ignore sessionStorage errors
    }

    if (isReduced) {
      // Static compose instantly
      gsap.set(".hero-panel", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".hero-panel-img", { scale: 1 });
      gsap.set(".hero-wordmark-letter", { yPercent: 0, x: 0 });
      gsap.set(".hero-tagline-word", { yPercent: 0 });
      gsap.set(".hero-center-item", { opacity: 1, y: 0, scale: 1 });
      gsap.set("#announcement-bar", { yPercent: 0 });
      gsap.set(".header-fade-item", { opacity: 1 });
      if (mistRef.current) gsap.set(mistRef.current, { scale: 1.4, opacity: 0.06 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (isShortIntro) {
      // Shorter 0.8s version for returning visit in same session
      tl.fromTo("#announcement-bar", { yPercent: -100 }, { yPercent: 0, duration: 0.4 }, 0);
      tl.fromTo(".header-fade-item", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.2);
      tl.fromTo(".hero-panel", { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 0.6, stagger: 0.08 }, 0);
      tl.fromTo(".hero-panel-img", { scale: 1.08 }, { scale: 1, duration: 0.8 }, 0);
      tl.fromTo(".hero-wordmark-letter", { yPercent: 100 }, { yPercent: 0, duration: 0.5, stagger: 0.04 }, 0.2);
      tl.fromTo(".hero-tagline-word", { yPercent: 100 }, { yPercent: 0, duration: 0.4, stagger: 0.03 }, 0.3);
      tl.fromTo(".hero-center-item", { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.06 }, 0.4);
      if (mistRef.current) {
        tl.fromTo(mistRef.current, { scale: 0.8, opacity: 0 }, { scale: 1.4, opacity: 0.06, duration: 0.8 }, 0);
      }
    } else {
      // FULL 3.2s CINEMATIC INTRO SEQUENCE

      // t0: Announcement bar slides down from -100%
      tl.fromTo(
        "#announcement-bar",
        { yPercent: -100 },
        { yPercent: 0, duration: 0.8, ease: "power3.out" },
        0
      );

      // t0.0 to 1.4s: Four panels wipe up sequentially
      if (!isSingleMode) {
        tl.fromTo(
          ".hero-panel",
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.1,
            stagger: 0.18,
            ease: "power4.inOut",
          },
          0
        );

        tl.fromTo(
          ".hero-panel-img",
          { scale: 1.2 },
          {
            scale: 1,
            duration: 2.4,
            ease: "power3.out",
          },
          0
        );
      } else {
        tl.fromTo(
          ".hero-single-visual",
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.4,
            ease: "power4.inOut",
          },
          0
        );
        tl.fromTo(
          ".hero-panel-img",
          { scale: 1.2 },
          {
            scale: 1,
            duration: 2.4,
            ease: "power3.out",
          },
          0
        );
      }

      // t0.8 to 2.4s: Warm gold mist layer expands and clears
      if (mistRef.current) {
        tl.fromTo(
          mistRef.current,
          { scale: 0.6, opacity: 0 },
          { scale: 1.0, opacity: 0.18, duration: 0.8, ease: "power2.out" },
          0.8
        );
        tl.to(
          mistRef.current,
          { scale: 1.4, opacity: 0.06, duration: 1.4, ease: "power2.out" },
          1.6
        );
      }

      // t1.0s: Wordmark letters rise from masked boxes & letter-spacing settles from 0.6em to 0.4em
      const letterOffsets = [-0.28, -0.14, 0, 0.14, 0.28];
      tl.fromTo(
        ".hero-wordmark-letter",
        {
          yPercent: 110,
          x: (i: number) => `${letterOffsets[i] || 0}em`,
        },
        {
          yPercent: 0,
          x: "0em",
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
        },
        1.0
      );

      // One soft light sweep crosses the wordmark
      if (wordmarkSweepRef.current) {
        tl.fromTo(
          wordmarkSweepRef.current,
          { x: "-180%" },
          { x: "280%", duration: 1.2, ease: "power2.inOut" },
          1.0
        );
      }

      // t1.8s: Tagline reveals word by word with one-time gold shimmer
      tl.fromTo(
        ".hero-tagline-word",
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
        },
        1.8
      );

      // Gold shimmer passing through words
      tl.fromTo(
        ".hero-tagline-word",
        { filter: "brightness(1.5)" },
        {
          filter: "brightness(1.0)",
          duration: 0.7,
          stagger: 0.08,
          ease: "power2.out",
        },
        1.95
      );

      // t2.0s: Header links fade in
      tl.fromTo(
        ".header-fade-item",
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.out" },
        2.0
      );

      // t2.3s: Label "YOUR SIRRA." fades up
      tl.fromTo(
        ".hero-baseline-item",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        2.3
      );

      // Gold button scales in from 0.96 with opacity
      if (buttonRef.current) {
        tl.fromTo(
          buttonRef.current,
          { scale: 0.96, opacity: 0 },
          { scale: 1.0, opacity: 1, duration: 0.6, ease: "power2.out" },
          2.4
        );
      }

      // One-time light sweep crosses button
      if (btnSweepRef.current) {
        tl.fromTo(
          btnSweepRef.current,
          { x: "-180%" },
          { x: "280%", duration: 0.9, ease: "power2.inOut" },
          2.6
        );
      }
    }

    // Scroll Cue Loop (Transform only, 2.4s infinite loop)
    if (scrollCueBarRef.current) {
      gsap.fromTo(
        scrollCueBarRef.current,
        { y: "-100%" },
        {
          y: "300%",
          duration: 2.4,
          repeat: -1,
          ease: "power1.inOut",
        }
      );
    }

    // Scroll Cue fades out over first 80px of scroll
    if (scrollCueRef.current) {
      gsap.to(scrollCueRef.current, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=80",
          scrub: true,
        },
      });
    }

    // SCRUBBED SCROLL RESPONSE (Desktop & Mobile)
    const scrubTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // Wordmark scales 1.0 to 1.12 and fades to 0.15
    scrubTl.to(
      ".hero-wordmark-container",
      {
        scale: 1.12,
        opacity: 0.15,
        ease: "none",
      },
      0
    );

    // Tagline, baseline and button move up 40px and fade
    scrubTl.to(
      ".hero-subtext-container",
      {
        y: -40,
        opacity: 0,
        ease: "none",
      },
      0
    );

    // Four photographs ease apart vertically in alternating directions by up to 4% and scale to 0.98
    scrubTl.to(
      ".hero-panel-ease-1",
      {
        yPercent: -4,
        scale: 0.98,
        ease: "none",
      },
      0
    );

    scrubTl.to(
      ".hero-panel-ease-2",
      {
        yPercent: 4,
        scale: 0.98,
        ease: "none",
      },
      0
    );

    // Bottom-edge gradient to #141312 grows to smoothly resolve into marquee
    scrubTl.to(
      ".hero-bottom-resolve",
      {
        opacity: 1,
        ease: "none",
      },
      0
    );

    // POINTER PARALLAX (Desktop fine pointer only)
    const isFinePointer =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let isHeroVisible = true;
    let targetNx = 0;
    let targetNy = 0;
    let lerpX = 0;
    let lerpY = 0;

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isHeroVisible = entries[0].isIntersecting;
      },
      { threshold: 0.05 }
    );
    if (heroRef.current) {
      intersectionObserver.observe(heroRef.current);
    }

    const handlePointerMove = (e: MouseEvent) => {
      if (!isFinePointer || isReducedMotion()) return;
      const rect = heroRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetNx = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
      targetNy = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));

      cursorPosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handlePointerLeave = () => {
      targetNx = 0;
      targetNy = 0;
      cursorPosRef.current.active = false;
    };

    const tickerCallback = () => {
      if (!isHeroVisible || !isFinePointer || isReducedMotion()) return;
      lerpX += (targetNx - lerpX) * 0.08;
      lerpY += (targetNy - lerpY) * 0.08;

      // Photographs parallax ±14px (panel 1 & 3 vs 2 & 4 opposite coherent depth)
      const pOdd = document.querySelectorAll(".hero-panel-depth-1");
      const pEven = document.querySelectorAll(".hero-panel-depth-2");
      if (pOdd.length > 0) {
        gsap.set(pOdd, { x: lerpX * 14, y: lerpY * 14 });
      }
      if (pEven.length > 0) {
        gsap.set(pEven, { x: lerpX * -14, y: lerpY * -14 });
      }

      // Single mode image
      const singleImg = document.querySelector(".hero-single-visual");
      if (singleImg) {
        gsap.set(singleImg, { x: lerpX * 14, y: lerpY * 14 });
      }

      // Wordmark block: opposite direction ±8px
      if (wordmarkBlockRef.current) {
        gsap.set(wordmarkBlockRef.current, { x: lerpX * -8, y: lerpY * -8 });
      }

      // Dust canvas layer: ±22px
      if (dustLayerRef.current) {
        gsap.set(dustLayerRef.current, { x: lerpX * 22, y: lerpY * 22 });
      }
    };

    if (isFinePointer) {
      window.addEventListener("mousemove", handlePointerMove, { passive: true });
      heroRef.current?.addEventListener("mouseleave", handlePointerLeave, { passive: true });
      gsap.ticker.add(tickerCallback);
    }

    return () => {
      if (isFinePointer) {
        window.removeEventListener("mousemove", handlePointerMove);
        heroRef.current?.removeEventListener("mouseleave", handlePointerLeave);
        gsap.ticker.remove(tickerCallback);
      }
      intersectionObserver.disconnect();
    };
  }, [], heroRef);

  // Magnetic button hover logic
  const handleButtonMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!buttonRef.current || isReducedMotion()) return;
    const isFinePointer =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isFinePointer) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 90) {
      const pull = (1 - dist / 90) * 8;
      const tx = (dx / dist) * pull;
      const ty = (dy / dist) * pull;
      gsap.to(buttonRef.current, {
        x: tx,
        y: ty,
        duration: 0.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  const handleButtonMouseLeave = () => {
    if (!buttonRef.current) return;
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleButtonMouseEnter = () => {
    if (btnSweepRef.current && !hasHoverSweepPlayed.current) {
      hasHoverSweepPlayed.current = true;
      gsap.fromTo(
        btnSweepRef.current,
        { x: "-180%" },
        { x: "280%", duration: 0.9, ease: "power2.inOut" }
      );
    }
  };

  const handleDiscoverClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("scents") || document.getElementById("collection");
    if (target) {
      const win = window as unknown as { lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } };
      if (win.lenis) {
        win.lenis.scrollTo(target, { offset: 0 });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative w-full min-h-[640px] h-[100svh] bg-ink text-cream overflow-hidden flex flex-col items-center justify-center select-none"
    >
      {/* Target anchor for hero */}
      <span id="hero" className="sr-only" />

      {/* Visual Layer */}
      {isSingleMode ? (
        /* Full-Bleed Single Visual Mode (hero-main >= 2000px or video) */
        <div
          aria-hidden="true"
          className="hero-single-visual hero-panel-ease-1 absolute inset-0 z-0 pointer-events-none overflow-hidden"
        >
          {heroVideo ? (
            <VideoSlot
              src={heroVideo}
              poster={{
                src: HERO_DATA.image?.src || IMAGES["hero-mist"].src,
                alt: "SIRRA Fine Fragrance",
                width: HERO_DATA.image?.width || 2400,
                height: HERO_DATA.image?.height || 1350,
                blurDataURL: IMAGES["hero-mist"].blurDataURL,
              }}
              alt="SIRRA Fine Fragrance"
              sizes="100vw"
              quality={90}
            />
          ) : HERO_DATA.image ? (
            <Image
              src={HERO_DATA.image.src}
              alt="SIRRA Fine Fragrance"
              fill
              priority
              quality={90}
              sizes="100vw"
              className="hero-panel-img object-cover object-center"
            />
          ) : (
            <Image
              src={IMAGES["hero-mist"].src}
              alt="SIRRA Fine Fragrance"
              fill
              priority
              quality={90}
              placeholder="blur"
              blurDataURL={IMAGES["hero-mist"].blurDataURL}
              sizes="100vw"
              className="hero-panel-img object-cover object-center"
            />
          )}
        </div>
      ) : (
        /* Reinstated 4-Panel Split with 2px Overlap and 10% Cross-Fade Masks */
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
        >
          {/* Desktop Four Equal Panels (>= 900px, 2px overlap, 10% edge mask) */}
          <div className="hidden min-[900px]:flex w-full h-full">
            {heroPanels.map((panel, idx) => {
              const depthClass = idx % 2 === 0 ? "hero-panel-depth-1" : "hero-panel-depth-2";
              const easeClass = idx % 2 === 0 ? "hero-panel-ease-1" : "hero-panel-ease-2";
              const overlapClass = idx < 3 ? "-mr-[2px]" : "";

              return (
                <div
                  key={panel.slug}
                  className={`hero-panel ${depthClass} ${easeClass} ${overlapClass} relative flex-1 h-full overflow-hidden select-none border-0`}
                  style={desktopMaskStyles[idx]}
                >
                  <Image
                    src={panel.image.src}
                    alt=""
                    fill
                    priority={idx < 2}
                    placeholder="blur"
                    blurDataURL={panel.image.blurDataURL}
                    quality={90}
                    sizes="25vw"
                    className="hero-panel-img object-cover object-center"
                  />
                </div>
              );
            })}
          </div>

          {/* Mobile & Tablet 2x2 Grid (< 900px, 50% width & 50% height, border-0, gap-0) */}
          <div className="grid min-[900px]:hidden grid-cols-2 grid-rows-2 w-full h-full">
            {heroPanels.map((panel, idx) => {
              const easeClass = idx < 2 ? "hero-panel-ease-1" : "hero-panel-ease-2";

              return (
                <div
                  key={panel.slug}
                  className={`hero-panel ${easeClass} relative w-full h-full overflow-hidden select-none border-0`}
                >
                  <Image
                    src={panel.image.src}
                    alt=""
                    fill
                    priority={idx < 2}
                    placeholder="blur"
                    blurDataURL={panel.image.blurDataURL}
                    quality={90}
                    sizes="50vw"
                    className="hero-panel-img object-cover object-center"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTINUOUS LAYERED GRADE OVER ENTIRE HERO */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-10"
      >
        {/* 1. Top Header Legibility Gradient (Max 45% ink behind header only) */}
        <div className="absolute top-0 left-0 w-full h-44 bg-gradient-to-b from-ink/45 via-ink/15 to-transparent" />

        {/* 2. Linear Gradient: 0% ink at middle to 45% ink at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, transparent 50%, rgba(20, 19, 18, 0.45) 100%)",
          }}
        />

        {/* 3. Soft Overall Vignette at Outer Edges (Max 35% ink, radial) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 85% at 50% 50%, transparent 50%, rgba(20, 19, 18, 0.35) 100%)",
          }}
        />

        {/* 4. Film Grain Overlay: Subtle Luxury Texture (5% opacity, soft-light) */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: "soft-light",
          }}
        />

        {/* 5. Scroll Resolution Bottom Gradient to Ink (scrubbed into marquee) */}
        <div className="hero-bottom-resolve absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-ink via-ink/80 to-transparent opacity-0 pointer-events-none" />
      </div>

      {/* DUST CANVAS AMBIENT LAYER (Fragrance Mist Particles) */}
      <div ref={dustLayerRef} aria-hidden="true" className="absolute inset-0 pointer-events-none z-15">
        <HeroDustCanvas cursorPosRef={cursorPosRef} />
      </div>

      {/* SOFT RADIAL WARM GOLD MIST LAYER (Behind Wordmark, Clears during Intro) */}
      <div
        ref={mistRef}
        aria-hidden="true"
        className="absolute w-[600px] h-[350px] sm:w-[900px] sm:h-[500px] rounded-full pointer-events-none z-15 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(224, 165, 43, 0.22) 0%, rgba(224, 165, 43, 0.08) 42%, transparent 70%)",
          opacity: 0,
        }}
      />

      {/* CENTRED TEXT BLOCK OVER THE VISUAL (Centred, clean, minimal) */}
      <div
        ref={wordmarkBlockRef}
        className="relative z-20 w-full max-w-[1440px] mx-auto flex flex-col items-center text-center px-4 sm:px-6 py-6"
      >
        {/* 1. Label: FINE FRAGRANCE · 50ML EAU DE PARFUM (Cream 90%, 12px, tracking 0.28em, subtle shadow) */}
        <div className="hero-center-item mb-2 sm:mb-3">
          <span
            className="inline-block font-sans text-[12px] uppercase tracking-[0.28em] font-medium text-cream/90 select-none"
            style={{ textShadow: "0 2px 8px rgba(20,19,18,0.7)" }}
          >
            FINE FRAGRANCE · 50ML EAU DE PARFUM
          </span>
        </div>

        {/* 2. Giant SIRRA Wordmark Centred (clamp 72px to 180px, tracking 0.4em, cream) */}
        <div className="hero-wordmark-container relative inline-block overflow-hidden py-1 sm:py-2">
          {/* Wordmark soft light sweep */}
          <div
            ref={wordmarkSweepRef}
            aria-hidden="true"
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none -skew-x-20 -translate-x-[200%]"
          />

          <h1
            aria-label="SIRRA"
            className="font-display font-light uppercase text-cream leading-none tracking-[0.4em] pl-[0.4em] select-none flex items-center justify-center"
            style={{
              fontSize: "clamp(72px, 12.5vw, 180px)",
              textShadow: "0 2px 24px rgba(20,19,18,0.35)",
            }}
          >
            {["S", "I", "R", "R", "A"].map((letter, i) => (
              <span key={i} className="inline-block overflow-hidden">
                <span className="hero-wordmark-letter inline-block">
                  {letter}
                </span>
              </span>
            ))}
          </h1>
        </div>

        {/* Subtext container for scrub scroll exit */}
        <div className="hero-subtext-container flex flex-col items-center">
          {/* 3. Tagline in Cormorant Italic Gold: word-by-word reveal + shimmer */}
          <p
            className="font-display italic text-gold text-[clamp(24px,3.2vw,44px)] mt-1 mb-2 leading-tight flex items-center justify-center flex-wrap"
            style={{ textShadow: "0 2px 14px rgba(20,19,18,0.75)" }}
          >
            {taglineWords.map((word, wIdx) => (
              <span key={wIdx} className="inline-block overflow-hidden mr-[0.28em] last:mr-0">
                <span className="hero-tagline-word inline-block">
                  {word}
                </span>
              </span>
            ))}
          </p>

          {/* 4. Label: YOUR SIRRA. */}
          <div className="hero-baseline-item mb-6 sm:mb-8">
            <span
              className="inline-block font-sans text-[11px] uppercase tracking-[0.25em] font-semibold text-cream/85 select-none"
              style={{ textShadow: "0 2px 8px rgba(20,19,18,0.6)" }}
            >
              {COPY.hero.baseline}
            </span>
          </div>

          {/* 5. Discover the Collection Button: Magnetic, gold (#E0A52B) with ink text */}
          <div className="flex flex-col items-center">
            <a
              ref={buttonRef}
              href="#scents"
              onClick={handleDiscoverClick}
              onMouseMove={handleButtonMouseMove}
              onMouseLeave={handleButtonMouseLeave}
              onMouseEnter={handleButtonMouseEnter}
              className="group relative inline-flex items-center justify-center px-9 py-[18px] bg-gold text-ink font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.2em] rounded-none overflow-hidden transition-colors duration-300 hover:bg-[#EBB43F] shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {/* Single soft light sweep */}
              <div
                ref={btnSweepRef}
                aria-hidden="true"
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none -skew-x-20 -translate-x-[200%]"
              />
              <span className="relative z-10 pointer-events-none">Discover the collection</span>
            </a>
          </div>
        </div>
      </div>

      {/* QUIET SCROLL CUE AT BOTTOM CENTRE (1px gold vertical line, 48px long, fades over first 80px) */}
      <div
        ref={scrollCueRef}
        aria-hidden="true"
        className="hero-scroll-cue absolute bottom-7 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center select-none"
      >
        <div className="w-[1px] h-[48px] bg-gold/25 relative overflow-hidden">
          <div
            ref={scrollCueBarRef}
            className="w-full h-[16px] bg-gold absolute top-0 left-0"
          />
        </div>
      </div>
    </section>
  );
}

export default HeroFragranceSection;
