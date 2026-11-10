"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface SmoothScrollProps {
  children: React.ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

    // Helper to scroll to target element with -70px header offset
    const scrollToTarget = (element: HTMLElement) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(element, { offset: -70 });
      } else {
        const rect = element.getBoundingClientRect();
        const topOffset = rect.top + window.scrollY - 70;
        window.scrollTo({
          top: Math.max(0, topOffset),
          behavior: prefersReducedMotion ? "instant" : "smooth",
        });
      }
    };

    // Global anchor link smooth scroll handler with header height offset (-70px)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (href) {
        let hashId = "";
        if (href.startsWith("#") && href.length > 1) {
          hashId = href.slice(1);
        } else if (href.startsWith("/#") && href.length > 2) {
          hashId = href.slice(2);
        }

        if (hashId) {
          // Redirect #range to #scents
          const effectiveId = hashId === "range" ? "scents" : hashId;
          const element = document.getElementById(effectiveId);
          if (element) {
            e.preventDefault();
            scrollToTarget(element);
          }
        }
      }
    };

    // URL Hash redirect on load / hashchange: scroll to target with -70px offset (redirects #range to #scents)
    const handleHashRedirect = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash;
        if (hash && hash.length > 1) {
          const rawId = hash.slice(1);
          const effectiveId = rawId === "range" ? "scents" : rawId;
          const targetEl = document.getElementById(effectiveId);
          if (targetEl) {
            setTimeout(() => {
              scrollToTarget(targetEl);
            }, 100);
          }
        }
      }
    };
    handleHashRedirect();
    window.addEventListener("hashchange", handleHashRedirect);

    document.addEventListener("click", handleAnchorClick, { passive: false });

    // Enable Lenis only on non-reduced-motion desktop devices
    if (!prefersReducedMotion && !isCoarsePointer) {
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
      });
      lenisRef.current = lenis;
      (window as unknown as { lenis?: Lenis }).lenis = lenis;

      lenis.on("scroll", ScrollTrigger.update);

      const updateTicker = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(updateTicker);
      gsap.ticker.lagSmoothing(0);

      return () => {
        document.removeEventListener("click", handleAnchorClick);
        window.removeEventListener("hashchange", handleHashRedirect);
        lenis.off("scroll", ScrollTrigger.update);
        gsap.ticker.remove(updateTicker);
        delete (window as unknown as { lenis?: Lenis }).lenis;
        lenis.destroy();
        lenisRef.current = null;
      };
    }

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("hashchange", handleHashRedirect);
    };
  }, []);

  return <>{children}</>;
}

export default SmoothScroll;

