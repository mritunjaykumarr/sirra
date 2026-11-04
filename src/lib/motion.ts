import React, { useLayoutEffect, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger once on the client
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Check if user prefers reduced motion
 */
export function isReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Refresh ScrollTrigger calculations (call after dynamic content / images load)
 */
export function refreshScroll(): void {
  if (typeof window !== "undefined") {
    ScrollTrigger.refresh();
  }
}

/**
 * Custom hook to safely instantiate GSAP animations within a React component scope.
 * Automatically cleans up animations and ScrollTrigger instances on unmount.
 */
export function useGsap(
  callback: (ctx: gsap.Context) => void,
  deps: React.DependencyList = [],
  scope?: React.RefObject<Element | null>
): void {
  // Use useLayoutEffect in browser, useEffect during SSR
  const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context((self) => {
      callback(self);
    }, scope?.current || undefined);

    return () => {
      ctx.revert();
    };
  }, deps);
}

/**
 * Shared helper: Fade up element (opacity 0 -> 1, translateY 24px -> 0, 0.9s, power3.out)
 */
export function fadeUp(
  target: gsap.DOMTarget,
  options?: gsap.TweenVars & { start?: string }
): gsap.core.Tween | void {
  if (isReducedMotion()) {
    gsap.set(target, { opacity: 1, y: 0 });
    return;
  }

  const { start = "top 80%", ...rest } = options || {};

  return gsap.fromTo(
    target,
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: target as Element,
        start,
        once: true,
      },
      ...rest,
    }
  );
}

/**
 * Shared helper: Stagger fade up multiple elements
 */
export function fadeUpStagger(
  elements: gsap.DOMTarget,
  options?: gsap.TweenVars & { start?: string; stagger?: number; trigger?: Element }
): gsap.core.Tween | void {
  if (isReducedMotion()) {
    gsap.set(elements, { opacity: 1, y: 0 });
    return;
  }

  const { start = "top 80%", stagger = 0.1, trigger, ...rest } = options || {};
  const triggerEl = trigger || (Array.isArray(elements) ? elements[0] : (elements as Element));

  return gsap.fromTo(
    elements,
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger,
      ease: "power3.out",
      scrollTrigger: {
        trigger: triggerEl,
        start,
        once: true,
      },
      ...rest,
    }
  );
}

/**
 * Shared helper: Mask reveal for images (clip-path inset 100% to 0%, 1.1s)
 */
export function maskReveal(
  target: gsap.DOMTarget,
  options?: gsap.TweenVars & { start?: string }
): gsap.core.Tween | void {
  if (isReducedMotion()) {
    gsap.set(target, { clipPath: "inset(0% 0% 0% 0%)" });
    return;
  }

  const { start = "top 80%", ...rest } = options || {};

  return gsap.fromTo(
    target,
    { clipPath: "inset(100% 0% 0% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: target as Element,
        start,
        once: true,
      },
      ...rest,
    }
  );
}

/**
 * Shared helper: Inner parallax for images or sections (transform Y on scrub)
 */
export function parallax(
  target: gsap.DOMTarget,
  amount: number = 0.1,
  options?: { trigger?: Element; start?: string; end?: string }
): gsap.core.Tween | void {
  if (isReducedMotion()) {
    return;
  }

  const { trigger, start = "top bottom", end = "bottom top" } = options || {};
  const triggerEl = trigger || (target as Element);

  const moveDistance = amount * 100;

  return gsap.fromTo(
    target,
    { y: -moveDistance },
    {
      y: moveDistance,
      ease: "none",
      scrollTrigger: {
        trigger: triggerEl,
        start,
        end,
        scrub: true,
      },
    }
  );
}

/**
 * Shared helper: Word reveal with scroll scrub (words animate from 15% to 100% opacity)
 */
export function wordReveal(
  container: HTMLElement,
  options?: { start?: string; end?: string; scrub?: number | boolean }
): void {
  const words = container.querySelectorAll(".reveal-word");
  if (words.length === 0) return;

  if (isReducedMotion()) {
    gsap.set(words, { opacity: 1 });
    return;
  }

  const { start = "top 80%", end = "bottom 55%", scrub = 0.5 } = options || {};

  gsap.fromTo(
    words,
    { opacity: 0.15 },
    {
      opacity: 1,
      stagger: 0.05,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start,
        end,
        scrub,
      },
    }
  );
}
