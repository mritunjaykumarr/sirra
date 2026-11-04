"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import OutboundLink from "@/components/ui/OutboundLink";
import MarketLogo from "./MarketLogo";
import { Product, IMAGES, ProductColor, getAdjacentProducts } from "@/content";

export interface ProductDrawerProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct: (slug: string) => void;
}

export function ProductDrawer({
  product,
  onClose,
  onSelectProduct,
}: ProductDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  const ruleColors: Record<ProductColor, string> = {
    wayfarer: "bg-wayfarer",
    equinox: "bg-equinox",
    silkSmoke: "bg-silkSmoke",
    heartthrob: "bg-heartthrob",
  };

  const roleColors: Record<ProductColor, string> = {
    wayfarer: "text-wayfarer",
    equinox: "text-equinox",
    silkSmoke: "text-silkSmoke",
    heartthrob: "text-heartthrob",
  };

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Escape key and focus trapping
  useEffect(() => {
    if (!product) return;

    lastActiveElementRef.current = document.activeElement as HTMLElement;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Pause Lenis smooth scroll while drawer is open
    const win = window as unknown as { lenis?: { stop: () => void; start: () => void } };
    if (win.lenis) {
      win.lenis.stop();
    }

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

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

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);

      if (win.lenis) {
        win.lenis.start();
      }

      // Return focus to trigger element
      lastActiveElementRef.current?.focus();
    };
  }, [product, handleClose]);

  if (!product) return null;

  const imgData = IMAGES[product.image];
  const { prev, next } = getAdjacentProducts(product.slug);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} details`}
      className="fixed inset-0 z-50 flex justify-end animate-fade-in"
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Container (560px desktop, full screen on mobile) */}
      <div
        ref={drawerRef}
        data-lenis-prevent
        className="relative z-10 w-full max-w-[560px] h-full bg-cream text-ink shadow-2xl flex flex-col justify-between overflow-hidden transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        {/* Top Sticky Bar */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-ink/10 bg-cream/95 backdrop-blur-sm z-20">
          <span className="font-sans text-xs uppercase tracking-[0.2em] font-semibold text-ink/60">
            {product.number} · {product.size}
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className="font-sans uppercase text-xs tracking-widest px-3 py-1.5 text-ink hover:text-rust transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label="Close drawer"
          >
            Close
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div
          data-lenis-prevent
          className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6"
        >
          {/* Persona Image on Top */}
          <div className="relative aspect-[3/4] w-full max-w-[420px] mx-auto overflow-hidden shadow-xs bg-ink/10">
            <Image
              src={imgData.src}
              alt={imgData.alt}
              fill
              placeholder="blur"
              blurDataURL={imgData.blurDataURL}
              quality={90}
              sizes="(max-width: 560px) 100vw, 420px"
              className="object-cover object-center"
            />
          </div>

          {/* Persona Tag & Role */}
          <div className="flex flex-col items-start gap-2 pt-2">
            <Tag color={product.color}>
              {product.number} · {product.name.toUpperCase()}
            </Tag>
            <span
              className={`font-display italic text-2xl md:text-3xl font-medium ${roleColors[product.color]
                }`}
            >
              {product.role}
            </span>
          </div>

          {/* Verbatim Quote in Cormorant Italic */}
          <p className="font-display italic text-xl md:text-2xl text-ink leading-snug border-l-2 border-ink/20 pl-4 py-1">
            {product.quote}
          </p>

          {/* Verbatim Body Paragraph */}
          <p className="font-sans text-sm md:text-base text-ink/80 leading-relaxed font-normal">
            {product.body}
          </p>

          {/* Persona Color Divider Rule */}
          <div className={`w-full h-[1px] my-2 ${ruleColors[product.color]}`} />

          {/* Profile & Notes */}
          <div className="flex flex-col gap-4">
            <div>
              <span className="block font-sans text-xs uppercase tracking-[0.2em] text-ink/60 mb-1">
                PROFILE
              </span>
              <p className="font-display italic text-lg md:text-xl text-ink">
                {product.profile}
              </p>
            </div>

            <div>
              <span className="block font-sans text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
                NOTES
              </span>
              <div className="flex flex-wrap gap-2">
                {product.notes.map((note) => (
                  <span
                    key={note}
                    className="px-3 py-1 bg-ink/5 border border-ink/10 text-xs font-sans text-ink uppercase tracking-wider"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Buy Block */}
          <div className="pt-4 border-t border-ink/10 flex flex-col gap-3">
            <OutboundLink
              market="amazon"
              product={product.slug}
              className="w-full py-3.5 px-4 bg-ink text-cream text-xs font-sans font-semibold uppercase tracking-wider text-center hover:bg-rust transition-colors shadow-xs"
            >
              Buy on Amazon
            </OutboundLink>
            <div className="flex items-center justify-center gap-3">
              <span className="font-sans text-xs uppercase tracking-wider text-ink/60">
                Also available on:
              </span>
              <MarketLogo market="flipkart" product={product.slug} />
              <MarketLogo market="meesho" product={product.slug} />
            </div>
          </div>
        </div>

        {/* Drawer Footer: Cycling Navigation (Previous & Next) */}
        <div className="p-4 md:p-5 border-t border-ink/10 bg-cream/95 backdrop-blur-sm flex items-center justify-between gap-4 z-20">
          <button
            type="button"
            onClick={() => onSelectProduct(prev.slug)}
            className="flex items-center gap-2 font-sans font-semibold text-xs uppercase tracking-wider text-ink/80 hover:text-ink transition-colors p-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold cursor-pointer"
          >
            ← Previous: {prev.name}
          </button>
          <button
            type="button"
            onClick={() => onSelectProduct(next.slug)}
            className="flex items-center gap-2 font-sans font-semibold text-xs uppercase tracking-wider text-ink/80 hover:text-ink transition-colors p-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold cursor-pointer"
          >
            Next: {next.name} →
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDrawer;

