"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import VideoSlot from "@/components/ui/VideoSlot";
import Tag from "@/components/ui/Tag";
import OutboundLink from "@/components/ui/OutboundLink";
import MarketLogo from "@/components/ui/MarketLogo";
import HeroDustCanvas from "@/components/home/HeroDustCanvas";
import { COPY, IMAGES, PRODUCTS, HERO_MODE, HERO_DATA, HERO_CAPTION } from "@/content";
import { useGsap, isReducedMotion } from "@/lib/motion";
import gsap from "gsap";

const INTRO_STORAGE_KEY = "sirra-hero-intro-v3";

const personaColorHex: Record<string, string> = {
  wayfarer: "#0F4C81",
  equinox: "#C49A45",
  silkSmoke: "#B85D19",
  heartthrob: "#8B263E",
};

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

  // Persona Slides State (4 scents in fixed order)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHeroInView, setIsHeroInView] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [tickProgress, setTickProgress] = useState(0);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTransitioningRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const isVideoMode = HERO_MODE === "video" || HERO_MODE === "youtube";
  const isCinematicMode = isVideoMode;
  const isPersonaMode = !isCinematicMode && HERO_MODE === "persona";
  const isSingleMode = !isCinematicMode && HERO_MODE === "single";
  const showCaption = HERO_CAPTION === "name";

  // Video Hero State
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoTextBlockRef = useRef<HTMLDivElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showPosterOnly, setShowPosterOnly] = useState(false);
  const [videoSources, setVideoSources] = useState({
    mp4: HERO_DATA.video?.src || "/video/videoplayback.mp4",
    webm: HERO_DATA.video?.webm || "/video/hero.webm",
  });

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const nav = typeof navigator !== "undefined" ? (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }) : null;
      const isSaveData = nav?.connection?.saveData === true;
      const eff = nav?.connection?.effectiveType;
      const isSlow = eff === "slow-2g" || eff === "2g" || eff === "3g";
      if (mediaQuery || isSaveData || isSlow) {
        setShowPosterOnly(true);
      }

      const isMobile = window.matchMedia("(max-width: 767px), (orientation: portrait)").matches;
      const v = HERO_DATA.video;
      if (isMobile && v?.mobile) {
        setVideoSources({
          mp4: v.mobile,
          webm: v.mobileWebm || v.mobile,
        });
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  const heroVideo = HERO_DATA.video?.src;
  const taglineWords = COPY.hero.tagline.replace(/^“|”$/g, "").split(" ");

  // Shared horizontal gradient blend masks for legacy 4-panel split
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

  // Helper to scroll to scent chapter
  const scrollToChapter = useCallback((slug: string) => {
    const target = document.getElementById(slug);
    if (target) {
      const win = window as unknown as { lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } };
      if (win.lenis) {
        win.lenis.scrollTo(target, { offset: 0 });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

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

  // 1. Tab Visibility & Intersection Observer (Pause when hidden or off-screen)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();
    };
  }, []);

  // Video Hero: Listen for runtime media query & resize changes
  useEffect(() => {
    if (!isVideoMode) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setShowPosterOnly(e.matches);
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    const mobileQuery = window.matchMedia("(max-width: 767px), (orientation: portrait)");
    const handleResize = () => {
      const isMobile = mobileQuery.matches;
      const v = HERO_DATA.video;
      if (isMobile && v?.mobile) {
        setVideoSources({
          mp4: v.mobile,
          webm: v.mobileWebm || v.mobile,
        });
      } else if (v?.src) {
        setVideoSources({
          mp4: v.src,
          webm: v.webm || v.src,
        });
      }
    };
    mobileQuery.addEventListener("change", handleResize);

    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
      mobileQuery.removeEventListener("change", handleResize);
    };
  }, [isVideoMode]);

  // Video Hero: Robust Autoplay with Retries
  const attemptPlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid || showPosterOnly) return;
    if (isHeroInView && isTabVisible) {
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoPlaying(true);
          })
          .catch(() => {
            // Autoplay rejected: will retry on user scroll/touch/visibility
          });
      }
    } else {
      vid.pause();
    }
  }, [isHeroInView, isTabVisible, showPosterOnly]);

  // Video Hero: Play / Pause Sync with Tab Visibility & Intersection Observer
  useEffect(() => {
    if (!isVideoMode || showPosterOnly || !videoRef.current) return;
    attemptPlay();
  }, [isVideoMode, isHeroInView, isTabVisible, showPosterOnly, attemptPlay]);

  // Video Hero: Retry on first user scroll, touch, or pointerdown
  useEffect(() => {
    if (!isVideoMode || showPosterOnly) return;

    const handleFirstInteraction = () => {
      attemptPlay();
      window.removeEventListener("scroll", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("pointerdown", handleFirstInteraction);
    };

    window.addEventListener("scroll", handleFirstInteraction, { passive: true });
    window.addEventListener("touchstart", handleFirstInteraction, { passive: true });
    window.addEventListener("pointerdown", handleFirstInteraction, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("pointerdown", handleFirstInteraction);
    };
  }, [isVideoMode, showPosterOnly, attemptPlay]);

  // Video Hero: Track playing state from DOM events
  useEffect(() => {
    if (!isVideoMode || !videoRef.current) return;
    const vid = videoRef.current;

    const markPlaying = () => {
      setIsVideoPlaying(true);
    };

    vid.addEventListener("playing", markPlaying);
    vid.addEventListener("play", markPlaying);
    vid.addEventListener("canplay", markPlaying);
    vid.addEventListener("loadeddata", markPlaying);

    return () => {
      vid.removeEventListener("playing", markPlaying);
      vid.removeEventListener("play", markPlaying);
      vid.removeEventListener("canplay", markPlaying);
      vid.removeEventListener("loadeddata", markPlaying);
    };
  }, [isVideoMode]);

  const handleVideoCanPlay = () => {
    setIsVideoPlaying(true);
    attemptPlay();
  };

  // 2. Slide Transition Function
  const goToSlide = useCallback((newIndex: number) => {
    if (newIndex === currentSlide || isTransitioningRef.current) return;

    const nav = typeof navigator !== "undefined" ? (navigator as unknown as { connection?: { saveData?: boolean } }) : null;
    const isSaveData = nav?.connection?.saveData === true;
    const isReduced = isReducedMotion() || isSaveData;

    const fromIdx = currentSlide;
    const toIdx = (newIndex + PRODUCTS.length) % PRODUCTS.length;

    if (isReduced) {
      setCurrentSlide(toIdx);
      setTickProgress(0);
      return;
    }

    isTransitioningRef.current = true;
    setTickProgress(0);

    const outgoingSlide = heroRef.current?.querySelector(`.persona-slide-${fromIdx}`);
    const incomingSlide = heroRef.current?.querySelector(`.persona-slide-${toIdx}`);
    const incomingPortrait = incomingSlide?.querySelector(".persona-portrait-panel");
    const incomingPhoto = incomingSlide?.querySelector(".hero-slide-photo");
    const incomingPlate = incomingSlide?.querySelector(".persona-product-plate");
    const incomingCaption = incomingSlide?.querySelector(".persona-caption-group");

    // Timeline for transition
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        setCurrentSlide(toIdx);
        isTransitioningRef.current = false;
        // Reset outgoing styles
        if (outgoingSlide) {
          gsap.set(outgoingSlide, { opacity: 0, pointerEvents: "none" });
        }
      },
    });

    // Make incoming slide visible immediately for transition
    if (incomingSlide) {
      gsap.set(incomingSlide, { opacity: 1, zIndex: 5, pointerEvents: "auto" });
    }
    if (outgoingSlide) {
      gsap.set(outgoingSlide, { zIndex: 1 });
      tl.to(outgoingSlide, { opacity: 0, scale: 0.98, duration: 0.7 }, 0);
    }

    // Incoming portrait wipe (clip-path inset 100% 0 0 0 to 0) + photo scale 1.12 to 1
    if (incomingPortrait) {
      tl.fromTo(
        incomingPortrait,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power3.out" },
        0
      );
    }
    if (incomingPhoto) {
      tl.fromTo(
        incomingPhoto,
        { scale: 1.12 },
        { scale: 1, duration: 1.1, ease: "power3.out" },
        0
      );
    }

    // Incoming plate slide up 60px with opacity 0 to 1 (0.15s delayed)
    if (incomingPlate) {
      tl.fromTo(
        incomingPlate,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" },
        0.15
      );
    }

    // Caption words swap with short masked rise
    if (incomingCaption) {
      tl.fromTo(
        incomingCaption,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
        0.2
      );
    }
  }, [currentSlide]);

  // 3. Autoplay & Tick Progress
  useEffect(() => {
    if (!isPersonaMode) return;

    const nav = typeof navigator !== "undefined" ? (navigator as unknown as { connection?: { saveData?: boolean } }) : null;
    const isSaveData = nav?.connection?.saveData === true;
    const isReduced = isReducedMotion() || isSaveData;

    if (isReduced || isPaused || !isHeroInView || !isTabVisible) {
      return;
    }

    const currentProduct = PRODUCTS[currentSlide];
    const slideData = HERO_DATA.slides?.[currentProduct.slug];
    const hasVideo = Boolean(slideData?.video?.src);
    const duration = hasVideo ? 8000 : 7000;
    const step = 50;

    let elapsed = tickProgress * (duration / 100);

    progressIntervalRef.current = setInterval(() => {
      elapsed += step;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setTickProgress(pct);

      if (elapsed >= duration) {
        clearInterval(progressIntervalRef.current!);
        goToSlide((currentSlide + 1) % PRODUCTS.length);
      }
    }, step);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPersonaMode, currentSlide, isPaused, isHeroInView, isTabVisible, goToSlide, tickProgress]);

  // 4. Keyboard Navigation (Left / Right Arrow)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isPersonaMode) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goToSlide((currentSlide - 1 + PRODUCTS.length) % PRODUCTS.length);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goToSlide((currentSlide + 1) % PRODUCTS.length);
    }
  };

  // 5. Touch Swipe Handlers (Passive, 40px threshold, does not block vertical scroll)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isPersonaMode) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isPersonaMode || touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Only swipe if horizontal move is greater than vertical move
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        goToSlide((currentSlide + 1) % PRODUCTS.length);
      } else {
        goToSlide((currentSlide - 1 + PRODUCTS.length) % PRODUCTS.length);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // 6. GSAP Motion & Parallax Effects
  useGsap(() => {
    const nav = typeof navigator !== "undefined" ? (navigator as unknown as { connection?: { saveData?: boolean } }) : null;
    const isSaveData = nav?.connection?.saveData === true;
    const isReduced = isReducedMotion() || isSaveData;
    const headerItems = typeof document !== "undefined" ? Array.from(document.querySelectorAll(".header-fade-item")) : [];

    let isShortIntro = false;
    try {
      if (typeof window !== "undefined") {
        isShortIntro = Boolean(sessionStorage.getItem(INTRO_STORAGE_KEY));
        if (!isShortIntro) {
          sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
        }
      }
    } catch {
      // Ignore sessionStorage
    }

    if (isReduced) {
      if (isCinematicMode) {
        gsap.set([".hero-video-word", ".hero-video-fade-item", videoTextBlockRef.current], { opacity: 1, y: 0, yPercent: 0 });
        if (videoContainerRef.current) gsap.set(videoContainerRef.current, { scale: 1 });
        return;
      }
      gsap.set(".hero-wordmark-letter", { yPercent: 0, x: 0 });
      gsap.set(".hero-tagline-word", { yPercent: 0 });
      gsap.set(".hero-center-item", { opacity: 1, y: 0, scale: 1 });
      if (headerItems.length > 0) gsap.set(headerItems, { opacity: 1 });
      gsap.set(".persona-slide", { opacity: 0 });
      gsap.set(`.persona-slide-${currentSlide}`, { opacity: 1 });
      gsap.set(".persona-portrait-panel", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".persona-product-plate", { y: 0, opacity: 1 });
      if (mistRef.current) gsap.set(mistRef.current, { scale: 1.4, opacity: 0.06 });
      return;
    }

    if (isCinematicMode) {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (headerItems.length > 0) {
        tl.fromTo(headerItems, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0);
      }
      tl.fromTo(".hero-video-label", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7 }, 0.2);
      tl.fromTo(
        ".hero-video-word",
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.08, duration: 0.8, ease: "power3.out" },
        0.4
      );
      tl.fromTo(
        ".hero-video-fade-item",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.7 },
        0.8
      );
      if (btnSweepRef.current) {
        tl.fromTo(btnSweepRef.current, { x: "-180%" }, { x: "280%", duration: 1.1, ease: "power2.inOut" }, 1.3);
      }

      if (heroRef.current && videoContainerRef.current && videoTextBlockRef.current) {
        gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        })
          .to(videoContainerRef.current, { scale: 1.06, ease: "none" }, 0)
          .to(videoTextBlockRef.current, { y: -40, opacity: 0, ease: "power1.in" }, 0);
      }
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (isShortIntro) {
      if (headerItems.length > 0) {
        tl.fromTo(headerItems, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0);
      }
      tl.fromTo(
        `.persona-slide-0 .persona-portrait-panel`,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8 },
        0
      );
      tl.fromTo(
        `.persona-slide-0 .persona-product-plate`,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        0.15
      );
      tl.fromTo(
        ".hero-wordmark-letter",
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.6 },
        0.3
      );
      tl.fromTo(
        ".hero-tagline-word",
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.04, duration: 0.5 },
        0.5
      );
      tl.fromTo(".hero-baseline-item", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, 0.6);
      tl.fromTo(buttonRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5 }, 0.7);
    } else {
      // Full Cinematic Intro Sequence
      if (headerItems.length > 0) {
        tl.fromTo(headerItems, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0);
      }

      if (mistRef.current) {
        tl.fromTo(mistRef.current, { scale: 0.6, opacity: 0 }, { scale: 1.3, opacity: 0.18, duration: 1.6, ease: "power2.out" }, 0.2);
        tl.to(mistRef.current, { scale: 1.45, opacity: 0.06, duration: 1.4, ease: "power2.inOut" }, 1.8);
      }

      // First persona slide visual reveals first: portrait wipes up, plate slides up
      tl.fromTo(
        `.persona-slide-0 .persona-portrait-panel`,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power3.out" },
        0.2
      );
      tl.fromTo(
        `.persona-slide-0 .persona-slide-photo`,
        { scale: 1.15 },
        { scale: 1, duration: 1.4, ease: "power3.out" },
        0.2
      );
      tl.fromTo(
        `.persona-slide-0 .persona-product-plate`,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: "power3.out" },
        0.4
      );

      // Centered text: Label, Wordmark letters rise, Tagline words reveal
      tl.fromTo(".hero-center-item", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.8 }, 0.7);
      tl.fromTo(
        ".hero-wordmark-letter",
        { yPercent: 130, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.08, duration: 0.9, ease: "power4.out" },
        0.9
      );
      tl.fromTo(
        ".hero-tagline-word",
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.7, ease: "power3.out" },
        1.3
      );
      tl.fromTo(".hero-baseline-item", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.7 }, 1.7);
      tl.fromTo(buttonRef.current, { opacity: 0, y: 20, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.4)" }, 1.9);

      // One-time light sweep across button
      if (btnSweepRef.current) {
        tl.fromTo(btnSweepRef.current, { x: "-180%" }, { x: "280%", duration: 1.1, ease: "power2.inOut" }, 2.5);
      }
    }

    // Scroll Cue Pulse
    if (scrollCueBarRef.current) {
      gsap.fromTo(
        scrollCueBarRef.current,
        { y: -16, opacity: 0 },
        { y: 48, opacity: 1, duration: 2.0, repeat: -1, ease: "power2.inOut", repeatDelay: 0.6 }
      );
    }

    // Desktop Pointer Parallax: Portrait ±12px, Plate ±20px, Wordmark ±6px opposite
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (!isTouch && heroRef.current) {
      const heroEl = heroRef.current;
      const handlePointerMove = (e: MouseEvent) => {
        const rect = heroEl.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width - 0.5;
        const normY = (e.clientY - rect.top) / rect.height - 0.5;

        cursorPosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };

        gsap.to(".persona-portrait-panel", {
          x: normX * 24,
          y: normY * 16,
          duration: 1.4,
          ease: "power2.out",
          overwrite: "auto",
        });

        gsap.to(".persona-product-plate", {
          x: normX * 40,
          y: normY * 26,
          duration: 1.6,
          ease: "power2.out",
          overwrite: "auto",
        });

        gsap.to(wordmarkBlockRef.current, {
          x: -normX * 12,
          y: -normY * 8,
          duration: 1.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const handlePointerLeave = () => {
        cursorPosRef.current.active = false;
        gsap.to([".persona-portrait-panel", ".persona-product-plate", wordmarkBlockRef.current], {
          x: 0,
          y: 0,
          duration: 1.2,
          ease: "power2.out",
        });
      };

      heroEl.addEventListener("mousemove", handlePointerMove);
      heroEl.addEventListener("mouseleave", handlePointerLeave);
    }

    // Scrubbed Scroll Exit into Marquee
    gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 0.5,
      },
    })
      .to(
        wordmarkBlockRef.current,
        {
          scale: 1.1,
          opacity: 0.15,
          y: -40,
          ease: "power1.in",
        },
        0
      )
      .to(
        ".persona-portrait-panel",
        {
          yPercent: -4,
          ease: "none",
        },
        0
      )
      .to(
        ".persona-product-plate",
        {
          yPercent: 4,
          ease: "none",
        },
        0
      )
      .to(
        scrollCueRef.current,
        {
          opacity: 0,
          y: 20,
          ease: "power1.in",
        },
        0
      )
      .to(
        ".hero-bottom-resolve",
        {
          opacity: 1,
          ease: "power2.in",
        },
        0.4
      );
  }, [], heroRef);

  // Button Magnetic hover effect
  const handleButtonMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isReducedMotion() || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(buttonRef.current, {
      x: x * 0.18,
      y: y * 0.18,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleButtonMouseLeave = () => {
    if (!buttonRef.current) return;
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
    });
  };

  const handleButtonMouseEnter = () => {
    if (isReducedMotion()) return;
    if (!hasHoverSweepPlayed.current && btnSweepRef.current) {
      hasHoverSweepPlayed.current = true;
      gsap.fromTo(
        btnSweepRef.current,
        { x: "-180%" },
        { x: "280%", duration: 0.9, ease: "power2.inOut" }
      );
    }
  };

  return (
    <section
      id="top"
      ref={heroRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-label="SIRRA Fine Fragrance Collection Hero"
      className="relative w-full min-h-[680px] h-[100svh] bg-ink text-cream overflow-hidden flex flex-col items-center justify-center select-none focus-visible:outline-none"
    >
      <span id="hero" className="sr-only" />

      {isCinematicMode ? (
        /* ============================================================== */
        /* MODE: CINEMATIC FULL-SCREEN VIDEO HERO                         */
        /* ============================================================== */
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {/* Scalable Video & Poster Container for Parallax */}
          <div ref={videoContainerRef} className="absolute inset-0 w-full h-full origin-center">
            {/* LCP Poster Placeholder (Instant render, high-res 2400px of sunset mosque) */}
            <Image
              src={HERO_DATA.video?.poster || "/video/hero-poster.jpg"}
              alt="SIRRA Fine Fragrance"
              fill
              priority
              quality={85}
              sizes="100vw"
              className={`object-cover object-center transition-opacity duration-1000 ${
                isVideoPlaying && !showPosterOnly ? "opacity-0" : "opacity-100"
              }`}
            />

            {/* HTML5 Video Layer */}
            {!showPosterOnly && (
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el) {
                    el.muted = true;
                    el.defaultMuted = true;
                    el.playsInline = true;
                    const p = el.play();
                    if (p !== undefined) {
                      p.catch(() => {});
                    }
                  }
                }}
                muted
                autoPlay
                loop
                playsInline
                preload="auto"
                onPlay={() => setIsVideoPlaying(true)}
                onPlaying={() => setIsVideoPlaying(true)}
                onCanPlay={handleVideoCanPlay}
                onLoadedData={handleVideoCanPlay}
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
                  isVideoPlaying ? "opacity-100" : "opacity-0"
                }`}
              >
                <source src={videoSources.mp4} type="video/mp4" />
                <source src="/video/videoplayback.mp4" type="video/mp4" />
                <source src="/video/hero.mp4" type="video/mp4" />
                <source src={videoSources.webm} type="video/webm" />
              </video>
            )}
          </div>

          {/* Overlays: Top Gradient, Bottom 45% Ink, Radial Vignette (max 30%), Film Grain */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-0 left-0 w-full h-44 bg-gradient-to-b from-ink/45 via-ink/15 to-transparent" />
            <div
              className="absolute inset-x-0 bottom-0 h-[45%]"
              style={{
                background: "linear-gradient(to top, rgba(20, 19, 18, 0.45) 0%, rgba(20, 19, 18, 0.20) 60%, transparent 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 90% 85% at 50% 50%, transparent 60%, rgba(20, 19, 18, 0.30) 100%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                mixBlendMode: "soft-light",
              }}
            />
          </div>

          {/* Bottom Centered Content Block (Davidoff Layout) */}
          <div
            ref={videoTextBlockRef}
            className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center text-center px-4 pb-12 sm:pb-16 pointer-events-none"
          >
            {/* Label: FINE FRAGRANCE · 50ML EAU DE PARFUM */}
            <div className="hero-video-label hero-video-fade-item mb-2 sm:mb-3">
              <span
                className="inline-block font-sans text-[11px] sm:text-[12px] uppercase tracking-[0.28em] font-medium text-cream/90 select-none"
                style={{ textShadow: "0 2px 8px rgba(20,19,18,0.7)" }}
              >
                {COPY.hero.label}
              </span>
            </div>

            {/* Cormorant Italic Gold Tagline with masked word reveal: clamp(40px, 5.2vw, 88px) */}
            <h1
              className="font-display italic text-gold text-[clamp(40px,5.2vw,88px)] leading-[1.08] text-center max-w-5xl mx-auto my-2 sm:my-3.5 flex items-center justify-center flex-wrap"
              style={{ textShadow: "0 2px 18px rgba(20,19,18,0.85)" }}
            >
              {taglineWords.map((word, wIdx) => (
                <span key={wIdx} className="inline-block overflow-hidden mr-[0.28em] last:mr-0">
                  <span className="hero-video-word inline-block">
                    {word}
                  </span>
                </span>
              ))}
            </h1>

            {/* Button: Discover the collection */}
            <div className="hero-video-fade-item flex flex-col items-center pointer-events-auto mt-2 sm:mt-3">
              <a
                ref={buttonRef}
                href="#scents"
                onClick={handleDiscoverClick}
                onMouseMove={handleButtonMouseMove}
                onMouseLeave={handleButtonMouseLeave}
                onMouseEnter={handleButtonMouseEnter}
                className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 bg-gold text-ink font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.2em] rounded-none overflow-hidden transition-colors duration-300 hover:bg-[#EBB43F] shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <div
                  ref={btnSweepRef}
                  aria-hidden="true"
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none -skew-x-20 -translate-x-[200%]"
                />
                <span className="relative z-10 pointer-events-none">Discover the collection</span>
              </a>
            </div>

            {/* Mobile Availability Group: Centered under button */}
            <div
              id="hero-availability-mobile"
              className="hero-video-fade-item flex min-[900px]:hidden items-center justify-center gap-2 mt-4 pointer-events-auto"
            >
              <span className="font-sans text-[9px] uppercase tracking-[0.18em] font-semibold text-cream/70 select-none">
                AVAILABLE ON
              </span>
              <div className="flex items-center gap-1.5">
                {(["amazon", "flipkart", "meesho"] as const).map((mKey) => (
                  <OutboundLink
                    key={mKey}
                    market={mKey}
                    product="collection"
                    className="h-7 px-2.5 bg-cream hover:bg-cream/90 border border-ink/15 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
                    aria-label={`Shop SIRRA on ${mKey}`}
                  >
                    <MarketLogo market={mKey} height={18} variant="compact" />
                  </OutboundLink>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Availability Group: Bottom-right, solid cream pills */}
          <div
            id="hero-availability-desktop"
            className="hero-video-fade-item absolute bottom-7 right-6 sm:right-10 z-30 hidden min-[900px]:flex items-center gap-2.5 pointer-events-auto"
          >
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-cream/70 select-none">
              AVAILABLE ON
            </span>
            <div className="flex items-center gap-2">
              {(["amazon", "flipkart", "meesho"] as const).map((mKey) => (
                <OutboundLink
                  key={mKey}
                  market={mKey}
                  product="collection"
                  className="h-8 px-3 bg-cream hover:bg-cream/90 border border-ink/15 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
                  aria-label={`Shop SIRRA on ${mKey}`}
                >
                  <MarketLogo market={mKey} height={18} variant="compact" />
                </OutboundLink>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ============================================================== */}
          {/* 1. VISUAL LAYER (FALLBACK)                                      */}
          {/* ============================================================== */}

      {isPersonaMode ? (
        /* ============================================================ */
        /* MODE 1: PERSONA HERO (New Default)                           */
        /* One slide active at a time; 4 slides in fixed order.         */
        /* ============================================================ */
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
          {PRODUCTS.map((product, idx) => {
            const isActive = idx === currentSlide;
            const slideData = HERO_DATA.slides?.[product.slug];
            const hasKv = Boolean(slideData?.kv && slideData.kv.width >= 2000);
            const videoSrc = slideData?.video?.src;
            const personaImg = IMAGES[product.image];
            const packImg = product.packShot;
            const tintHex = personaColorHex[product.color] || "#C49A45";

            return (
              <div
                key={product.slug}
                aria-hidden={!isActive}
                className={`persona-slide persona-slide-${idx} absolute inset-0 w-full h-full transition-opacity duration-300 ${
                  isActive ? "opacity-100 z-5 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {hasKv && slideData?.kv ? (
                  /* Team-Supplied Key Visual Override (Full-Bleed, >= 2000px) */
                  <div
                    onClick={() => scrollToChapter(product.slug)}
                    className="relative w-full h-full cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    tabIndex={isActive ? 0 : -1}
                    role="button"
                    aria-label={`Discover ${product.name}`}
                  >
                    <Image
                      src={slideData.kv.src}
                      alt={product.name}
                      fill
                      priority={idx === 0}
                      quality={90}
                      sizes="100vw"
                      className="hero-slide-photo object-cover object-center"
                    />
                  </div>
                ) : (
                  /* Default Persona + Product Teaser Composition */
                  <div className="relative w-full h-full max-w-[1440px] mx-auto px-4 sm:px-8 flex items-center justify-center">
                    {/* Desktop Group Layout (>= 900px) */}
                    <div className="hidden min-[900px]:flex relative items-center justify-center w-full h-full">
                      {/* Persona Portrait Panel: Native 3:4 ratio filling height, left of center */}
                      <div
                        onClick={() => scrollToChapter(product.slug)}
                        tabIndex={isActive ? 0 : -1}
                        role="button"
                        aria-label={`Discover ${product.name}`}
                        className="persona-portrait-panel relative h-[78vh] max-h-[820px] aspect-[3/4] overflow-hidden -translate-x-[12%] shadow-2xl cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold pointer-events-auto"
                      >
                        {videoSrc ? (
                          <VideoSlot
                            src={videoSrc}
                            poster={personaImg}
                            alt={product.name}
                            quality={90}
                            sizes="50vw"
                          />
                        ) : (
                          <Image
                            src={personaImg.src}
                            alt={personaImg.alt}
                            fill
                            priority={idx === 0}
                            placeholder="blur"
                            blurDataURL={personaImg.blurDataURL}
                            quality={90}
                            sizes="(max-width: 1440px) 50vw, 720px"
                            className="hero-slide-photo object-cover object-center transition-transform duration-700 ease-out group-hover:scale-103"
                          />
                        )}

                        {/* Persona Portrait Bottom Dark Gradient for Caption Legibility */}
                        <div
                          aria-hidden="true"
                          className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent pointer-events-none z-15"
                        />

                        {/* Slide Caption Group (bottom-left of portrait) */}
                        {showCaption && (
                          <div className="persona-caption-group absolute bottom-6 left-6 z-20 flex flex-col items-start gap-1 pointer-events-none">
                            <Tag color={product.color} className="shadow-md">
                              {product.number} · {product.name.toUpperCase()}
                            </Tag>
                            <span
                              className="font-display italic text-cream text-base sm:text-lg tracking-wide drop-shadow-md"
                              style={{ textShadow: "0 2px 10px rgba(20,19,18,0.95)" }}
                            >
                              {product.role}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Plate: Solid grey #ECECEA plate, aspect 4/5, height ~66% of hero, overlaps portrait right by 12% */}
                      <div
                        onClick={() => scrollToChapter(product.slug)}
                        tabIndex={isActive ? 0 : -1}
                        role="button"
                        aria-label={`Discover ${product.name}`}
                        className="persona-product-plate absolute right-[10%] xl:right-[15%] bottom-16 h-[56vh] max-h-[580px] aspect-[4/5] bg-[#ECECEA] overflow-hidden shadow-2xl cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold pointer-events-auto z-10 flex items-center justify-center p-6 sm:p-8"
                      >
                        {/* Bottle pack shot with blend mode multiply and tight contact shadow */}
                        <div className="relative w-full h-full flex flex-col items-center justify-center transition-transform duration-500 ease-out group-hover:scale-104">
                          <Image
                            src={packImg.src}
                            alt={`${product.name} Eau de Parfum`}
                            fill
                            priority={idx === 0}
                            placeholder="blur"
                            blurDataURL={packImg.blurDataURL}
                            quality={90}
                            sizes="(max-width: 1440px) 35vw, 480px"
                            className="object-contain object-center [mix-blend-mode:multiply]"
                          />
                          {/* Tight contact shadow */}
                          <div
                            aria-hidden="true"
                            className="absolute bottom-4 w-[60%] h-[12px] bg-ink/18 rounded-full blur-[6px] pointer-events-none"
                          />
                        </div>

                        {/* Thin 4px accent line under plate in persona colour */}
                        <div
                          style={{ backgroundColor: tintHex }}
                          className="absolute bottom-0 left-0 right-0 h-[4px]"
                        />
                      </div>
                    </div>

                    {/* Mobile & Tablet Stacked Layout (< 900px) */}
                    <div className="flex min-[900px]:hidden relative flex-col items-center justify-start w-full h-full pt-14 pb-4">
                      {/* Visual Stack: Portrait + Overlapping Plate */}
                      <div className="relative w-[72%] max-w-[300px] h-[40svh] max-h-[340px] aspect-[3/4] mt-2 mb-3">
                        {/* Portrait Panel fills width */}
                        <div
                          onClick={() => scrollToChapter(product.slug)}
                          tabIndex={isActive ? 0 : -1}
                          role="button"
                          aria-label={`Discover ${product.name}`}
                          className="persona-portrait-panel relative w-full h-full overflow-hidden shadow-xl cursor-pointer pointer-events-auto"
                        >
                          {videoSrc ? (
                            <VideoSlot
                              src={videoSrc}
                              poster={personaImg}
                              alt={product.name}
                              quality={90}
                              sizes="80vw"
                            />
                          ) : (
                            <Image
                              src={personaImg.src}
                              alt={personaImg.alt}
                              fill
                              priority={idx === 0}
                              placeholder="blur"
                              blurDataURL={personaImg.blurDataURL}
                              quality={90}
                              sizes="80vw"
                              className="hero-slide-photo object-cover object-center"
                            />
                          )}

                          {/* Mobile Portrait Bottom Dark Gradient */}
                          <div
                            aria-hidden="true"
                            className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent pointer-events-none z-15"
                          />

                          {/* Caption group on mobile */}
                          {showCaption && (
                            <div className="persona-caption-group absolute bottom-2 left-2 z-20 flex flex-col items-start gap-0.5 pointer-events-none">
                              <Tag color={product.color} className="text-[9px] py-0.5 px-2 shadow-sm">
                                {product.number} · {product.name.toUpperCase()}
                              </Tag>
                            </div>
                          )}
                        </div>

                        {/* Product plate overlapping bottom-right corner at 46% width */}
                        <div
                          onClick={() => scrollToChapter(product.slug)}
                          tabIndex={isActive ? 0 : -1}
                          role="button"
                          aria-label={`Discover ${product.name}`}
                          className="persona-product-plate absolute right-0 bottom-0 translate-x-[18%] translate-y-[15%] w-[46%] aspect-[4/5] bg-[#ECECEA] overflow-hidden shadow-2xl cursor-pointer pointer-events-auto z-10 flex items-center justify-center p-2.5"
                        >
                          <div className="relative w-full h-full flex items-center justify-center">
                            <Image
                              src={packImg.src}
                              alt={`${product.name} Eau de Parfum`}
                              fill
                              priority={idx === 0}
                              placeholder="blur"
                              blurDataURL={packImg.blurDataURL}
                              quality={90}
                              sizes="40vw"
                              className="object-contain object-center [mix-blend-mode:multiply]"
                            />
                          </div>
                          <div
                            style={{ backgroundColor: tintHex }}
                            className="absolute bottom-0 left-0 right-0 h-[3px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : isSingleMode ? (
        /* ============================================================ */
        /* MODE 2: SINGLE HERO VISUAL (Key visual or hero-main)         */
        /* ============================================================ */
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
        /* ============================================================ */
        /* MODE 3: 4-PANEL SPLIT (Legacy Fallback)                      */
        /* ============================================================ */
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
        >
          <div className="hidden min-[900px]:flex w-full h-full">
            {PRODUCTS.map((p, idx) => (
              <div
                key={p.slug}
                className="hero-panel relative flex-1 h-full overflow-hidden select-none border-0"
                style={desktopMaskStyles[idx]}
              >
                <Image
                  src={IMAGES[p.image].src}
                  alt=""
                  fill
                  priority={idx < 2}
                  placeholder="blur"
                  blurDataURL={IMAGES[p.image].blurDataURL}
                  quality={90}
                  sizes="25vw"
                  className="hero-panel-img object-cover object-center"
                />
              </div>
            ))}
          </div>
          <div className="grid min-[900px]:hidden grid-cols-2 grid-rows-2 w-full h-full">
            {PRODUCTS.map((p, idx) => (
              <div
                key={p.slug}
                className="hero-panel relative w-full h-full overflow-hidden select-none border-0"
              >
                <Image
                  src={IMAGES[p.image].src}
                  alt=""
                  fill
                  priority={idx < 2}
                  placeholder="blur"
                  blurDataURL={IMAGES[p.image].blurDataURL}
                  quality={90}
                  sizes="50vw"
                  className="hero-panel-img object-cover object-center"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. CONTINUOUS LAYERED GRADE OVER ENTIRE HERO                   */}
      {/* ============================================================== */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-10"
      >
        {/* Top Header Legibility Gradient (Max 45% ink behind header) */}
        <div className="absolute top-0 left-0 w-full h-44 bg-gradient-to-b from-ink/45 via-ink/15 to-transparent" />

        {/* Linear Gradient: 0% ink at middle to 45% ink at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, transparent 50%, rgba(20, 19, 18, 0.45) 100%)",
          }}
        />

        {/* Soft Vignette at Outer Edges (Max 35% ink, radial) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 85% at 50% 50%, transparent 50%, rgba(20, 19, 18, 0.35) 100%)",
          }}
        />

        {/* Film Grain Texture (5% opacity, soft-light) */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: "soft-light",
          }}
        />

        {/* Bottom Resolve to Ink into Marquee */}
        <div className="hero-bottom-resolve absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-ink via-ink/80 to-transparent opacity-0 pointer-events-none" />
      </div>

      {/* ============================================================== */}
      {/* 3. AMBIENT GOLD DUST CANVAS (Fragrance Mist Particles)         */}
      {/* ============================================================== */}
      <div ref={dustLayerRef} aria-hidden="true" className="absolute inset-0 pointer-events-none z-15">
        <HeroDustCanvas cursorPosRef={cursorPosRef} />
      </div>

      {/* Soft Radial Gold Mist behind wordmark */}
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

      {/* ============================================================== */}
      {/* 4. CENTRED TYPOGRAPHY & FIXED BRAND OVERLAY                    */}
      {/* Spans across both blocks; never moves or re-animates on rotate */}
      {/* ============================================================== */}
      <div
        ref={wordmarkBlockRef}
        className="relative z-20 w-full max-w-[1440px] mx-auto flex flex-col items-center text-center px-4 sm:px-6 py-6 pointer-events-none"
      >
        {/* Label: FINE FRAGRANCE · 50ML EAU DE PARFUM */}
        <div className="hero-center-item mb-2 sm:mb-3">
          <span
            className="inline-block font-sans text-[12px] uppercase tracking-[0.28em] font-medium text-cream/90 select-none"
            style={{ textShadow: "0 2px 8px rgba(20,19,18,0.7)" }}
          >
            FINE FRAGRANCE · 50ML EAU DE PARFUM
          </span>
        </div>

        {/* Giant SIRRA Wordmark Centred */}
        <div className="hero-wordmark-container relative inline-block overflow-hidden py-1 sm:py-2">
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

        {/* Tagline & Action Button */}
        <div className="hero-subtext-container flex flex-col items-center">
          {/* Tagline in Cormorant Italic Gold */}
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

          {/* Subline: YOUR SIRRA. */}
          <div className="hero-baseline-item mb-4 sm:mb-6">
            <span
              className="inline-block font-sans text-[11px] uppercase tracking-[0.25em] font-semibold text-cream/85 select-none"
              style={{ textShadow: "0 2px 8px rgba(20,19,18,0.6)" }}
            >
              {COPY.hero.baseline}
            </span>
          </div>

          {/* Minimal 1px Gold Ticks: Above button on mobile, bottom-centre on desktop */}
          {isPersonaMode && (
            <div
              role="tablist"
              aria-label="Fragrance hero slide selection"
              className="z-30 flex items-center gap-2.5 sm:gap-3 pointer-events-auto select-none min-[900px]:absolute min-[900px]:bottom-5 min-[900px]:left-1/2 min-[900px]:-translate-x-1/2 mb-4 min-[900px]:mb-0"
            >
              {PRODUCTS.map((p, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <button
                    key={p.slug}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Show ${p.name}`}
                    onClick={() => goToSlide(idx)}
                    className="group relative w-10 sm:w-12 h-5 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
                  >
                    {/* 1px tick background */}
                    <div className="w-full h-[1px] bg-gold/30 group-hover:bg-gold/60 transition-colors relative overflow-hidden">
                      {/* Progress fill on active tick */}
                      {isActive && (
                        <div
                          className="h-full bg-gold transition-[width] duration-75 ease-linear"
                          style={{ width: `${tickProgress}%` }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Gold Button: Discover the collection */}
          <div className="flex flex-col items-center pointer-events-auto">
            <a
              ref={buttonRef}
              href="#scents"
              onClick={handleDiscoverClick}
              onMouseMove={handleButtonMouseMove}
              onMouseLeave={handleButtonMouseLeave}
              onMouseEnter={handleButtonMouseEnter}
              className="group relative inline-flex items-center justify-center px-8 sm:px-9 py-4 sm:py-[18px] bg-gold text-ink font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.2em] rounded-none overflow-hidden transition-colors duration-300 hover:bg-[#EBB43F] shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <div
                ref={btnSweepRef}
                aria-hidden="true"
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none -skew-x-20 -translate-x-[200%]"
              />
              <span className="relative z-10 pointer-events-none">Discover the collection</span>
            </a>
          </div>

          {/* Mobile Compact Availability Group: Centered under button */}
          <div
            id="hero-availability-mobile"
            className="flex min-[900px]:hidden items-center justify-center gap-2 mt-4 pointer-events-auto"
          >
            <span className="font-sans text-[9px] uppercase tracking-[0.18em] font-semibold text-cream/70 select-none">
              AVAILABLE ON
            </span>
            <div className="flex items-center gap-1.5">
              {(["amazon", "flipkart", "meesho"] as const).map((mKey) => (
                <OutboundLink
                  key={mKey}
                  market={mKey}
                  product="collection"
                  className="h-7 px-2.5 bg-cream hover:bg-cream/90 border border-ink/15 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
                  aria-label={`Shop SIRRA on ${mKey}`}
                >
                  <MarketLogo market={mKey} height={18} variant="compact" />
                </OutboundLink>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Compact Availability Group: Bottom-right, solid cream pills, no glass */}
      <div
        id="hero-availability-desktop"
        className="absolute bottom-7 right-6 sm:right-10 z-30 hidden min-[900px]:flex items-center gap-2.5 pointer-events-auto"
      >
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-cream/70 select-none">
          AVAILABLE ON
        </span>
        <div className="flex items-center gap-2">
          {(["amazon", "flipkart", "meesho"] as const).map((mKey) => (
            <OutboundLink
              key={mKey}
              market={mKey}
              product="collection"
              className="h-8 px-3 bg-cream hover:bg-cream/90 border border-ink/15 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
              aria-label={`Shop SIRRA on ${mKey}`}
            >
              <MarketLogo market={mKey} height={18} variant="compact" />
            </OutboundLink>
          ))}
        </div>
      </div>
        </>
      )}
    </section>
  );
}

export default HeroFragranceSection;
