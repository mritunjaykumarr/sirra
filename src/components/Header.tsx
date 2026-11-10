"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Wordmark from "./ui/Wordmark";
import MenuOverlay from "./MenuOverlay";
import SearchOverlay from "./SearchOverlay";

type MenuMode = "closed" | "hover" | "pinned";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [isScrolled, setIsScrolled] = useState(false);
  const [menuMode, setMenuMode] = useState<MenuMode>("closed");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (isHome) {
        const threshold = window.innerHeight * 0.8;
        setIsScrolled(scrollY > threshold);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHome]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleMenuButtonMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    // Only trigger hover open on fine pointer devices when closed
    if (menuMode === "closed") {
      hoverTimerRef.current = setTimeout(() => {
        // Double check pointer capability
        if (typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          setMenuMode("hover");
        }
      }, 120);
    }
  };

  const handleMenuButtonMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (menuMode === "hover") {
      closeTimerRef.current = setTimeout(() => {
        setMenuMode("closed");
      }, 250);
    }
  };

  const handleMenuButtonClick = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    // Toggle pinned mode
    if (menuMode === "pinned") {
      setMenuMode("closed");
    } else {
      setMenuMode("pinned");
    }
  };

  const handleMouseEnterDrawer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const handleMouseLeaveDrawer = useCallback(() => {
    if (menuMode === "hover") {
      closeTimerRef.current = setTimeout(() => {
        setMenuMode("closed");
      }, 250);
    }
  }, [menuMode]);

  const handleOpenSearch = () => {
    // Opening search closes any open drawer first
    setMenuMode("closed");
    setIsSearchOpen(true);
  };

  const isMenuOpen = menuMode !== "closed";
  const isPinned = menuMode === "pinned";
  const isSolid = !isHome || isScrolled || isMenuOpen || isSearchOpen;

  return (
    <>
      {/* Soft Top Gradient Behind Transparent Header over Hero (180px, ink/45 to transparent) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 top-0 h-[180px] bg-gradient-to-b from-ink/45 to-transparent z-30 transition-opacity duration-500 ${
          isSolid ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />

      {/* Main Sticky Header (Fixed top-0) */}
      <header
        className={`fixed left-0 top-0 w-full z-40 transition-[background-color,color,border-color,padding] duration-300 ${
          isSolid
            ? "bg-cream text-ink border-b border-ink/10 py-3 md:py-4 shadow-xs"
            : "bg-transparent text-cream border-b border-transparent py-4 md:py-6"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex items-center justify-between">
          {/* Left: Menu & Search */}
          <div className="header-fade-item flex items-center gap-3 sm:gap-4 md:gap-8 flex-1">
            <button
              id="header-menu-button"
              ref={menuButtonRef}
              type="button"
              onClick={handleMenuButtonClick}
              onMouseEnter={handleMenuButtonMouseEnter}
              onMouseLeave={handleMenuButtonMouseLeave}
              aria-expanded={isMenuOpen}
              aria-controls="site-menu-drawer"
              aria-haspopup="dialog"
              className={`font-sans uppercase text-[11px] md:text-sm tracking-widest font-semibold transition-all cursor-pointer p-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold flex items-center justify-center ${
                isMenuOpen
                  ? "text-rust font-bold underline decoration-rust underline-offset-4"
                  : "hover:opacity-75"
              }`}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <span className="md:hidden flex items-center justify-center w-5 h-5" aria-hidden="true">
                {isMenuOpen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                    <line x1="1" y1="2" x2="19" y2="2" />
                    <line x1="1" y1="7" x2="19" y2="7" />
                    <line x1="1" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </span>
              <span className="hidden md:inline">Menu</span>
            </button>
            <button
              ref={searchButtonRef}
              type="button"
              onClick={handleOpenSearch}
              className="font-sans uppercase text-[11px] md:text-sm tracking-widest font-semibold hover:opacity-75 transition-opacity cursor-pointer p-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold flex items-center justify-center"
              aria-label="Open search"
            >
              <span className="md:hidden flex items-center justify-center w-5 h-5" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <span className="hidden md:inline">Search</span>
            </button>
          </div>

          {/* Centre: Wordmark (Centered on both mobile and desktop) */}
          <div className="flex-1 flex justify-center text-center">
            <Link
              href="/"
              className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold p-1 inline-flex items-center justify-center"
              aria-label="SIRRA Home"
            >
              <Wordmark
                size="sm"
                className={`transition-all duration-300 origin-center ${
                  isSolid ? "scale-100 text-ink" : "scale-105 md:scale-150 text-cream"
                }`}
              />
            </Link>
          </div>

          {/* Right: Where to buy */}
          <div className="header-fade-item flex-1 flex justify-end">
            <Link
              href="#availability"
              className="font-sans uppercase text-[11px] md:text-sm tracking-widest font-semibold hover:opacity-75 transition-opacity p-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold text-right flex items-center justify-end"
              aria-label="Where to buy"
            >
              <span className="md:hidden flex items-center justify-center w-5 h-5" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </span>
              <span className="hidden md:inline">Where to buy</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Menu Drawer & Curtain Overlay */}
      <MenuOverlay
        isOpen={isMenuOpen}
        isPinned={isPinned}
        onClose={() => setMenuMode("closed")}
        onMouseEnterDrawer={handleMouseEnterDrawer}
        onMouseLeaveDrawer={handleMouseLeaveDrawer}
        triggerRef={menuButtonRef}
      />

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        triggerRef={searchButtonRef}
      />
    </>
  );
}

export default Header;
