"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Wordmark from "./ui/Wordmark";
import { IMAGES } from "@/content";
import { isReducedMotion } from "@/lib/motion";
import gsap from "gsap";

export interface MenuOverlayProps {
  isOpen: boolean;
  isPinned: boolean;
  onClose: () => void;
  onMouseEnterDrawer?: () => void;
  onMouseLeaveDrawer?: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

type PreviewKey = "default" | "name" | "flexes" | "collection" | "buy";

interface MenuItem {
  title: string;
  label: string;
  href: string;
  preview: PreviewKey;
  isAnchor: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  {
    title: "The name",
    label: "WHERE IT COMES FROM",
    href: "/#name",
    preview: "name",
    isAnchor: true,
  },
  {
    title: "Four flexes",
    label: "ONE IDEA · FOUR FLEXES",
    href: "/#scents",
    preview: "flexes",
    isAnchor: true,
  },
  {
    title: "The collection",
    label: "50ML EAU DE PARFUM",
    href: "/#collection",
    preview: "collection",
    isAnchor: true,
  },
  {
    title: "Where to buy",
    label: "AMAZON · FLIPKART · MEESHO",
    href: "/#availability",
    preview: "buy",
    isAnchor: true,
  },
];

export function MenuOverlay({
  isOpen,
  isPinned,
  onClose,
  onMouseEnterDrawer,
  onMouseLeaveDrawer,
  triggerRef,
}: MenuOverlayProps) {
  const pathname = usePathname();
  const router = useRouter();

  const drawerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const linksScrollRef = useRef<HTMLDivElement>(null);

  const [hoveredPreview, setHoveredPreview] = useState<PreviewKey>("default");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // Check desktop vs mobile viewport and pointer capability
  useEffect(() => {
    const checkIsDesktop = () => {
      if (typeof window !== "undefined") {
        const matchesWidth = window.innerWidth >= 900;
        const matchesHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        setIsDesktop(matchesWidth && matchesHover);
      }
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);

    if (isReducedMotion() || !drawerRef.current) {
      setIsClosing(false);
      onClose();
      return;
    }

    if (isDesktop) {
      // Fade out backdrop
      if (backdropRef.current) {
        gsap.to(backdropRef.current, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
        });
      }
      // Retract preview panel if visible
      if (previewRef.current) {
        gsap.to(previewRef.current, {
          xPercent: -100,
          duration: 0.35,
          ease: "power3.in",
        });
      }
      // Slide drawer out to the left
      gsap.to(drawerRef.current, {
        xPercent: -100,
        duration: 0.4,
        ease: "power3.in",
        onComplete: () => {
          setIsClosing(false);
          onClose();
        },
      });
    } else {
      // Mobile full-screen curtain reverse
      if (backdropRef.current) {
        gsap.to(backdropRef.current, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
        });
      }
      gsap.to(drawerRef.current, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.45,
        ease: "power4.inOut",
        onComplete: () => {
          setIsClosing(false);
          onClose();
        },
      });
    }
  }, [isClosing, isDesktop, onClose]);

  // Handle Entrance animations when isOpen changes
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;
    setIsClosing(false);

    if (isReducedMotion()) {
      gsap.set(drawerRef.current, { opacity: 1, xPercent: 0, clipPath: "none" });
      if (previewRef.current) gsap.set(previewRef.current, { opacity: 1, xPercent: 0 });
      if (backdropRef.current) gsap.set(backdropRef.current, { opacity: 1 });
    } else if (isDesktop) {
      if (backdropRef.current) {
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: "power2.out" }
        );
      }
      // Desktop: Slide in drawer from left (translateX -100% to 0)
      gsap.fromTo(
        drawerRef.current,
        { xPercent: -100 },
        { xPercent: 0, duration: 0.6, ease: "power3.out" }
      );
    } else {
      // Mobile: Full-screen curtain wipe from bottom/top
      gsap.fromTo(
        drawerRef.current,
        { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: 0.75, ease: "power4.inOut" }
      );

      const riseItems = drawerRef.current.querySelectorAll(".menu-rise-wrapper");
      if (riseItems.length > 0) {
        gsap.fromTo(
          riseItems,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.08,
            delay: 0.2,
            ease: "power3.out",
          }
        );
      }
    }
  }, [isOpen, isDesktop]);

  // Animate Preview Panel on link hover/focus (Desktop only)
  useEffect(() => {
    if (!isDesktop || !previewRef.current) return;

    if (activeIndex !== null) {
      // A link is hovered/focused: slide preview panel out from behind drawer
      if (isReducedMotion()) {
        gsap.to(previewRef.current, { opacity: 1, duration: 0.3 });
      } else {
        gsap.to(previewRef.current, {
          x: "0%",
          xPercent: 0,
          duration: 0.5,
          ease: "power3.out",
        });
      }
    } else {
      // No link hovered: retract behind drawer
      if (isReducedMotion()) {
        gsap.to(previewRef.current, { opacity: 0, duration: 0.2 });
      } else {
        gsap.to(previewRef.current, {
          x: "-100%",
          xPercent: 0,
          duration: 0.4,
          ease: "power3.in",
        });
      }
    }
  }, [activeIndex, isDesktop]);

  // Modal vs Non-Modal Ergonomics: Pinned mode locks scroll and traps focus
  useEffect(() => {
    if (!isOpen) return;

    const isModal = isPinned || !isDesktop;
    let originalOverflow = "";
    const triggerNode = triggerRef?.current;

    if (isModal) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      if (
        typeof window !== "undefined" &&
        (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis
      ) {
        (window as unknown as { lenis?: { stop: () => void } }).lenis?.stop();
      }

      // In pinned modal mode, focus the close button or first link
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 70);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          handleClose();
          return;
        }

        if (e.key === "Tab" && drawerRef.current) {
          const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;

          const firstElement = focusable[0];
          const lastElement = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        if (
          typeof window !== "undefined" &&
          (window as unknown as { lenis?: { start: () => void } }).lenis
        ) {
          (window as unknown as { lenis?: { start: () => void } }).lenis?.start();
        }
        window.removeEventListener("keydown", handleKeyDown);
        clearTimeout(timer);
        triggerNode?.focus();
      };
    } else {
      // In hover mode: Escape still closes, and keyboard listeners return focus
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          handleClose();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, isPinned, isDesktop, handleClose, triggerRef]);

  if (!isOpen) return null;

  const handleLinkClick = (e: React.MouseEvent, item: MenuItem) => {
    if (item.isAnchor && pathname === "/") {
      e.preventDefault();
      handleClose();
      const targetId = item.href.replace(/^\/?#/, "");
      const el = document.getElementById(targetId);
      if (el) {
        if (
          typeof window !== "undefined" &&
          (window as unknown as { lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).lenis
        ) {
          (window as unknown as { lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).lenis?.scrollTo(
            el,
            { offset: -70 }
          );
        } else {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else if (!item.isAnchor) {
      e.preventDefault();
      handleClose();
      router.push(item.href);
    } else {
      handleClose();
    }
  };

  const isModal = isPinned || !isDesktop;

  return (
    <>
      {/* Full-viewport backdrop directly under the drawer (above header and announcement bar at z-45) */}
      <div
        ref={backdropRef}
        onClick={isPinned || !isDesktop ? handleClose : undefined}
        aria-hidden="true"
        style={{
          WebkitBackdropFilter: isReducedMotion() ? "none" : "blur(10px) saturate(1.05)",
          backdropFilter: isReducedMotion() ? "none" : "blur(10px) saturate(1.05)",
        }}
        className={`fixed inset-0 z-45 bg-ink/30 menu-backdrop-blur transition-opacity duration-400 ease-out ${
          isPinned || !isDesktop
            ? "pointer-events-auto cursor-pointer"
            : "pointer-events-none"
        }`}
      />

      {/* Main Drawer Container */}
      <div
        id="site-menu-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal={isModal}
        aria-label="Site Navigation"
        onMouseEnter={onMouseEnterDrawer}
        onMouseLeave={onMouseLeaveDrawer}
        className={`fixed top-0 bottom-0 left-0 z-50 h-[100dvh] flex flex-col bg-cream text-ink select-none overflow-hidden transition-shadow ${
          isDesktop
            ? "w-[460px] max-w-[90vw] shadow-2xl border-r border-ink/10"
            : "w-full"
        }`}
      >
        {/* Top Bar: Fixed Height (Wordmark left, Close right) */}
        <header className="h-[72px] shrink-0 w-full px-6 sm:px-10 flex items-center justify-between border-b border-ink/10 z-20 bg-cream">
          <Wordmark size="sm" />
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className="font-sans uppercase text-xs tracking-widest px-3 py-2 text-ink hover:text-rust transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label="Close menu"
          >
            Close
          </button>
        </header>

        {/* Links Navigation Area: fills remaining height with space-evenly */}
        <div className="flex-1 min-h-0 w-full flex flex-col px-6 sm:px-10">
          <nav
            ref={linksScrollRef}
            data-lenis-prevent="true"
            className="flex-1 min-h-0 flex flex-col justify-evenly py-2 overflow-y-auto overscroll-contain menu-scrollbar"
          >
            {MENU_ITEMS.map((item, index) => {
              const isHovered = activeIndex === index;
              const isOtherHovered = activeIndex !== null && !isHovered;

              return (
                <div
                  key={item.href}
                  className="menu-item-row flex-1 flex flex-col justify-center min-h-0 py-1 transition-opacity duration-300"
                  style={{ opacity: isOtherHovered ? 0.35 : 1 }}
                >
                  <Link
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item)}
                    onMouseEnter={() => {
                      setActiveIndex(index);
                      setHoveredPreview(item.preview);
                    }}
                    onMouseLeave={() => {
                      setActiveIndex(null);
                      setHoveredPreview("default");
                    }}
                    onFocus={() => {
                      setActiveIndex(index);
                      setHoveredPreview(item.preview);
                    }}
                    onBlur={() => {
                      setActiveIndex(null);
                      setHoveredPreview("default");
                    }}
                    className="group relative flex items-center focus-visible:outline-none cursor-pointer w-fit"
                  >
                    {/* 40px rust line drawing in from the left on hover/focus */}
                    <span
                      aria-hidden="true"
                      className={`hidden md:inline-block h-[1.5px] bg-rust transition-all duration-300 origin-left mr-3 shrink-0 ${
                        isHovered ? "w-10 opacity-100" : "w-0 opacity-0"
                      }`}
                    />

                    {/* Masked line box for text roll with safe line-height */}
                    <div
                      className={`relative overflow-hidden py-1 transition-transform duration-300 ease-out ${
                        isHovered ? "translate-x-0 md:translate-x-2" : "translate-x-0"
                      }`}
                    >
                      <div className="menu-rise-wrapper relative">
                        {/* Layer 1: Regular text moving up on hover */}
                        <span
                          style={{
                            fontSize: "clamp(32px, min(6.5vh, 4vw), 64px)",
                            lineHeight: 1.05,
                          }}
                          className={`block font-display text-ink transition-transform duration-500 ease-out ${
                            isHovered ? "-translate-y-full" : "translate-y-0"
                          }`}
                        >
                          {item.title}
                        </span>

                        {/* Layer 2: Cormorant Italic Rust text rolling in */}
                        <span
                          aria-hidden="true"
                          style={{
                            fontSize: "clamp(32px, min(6.5vh, 4vw), 64px)",
                            lineHeight: 1.05,
                          }}
                          className={`absolute inset-0 font-display italic text-rust transition-transform duration-500 ease-out pointer-events-none ${
                            isHovered ? "translate-y-0" : "translate-y-full"
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Subtitle Label (11px tracked out) */}
                  <div className="mt-1 pl-0 md:pl-0.5">
                    <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink/60">
                      {item.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Bar: Fixed Height (64px) with Label and 'Your Sirra.' */}
        <div className="h-[64px] shrink-0 w-full px-6 sm:px-10 flex items-center justify-between border-t border-ink/10 bg-cream z-20">
          <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink/60">
            50ML EAU DE PARFUM
          </span>
          <span className="font-display italic text-base sm:text-lg text-rust">
            Your Sirra.
          </span>
        </div>
      </div>

      {/* Desktop Preview Panel: 320px wide, slides out at left: 460px from behind the drawer */}
      {isDesktop && (
        <aside
          ref={previewRef}
          onMouseEnter={onMouseEnterDrawer}
          onMouseLeave={onMouseLeaveDrawer}
          style={{ transform: "translateX(-100%)" }}
          aria-hidden="true"
          className="fixed top-0 bottom-0 left-[460px] z-48 w-[320px] h-[100dvh] bg-ink border-r border-ink/20 shadow-2xl overflow-hidden flex flex-col justify-between"
        >
          <div className="flex-1 relative w-full h-full">
            {/* 1. Default: hero-mist */}
            <div
              className={`absolute inset-0 transition-all duration-600 ease-out ${
                hoveredPreview === "default"
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-106 pointer-events-none"
              }`}
            >
              <Image
                src={IMAGES["hero-mist"].src}
                alt={IMAGES["hero-mist"].alt}
                fill
                quality={90}
                sizes="320px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-ink/25" />
            </div>

            {/* 2. The Name: name-stone */}
            <div
              className={`absolute inset-0 flex items-center justify-center p-8 transition-all duration-600 ease-out ${
                hoveredPreview === "name"
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-106 pointer-events-none"
              }`}
            >
              <div className="relative w-full max-w-[280px] aspect-[4/5] overflow-hidden shadow-2xl">
                <Image
                  src={IMAGES["name-stone"].src}
                  alt={IMAGES["name-stone"].alt}
                  fill
                  quality={90}
                  sizes="280px"
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* 3. Four Flexes: 2x2 Mosaic of 4 personas */}
            <div
              className={`absolute inset-0 p-6 flex items-center justify-center transition-all duration-600 ease-out ${
                hoveredPreview === "flexes"
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-106 pointer-events-none"
              }`}
            >
              <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full max-w-[280px] aspect-square">
                <div className="relative overflow-hidden bg-ink/40">
                  <Image
                    src={IMAGES["flex-wayfarer"].src}
                    alt={IMAGES["flex-wayfarer"].alt}
                    fill
                    quality={90}
                    sizes="140px"
                    className="object-cover object-center"
                  />
                </div>
                <div className="relative overflow-hidden bg-ink/40">
                  <Image
                    src={IMAGES["flex-equinox"].src}
                    alt={IMAGES["flex-equinox"].alt}
                    fill
                    quality={90}
                    sizes="140px"
                    className="object-cover object-center"
                  />
                </div>
                <div className="relative overflow-hidden bg-ink/40">
                  <Image
                    src={IMAGES["flex-silk-smoke"].src}
                    alt={IMAGES["flex-silk-smoke"].alt}
                    fill
                    quality={90}
                    sizes="140px"
                    className="object-cover object-center"
                  />
                </div>
                <div className="relative overflow-hidden bg-ink/40">
                  <Image
                    src={IMAGES["flex-heartthrob"].src}
                    alt={IMAGES["flex-heartthrob"].alt}
                    fill
                    quality={90}
                    sizes="140px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            </div>

            {/* 4. The Collection: 2x2 Mosaic of 4 Pack Shots */}
            <div
              className={`absolute inset-0 p-6 flex items-center justify-center transition-all duration-600 ease-out ${
                hoveredPreview === "collection"
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-106 pointer-events-none"
              }`}
            >
              <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full max-w-[280px] aspect-square">
                <div className="relative overflow-hidden bg-[#ECECEA] p-2 flex items-center justify-center">
                  <Image
                    src={IMAGES["pack-wayfarer"].src}
                    alt={IMAGES["pack-wayfarer"].alt}
                    fill
                    quality={90}
                    sizes="140px"
                    className="object-contain object-center mix-blend-multiply"
                  />
                </div>
                <div className="relative overflow-hidden bg-[#ECECEA] p-2 flex items-center justify-center">
                  <Image
                    src={IMAGES["pack-equinox"].src}
                    alt={IMAGES["pack-equinox"].alt}
                    fill
                    quality={90}
                    sizes="140px"
                    className="object-contain object-center mix-blend-multiply"
                  />
                </div>
                <div className="relative overflow-hidden bg-[#ECECEA] p-2 flex items-center justify-center">
                  <Image
                    src={IMAGES["pack-silk-smoke"].src}
                    alt={IMAGES["pack-silk-smoke"].alt}
                    fill
                    quality={90}
                    sizes="140px"
                    className="object-contain object-center mix-blend-multiply"
                  />
                </div>
                <div className="relative overflow-hidden bg-[#ECECEA] p-2 flex items-center justify-center">
                  <Image
                    src={IMAGES["pack-heartthrob"].src}
                    alt={IMAGES["pack-heartthrob"].alt}
                    fill
                    quality={90}
                    sizes="140px"
                    className="object-contain object-center mix-blend-multiply"
                  />
                </div>
              </div>
            </div>

            {/* 4. Where to Buy: mantra-bottle */}
            <div
              className={`absolute inset-0 transition-all duration-600 ease-out ${
                hoveredPreview === "buy"
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-106 pointer-events-none"
              }`}
            >
              <Image
                src={IMAGES["mantra-bottle"].src}
                alt={IMAGES["mantra-bottle"].alt}
                fill
                quality={90}
                sizes="320px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-ink/30" />
            </div>
          </div>
        </aside>
      )}
    </>
  );
}

export default MenuOverlay;
