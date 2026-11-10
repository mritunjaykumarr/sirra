"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { HERO_YT_CONFIG, HERO_DATA } from "@/content/hero";

// Strict TypeScript Interfaces for YouTube IFrame Player API (no `any`)
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

interface YTEvent {
  target: YTPlayer;
  data: number;
}

interface YTPlayerOptions {
  host?: string;
  videoId: string;
  width?: string | number;
  height?: string | number;
  playerVars?: Record<string, string | number | boolean>;
  events?: {
    onReady?: (event: YTEvent) => void;
    onStateChange?: (event: YTEvent) => void;
    onError?: (event: YTEvent) => void;
  };
}

interface YTNamespace {
  Player: new (elementId: string | HTMLElement, options: YTPlayerOptions) => YTPlayer;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface HeroYouTubeProps {
  isHeroInView: boolean;
  isTabVisible: boolean;
  onFallback?: () => void;
}

const YT_EMBED_HOST = "https://www.youtube-nocookie.com";
const YT_API_SCRIPT_SRC = "https://www.youtube.com/iframe_api";

export default function HeroYouTube({
  isHeroInView,
  isTabVisible,
  onFallback,
}: HeroYouTubeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerMountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stallTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showPosterOnly, setShowPosterOnly] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const isPlayingRef = useRef(false);

  const posterSrc =
    HERO_DATA.video?.poster ||
    (HERO_DATA.image?.src ? HERO_DATA.image.src : "/images/hero-mist.jpg");

  const startSeconds = HERO_YT_CONFIG.start;
  const endSeconds = HERO_YT_CONFIG.end;

  const handleFailure = useCallback(
    (reason: string) => {
      if (typeof console !== "undefined") {
        console.warn(`[Hero YouTube Preview] ${reason}. Falling back to poster.`);
      }
      setHasFailed(true);
      setShowPosterOnly(true);
      isPlayingRef.current = false;
      if (playerMountRef.current) {
        playerMountRef.current.innerHTML = "";
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (stallTimerRef.current) {
        clearTimeout(stallTimerRef.current);
        stallTimerRef.current = null;
      }
      if (onFallback) {
        onFallback();
      }
    },
    [onFallback]
  );

  // 1. Evaluate Constraints (Reduced motion, Save-Data, slow connection)
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const isReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const nav =
        typeof navigator !== "undefined"
          ? (navigator as unknown as {
              connection?: { saveData?: boolean; effectiveType?: string };
            })
          : null;
      const isSaveData = nav?.connection?.saveData === true;
      const eff = nav?.connection?.effectiveType;
      const isSlow = eff === "slow-2g" || eff === "2g" || eff === "3g";

      if (isReduced || isSaveData || isSlow) {
        setShowPosterOnly(true);
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  // 2. Load YouTube API and Initialize Player on Idle / Interaction (Max 2s Delay for LCP)
  useEffect(() => {
    if (showPosterOnly || hasFailed) return;

    let isCancelled = false;
    let hasTriggeredLoad = false;
    let hasInitPlayer = false;
    let idleHandle: number | null = null;
    let idleTimer: NodeJS.Timeout | null = null;

    const initPlayer = () => {
      if (hasInitPlayer || isCancelled || !playerMountRef.current || !window.YT || !window.YT.Player) return;
      hasInitPlayer = true;

      try {
        const origin =
          typeof window !== "undefined" && window.location.origin
            ? window.location.origin
            : "http://localhost:3000";

        playerRef.current = new window.YT.Player(playerMountRef.current, {
          host: YT_EMBED_HOST,
          videoId: HERO_YT_CONFIG.id,
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            start: startSeconds > 0 ? startSeconds : 0,
            origin,
          },
          events: {
            onReady: (event: YTEvent) => {
              if (isCancelled) return;
              try {
                event.target.mute();
                event.target.playVideo();
              } catch {}
            },
            onStateChange: (event: YTEvent) => {
              if (isCancelled) return;
              const YTState = window.YT?.PlayerState;
              if (!YTState) return;

              // PLAYING State (1)
              if (event.data === YTState.PLAYING) {
                isPlayingRef.current = true;
                setIsPlaying(true);
                if (stallTimerRef.current) {
                  clearTimeout(stallTimerRef.current);
                  stallTimerRef.current = null;
                }

                // Scene loop timer: Poll current time every 200ms
                if (!pollIntervalRef.current) {
                  pollIntervalRef.current = setInterval(() => {
                    if (!playerRef.current) return;
                    try {
                      const cur = playerRef.current.getCurrentTime();
                      if (endSeconds > startSeconds && cur >= endSeconds - 0.15) {
                        playerRef.current.seekTo(startSeconds, true);
                      }
                    } catch {}
                  }, 200);
                }
              } else if (event.data === YTState.ENDED) {
                // Loop back to start without showing end cards
                try {
                  event.target.seekTo(startSeconds, true);
                  event.target.playVideo();
                } catch {}
              }
            },
            onError: (event: YTEvent) => {
              handleFailure(`YouTube player reported error code: ${event.data}`);
            },
          },
        });
      } catch (err) {
        handleFailure(`Failed to initialize YT.Player: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    const loadApi = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
        return;
      }

      // Check if script tag already exists
      const existingScript = document.querySelector(`script[src="${YT_API_SCRIPT_SRC}"]`);
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.src = YT_API_SCRIPT_SRC;
        tag.async = true;
        tag.onerror = () => {
          handleFailure("Failed to load YouTube IFrame API script");
        };
        const firstScriptTag = document.getElementsByTagName("script")[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
          document.head.appendChild(tag);
        }
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) {
          try {
            prevCallback();
          } catch {}
        }
        if (!isCancelled) {
          initPlayer();
        }
      };
    };

    const triggerLoad = () => {
      if (hasTriggeredLoad || isCancelled) return;
      hasTriggeredLoad = true;
      interactionEvents.forEach((evt) => window.removeEventListener(evt, onFirstInteraction));
      if (idleTimer) clearTimeout(idleTimer);
      if (idleHandle !== null && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleHandle);
      }

      // 5-second stall watchdog begins immediately upon loading attempt
      if (!stallTimerRef.current) {
        stallTimerRef.current = setTimeout(() => {
          if (!isPlayingRef.current && !isCancelled) {
            handleFailure("Playback stalled for 5 seconds without reaching PLAYING state");
          }
        }, 5000);
      }

      loadApi();
    };

    // Trigger on requestIdleCallback or first interaction within 2s to protect LCP
    const interactionEvents = ["scroll", "touchstart", "pointerdown", "keydown"];
    const onFirstInteraction = () => {
      triggerLoad();
    };

    interactionEvents.forEach((evt) =>
      window.addEventListener(evt, onFirstInteraction, { passive: true, once: true })
    );

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleHandle = (window as unknown as { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number }).requestIdleCallback(
        triggerLoad,
        { timeout: 2000 }
      );
      idleTimer = setTimeout(triggerLoad, 2000);
    } else {
      idleTimer = setTimeout(triggerLoad, 800);
    }

    return () => {
      isCancelled = true;
      interactionEvents.forEach((evt) => window.removeEventListener(evt, onFirstInteraction));
      if (idleTimer) clearTimeout(idleTimer);
      if (idleHandle !== null && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleHandle);
      }
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
      }
    };
  }, [showPosterOnly, hasFailed, startSeconds, endSeconds, handleFailure]);

  // 3. Tab Visibility & In-View Play/Pause Lifecycle Management
  useEffect(() => {
    if (!playerRef.current || showPosterOnly || hasFailed) return;

    try {
      if (!isHeroInView || !isTabVisible) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch {}
  }, [isHeroInView, isTabVisible, showPosterOnly, hasFailed]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
      {/* LCP Poster Placeholder (Instant render, zero layout shift) */}
      <Image
        src={posterSrc}
        alt="SIRRA Fine Fragrance"
        fill
        priority
        quality={85}
        sizes="100vw"
        className={`object-cover object-center transition-opacity duration-1000 ${
          isPlaying && !showPosterOnly && !hasFailed ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* YouTube Player Scaled to Cover Hero without Title/Controls */}
      {!showPosterOnly && !hasFailed && (
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] min-w-[177.78vh] min-h-[56.25vw] aspect-video transition-opacity duration-1000 ${
            isPlaying ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: "translate(-50%, -50%) scale(1.15)",
            transformOrigin: "center center",
          }}
          aria-hidden="true"
          tabIndex={-1}
        >
          <div ref={playerMountRef} className="w-full h-full pointer-events-none" />
        </div>
      )}
    </div>
  );
}

