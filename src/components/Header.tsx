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

  const [isPastAnnouncement, setIsPastAnnouncement] = useState(false);
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
      setIsPastAnnouncement(scrollY > 36);

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
      {/* 0. Announcement Bar (36px slim ink bar) */}
      <div className="absolute top-0 left-0 w-full h-[36px] bg-ink text-cream z-50 flex items-center justify-center border-b border-cream/10 px-4">
        <a
          href="#availability"
          className="font-sans text-[11px] uppercase tracking-[0.2em] font-medium text-cream hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
        >
          AVAILABLE ON AMAZON · FLIPKART · MEESHO
        </a>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`fixed left-0 w-full z-40 transition-[top,background-color,color,border-color,padding] duration-300 ${
          isPastAnnouncement ? "top-0" : "top-[36px]"
        } ${
          isSolid
            ? "bg-cream text-ink border-b border-ink/10 py-3 md:py-4 shadow-xs"
            : "bg-transparent text-cream border-b border-transparent py-4 md:py-6"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 flex items-center justify-between">
          {/* Left: Menu & Search */}
          <div className="flex items-center gap-6 md:gap-8 flex-1">
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
              className={`font-sans uppercase text-xs md:text-sm tracking-widest font-semibold transition-all cursor-pointer p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold ${
                isMenuOpen
                  ? "text-rust font-bold underline decoration-rust underline-offset-4"
                  : "hover:opacity-75"
              }`}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              Menu
            </button>
            <button
              ref={searchButtonRef}
              type="button"
              onClick={handleOpenSearch}
              className="font-sans uppercase text-xs md:text-sm tracking-widest font-semibold hover:opacity-75 transition-opacity cursor-pointer p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
              aria-label="Open search"
            >
              Search
            </button>
          </div>

          {/* Centre: Wordmark */}
          <div className="flex-1 flex justify-center">
            <Link
              href="/"
              className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold p-1"
              aria-label="SIRRA Home"
            >
              <Wordmark
                size={isSolid ? "sm" : "base"}
                className={`transition-all duration-300 ${isSolid ? "text-ink" : "text-cream"}`}
              />
            </Link>
          </div>

          {/* Right: Where to buy */}
          <div className="flex-1 flex justify-end">
            <Link
              href="#availability"
              className="font-sans uppercase text-xs md:text-sm tracking-widest font-semibold hover:opacity-75 transition-opacity p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
            >
              Where to buy
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
