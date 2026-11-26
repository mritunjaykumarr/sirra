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
 * Check if viewport is desktop (>= 1024px) with a fine pointer and motion allowed
 */
export function prefersFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  if (isReducedMotion()) return false;
  return (
    window.innerWidth >= 1024 &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
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
 * Refresh ScrollTrigger once webfonts and page assets are loaded.
 * Returns a cleanup callback.
 */
export function refreshScrollOnReady(): () => void {
  if (typeof window === "undefined") return () => {};
  let active = true;

  const onReady = () => {
    if (active) {
      ScrollTrigger.refresh();
    }
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(onReady).catch(() => {});
  }

  if (document.readyState === "complete") {
    requestAnimationFrame(onReady);
  } else {
    window.addEventListener("load", onReady, { once: true });
  }

  return () => {
    active = false;
    window.removeEventListener("load", onReady);
  };
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
 * Shared helper: Character masked rise reveal (staggered letters from line boxes)
 */
export function characterReveal(
  chars: gsap.DOMTarget,
  options?: { trigger?: Element; start?: string; stagger?: number; delay?: number; duration?: number }
): gsap.core.Tween | void {
  if (isReducedMotion()) {
    gsap.set(chars, { yPercent: 0, opacity: 1 });
    return;
  }

  const {
    trigger,
    start = "top 80%",
    stagger = 0.04,
    delay = 0,
    duration = 0.7,
  } = options || {};

  const triggerEl = trigger || (Array.isArray(chars) ? (chars[0] as Element) : (chars as Element));

  return gsap.fromTo(
    chars,
    { yPercent: 110, opacity: 0 },
    {
      yPercent: 0,
      opacity: 1,
      duration,
      stagger,
      delay,
      ease: "power3.out",
      scrollTrigger: triggerEl
        ? {
            trigger: triggerEl,
            start,
            once: true,
          }
        : undefined,
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
 * Shared helper: Animate SVG stroke-dashoffset to 0
 */
export function strokeDraw(
  target: gsap.DOMTarget,
  options?: { trigger?: Element; start?: string; duration?: number; fromOffset?: number; delay?: number }
): gsap.core.Tween | void {
  if (isReducedMotion()) {
    gsap.set(target, { strokeDashoffset: 0 });
    return;
  }

  const {
    trigger,
    start = "top 80%",
    duration = 1.0,
    fromOffset = 100,
    delay = 0,
  } = options || {};

  return gsap.fromTo(
    target,
    { strokeDashoffset: fromOffset },
    {
      strokeDashoffset: 0,
      duration,
      delay,
      ease: "power2.out",
      scrollTrigger: trigger
        ? {
            trigger,
            start,
            once: true,
          }
        : undefined,
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

  const { start = "top 80%", end = "bottom 55%", scrub = true } = options || {};

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

export interface InteractiveController {
  setPaused: (paused: boolean) => void;
  destroy: () => void;
}

/**
 * Desktop fine-pointer 3D tilt (lerped, transform-only, no glare, returns to rest on leave)
 */
export function attachPointerTilt(
  element: HTMLElement,
  options?: { maxDeg?: number; perspective?: number; easeFactor?: number }
): InteractiveController {
  const { maxDeg = 4, perspective = 1000, easeFactor = 0.12 } = options || {};

  if (!prefersFinePointer()) {
    return {
      setPaused: () => {},
      destroy: () => {},
    };
  }

  let paused = false;
  let rafId: number | null = null;
  let targetRx = 0;
  let targetRy = 0;
  let currentRx = 0;
  let currentRy = 0;

  const stopLoop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const renderFrame = () => {
    currentRx += (targetRx - currentRx) * easeFactor;
    currentRy += (targetRy - currentRy) * easeFactor;

    const done =
      Math.abs(targetRx - currentRx) < 0.02 &&
      Math.abs(targetRy - currentRy) < 0.02;

    if (done) {
      currentRx = targetRx;
      currentRy = targetRy;
    }

    if (currentRx === 0 && currentRy === 0) {
      element.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`;
    } else {
      element.style.transform = `perspective(${perspective}px) rotateX(${currentRx.toFixed(2)}deg) rotateY(${currentRy.toFixed(2)}deg)`;
    }

    if (done && targetRx === 0 && targetRy === 0) {
      rafId = null;
      return;
    }

    if (!done) {
      rafId = requestAnimationFrame(renderFrame);
    } else {
      rafId = null;
    }
  };

  const ensureLoop = () => {
    if (rafId === null && !paused) {
      rafId = requestAnimationFrame(renderFrame);
    }
  };

  const onMove = (e: PointerEvent) => {
    if (paused || !prefersFinePointer() || e.pointerType === "touch") return;
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    targetRx = Math.max(-maxDeg, Math.min(maxDeg, -normY * maxDeg));
    targetRy = Math.max(-maxDeg, Math.min(maxDeg, normX * maxDeg));
    ensureLoop();
  };

  const onLeave = () => {
    targetRx = 0;
    targetRy = 0;
    ensureLoop();
  };

  element.addEventListener("pointermove", onMove, { passive: true });
  element.addEventListener("pointerleave", onLeave, { passive: true });

  return {
    setPaused: (nextPaused: boolean) => {
      paused = nextPaused;
      if (paused) {
        stopLoop();
        targetRx = 0;
        targetRy = 0;
        currentRx = 0;
        currentRy = 0;
        element.style.transform = "";
      }
    },
    destroy: () => {
      stopLoop();
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      element.style.transform = "";
    },
  };
}

/**
 * Desktop fine-pointer subtle magnetic translation (up to maxPx, transform-only)
 */
export function attachMagnetic(
  element: HTMLElement,
  options?: { maxPx?: number; easeFactor?: number }
): InteractiveController {
  const { maxPx = 6, easeFactor = 0.16 } = options || {};

  if (!prefersFinePointer()) {
    return {
      setPaused: () => {},
      destroy: () => {},
    };
  }

  let paused = false;
  let rafId: number | null = null;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const stopLoop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const renderFrame = () => {
    currentX += (targetX - currentX) * easeFactor;
    currentY += (targetY - currentY) * easeFactor;

    const done =
      Math.abs(targetX - currentX) < 0.05 &&
      Math.abs(targetY - currentY) < 0.05;

    if (done) {
      currentX = targetX;
      currentY = targetY;
    }

    element.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

    if (done && targetX === 0 && targetY === 0) {
      element.style.transform = "";
      rafId = null;
      return;
    }

    if (!done) {
      rafId = requestAnimationFrame(renderFrame);
    } else {
      rafId = null;
    }
  };

  const ensureLoop = () => {
    if (rafId === null && !paused) {
      rafId = requestAnimationFrame(renderFrame);
    }
  };

  const onMove = (e: PointerEvent) => {
    if (paused || !prefersFinePointer() || e.pointerType === "touch") return;
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    targetX = Math.max(-maxPx, Math.min(maxPx, normX * maxPx));
    targetY = Math.max(-maxPx, Math.min(maxPx, normY * maxPx));
    ensureLoop();
  };

  const onLeave = () => {
    targetX = 0;
    targetY = 0;
    ensureLoop();
  };

  element.addEventListener("pointermove", onMove, { passive: true });
  element.addEventListener("pointerleave", onLeave, { passive: true });

  return {
    setPaused: (nextPaused: boolean) => {
      paused = nextPaused;
      if (paused) {
        stopLoop();
        targetX = 0;
        targetY = 0;
        currentX = 0;
        currentY = 0;
        element.style.transform = "";
      }
    },
    destroy: () => {
      stopLoop();
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      element.style.transform = "";
    },
  };
}
