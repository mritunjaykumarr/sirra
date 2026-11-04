"use client";

import React, { useEffect, useRef } from "react";
import { isReducedMotion } from "@/lib/motion";

interface Particle {
  x: number;
  y: number;
  size: number;
  depth: number;
  speedY: number;
  speedX: number;
  phase: number;
  opacity: number;
  colorStr: string;
  repelX: number;
  repelY: number;
}

export interface HeroDustCanvasProps {
  cursorPosRef?: React.RefObject<{ x: number; y: number; active: boolean } | null>;
  className?: string;
}

export function HeroDustCanvas({ cursorPosRef, className = "" }: HeroDustCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check reduced motion or Save-Data
    if (isReducedMotion()) return;
    const nav = navigator as unknown as { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData === true) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number | null = null;
    let isVisible = true;
    let isTabActive = true;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Check device capability
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const particleCount = isMobile ? 35 : 70;

    // Pre-allocate particles array (created once, zero allocations in loop)
    const particles: Particle[] = [];

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        const depth = 0.2 + Math.random() * 0.8;
        const size = (0.6 + depth * 1.4) * 0.9;
        const opacity = Math.min(0.5, 0.12 + depth * 0.38);
        const isGold = Math.random() > 0.4;
        const colorStr = isGold
          ? `rgba(224, 165, 43, ${opacity.toFixed(3)})`
          : `rgba(243, 240, 234, ${opacity.toFixed(3)})`;

        particles.push({
          x: Math.random() * (width || 1440),
          y: Math.random() * (height || 900),
          size,
          depth,
          speedY: -(0.2 + depth * 0.45),
          speedX: (Math.random() - 0.5) * 0.15,
          phase: Math.random() * Math.PI * 2,
          opacity,
          colorStr,
          repelX: 0,
          repelY: 0,
        });
      }
    };

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particles.length === 0) {
        initParticles();
      }
    };

    updateSize();

    // ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(canvas);

    // IntersectionObserver to pause when hero is off-screen
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry.isIntersecting;
        if (isVisible && isTabActive && animId === null) {
          lastTime = performance.now();
          animId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(canvas);

    // Page Visibility API
    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
      if (isVisible && isTabActive && animId === null) {
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let lastTime = performance.now();

    const render = (now: number) => {
      if (!isVisible || !isTabActive) {
        animId = null;
        return;
      }

      // Delta time capped to avoid jumps after wake
      const dt = Math.min((now - lastTime) / 16.666, 2.5);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      const cursor = cursorPosRef?.current;
      const hasCursor = cursor && cursor.active;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Curl noise drift (slow sine wave horizontal sway)
        p.phase += 0.012 * dt;
        const sway = Math.sin(p.phase) * 0.28 + Math.cos(p.phase * 0.6) * 0.16;

        p.x += (p.speedX + sway * p.depth) * dt;
        p.y += p.speedY * dt;

        // Cursor repulsion within 140px (desktop fine pointer only)
        let targetRepelX = 0;
        let targetRepelY = 0;

        if (hasCursor) {
          const dx = p.x - cursor.x;
          const dy = p.y - cursor.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 19600 && distSq > 1) {
            // 140 * 140 = 19600
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / 140) * 30;
            targetRepelX = (dx / dist) * force;
            targetRepelY = (dy / dist) * force;
          }
        }

        // Smooth ease back
        p.repelX += (targetRepelX - p.repelX) * 0.08 * dt;
        p.repelY += (targetRepelY - p.repelY) * 0.08 * dt;

        // Screen boundary wrapping
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        } else if (p.y > height + 10) {
          p.y = -10;
        }

        if (p.x < -10) {
          p.x = width + 10;
        } else if (p.x > width + 10) {
          p.x = -10;
        }

        // Draw particle
        ctx.beginPath();
        ctx.fillStyle = p.colorStr;
        ctx.arc(p.x + p.repelX, p.y + p.repelY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [cursorPosRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none z-15 ${className}`}
    />
  );
}

export default HeroDustCanvas;
