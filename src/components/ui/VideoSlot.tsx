"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { type ImageData } from "@/content/images";

export interface VideoSlotProps {
  slug?: string;
  src?: string | null;
  poster: ImageData;
  alt: string;
  className?: string;
  kenBurns?: boolean;
  aspectRatio?: string;
  sizes?: string;
  quality?: number;
}

export function VideoSlot({
  slug,
  src,
  poster,
  alt,
  className = "",
  kenBurns = false,
  aspectRatio = "4/5",
  sizes = "(max-width: 1024px) 100vw, 540px",
  quality = 90,
}: VideoSlotProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    if (!src) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const checkAllowed = () => {
      const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
      const isSaveData = conn?.saveData === true;
      setCanPlay(!mediaQuery.matches && !isSaveData);
    };

    checkAllowed();
    mediaQuery.addEventListener("change", checkAllowed);
    return () => mediaQuery.removeEventListener("change", checkAllowed);
  }, [src]);

  // Pause video when off-screen via IntersectionObserver
  useEffect(() => {
    if (!src || !canPlay || !videoRef.current || !containerRef.current) return;

    const videoEl = videoRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoEl.play().catch(() => {
              // Browser autoplay policy catch
            });
          } else {
            videoEl.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [src, canPlay]);

  const showVideo = Boolean(src && canPlay);
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div
      ref={containerRef}
      style={aspectRatio ? { aspectRatio } : undefined}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      {showVideo && src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster.src}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-label={alt}
          className="w-full h-full object-cover object-center"
        />
      ) : (
        <div className="relative w-full h-full overflow-hidden group/video-fallback">
          <Image
            src={poster.src}
            alt={alt}
            fill
            placeholder="blur"
            blurDataURL={poster.blurDataURL}
            sizes={sizes}
            quality={quality}
            className={`object-cover object-center transition-transform duration-1000 ease-out hover:scale-106 ${
              kenBurns ? "animate-kenburns motion-reduce:animate-none" : ""
            }`}
          />

          {/* Dev-only badge when no video file exists */}
          {isDev && !src && slug && (
            <div
              className="absolute top-3 left-3 z-20 px-2 py-0.5 bg-ink/80 text-cream/70 text-[10px] font-mono tracking-wider uppercase border border-cream/20 rounded-xs pointer-events-none"
              aria-hidden="true"
            >
              video slot: {slug}.mp4 missing
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VideoSlot;
