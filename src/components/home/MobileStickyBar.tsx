"use client";

import React, { useState, useEffect } from "react";
import OutboundLink from "@/components/ui/OutboundLink";

export function MobileStickyBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let footerInView = false;
    let pastHero = false;

    const checkVisibility = () => {
      setIsVisible(pastHero && !footerInView);
    };

    const handleScroll = () => {
      pastHero = window.scrollY > window.innerHeight * 0.75;
      checkVisibility();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // IntersectionObserver to hide when footer is in view
    const footer = document.getElementById("availability");
    let observer: IntersectionObserver | null = null;

    if (footer && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          footerInView = entries[0]?.isIntersecting ?? false;
          checkVisibility();
        },
        { threshold: 0.1 }
      );
      observer.observe(footer);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (observer) observer.disconnect();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="block md:hidden fixed bottom-0 left-0 w-full z-40 bg-ink/95 backdrop-blur-md border-t border-cream/20 p-3 shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <OutboundLink
          market="amazon"
          className="flex-1 py-3 px-4 bg-cream text-ink text-xs font-sans font-semibold uppercase tracking-wider text-center hover:bg-gold transition-colors"
        >
          Buy on Amazon
        </OutboundLink>
        <a
          href="#availability"
          className="px-4 py-3 border border-cream/40 text-cream text-xs font-sans font-semibold uppercase tracking-wider text-center hover:bg-cream/10 transition-colors"
        >
          More
        </a>
      </div>
    </div>
  );
}

export default MobileStickyBar;

