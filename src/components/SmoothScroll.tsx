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

    // Global anchor link smooth scroll handler with header height offset (-70px)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const id = href.slice(1);
        const element = document.getElementById(id);
        if (element) {
          e.preventDefault();
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
        }
      }
    };

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
      window.addEventListener("scroll", ScrollTrigger.update, { passive: true });

      const updateTicker = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(updateTicker);
      gsap.ticker.lagSmoothing(0);

      return () => {
        document.removeEventListener("click", handleAnchorClick);
        window.removeEventListener("scroll", ScrollTrigger.update);
        gsap.ticker.remove(updateTicker);
        delete (window as unknown as { lenis?: Lenis }).lenis;
        lenis.destroy();
        lenisRef.current = null;
      };
    }

    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  return <>{children}</>;
}

export default SmoothScroll;

