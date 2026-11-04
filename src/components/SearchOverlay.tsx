"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Wordmark from "./ui/Wordmark";
import Tag from "./ui/Tag";
import Label from "./ui/Label";
import { PRODUCTS, Product, IMAGES } from "@/content";
import { isReducedMotion } from "@/lib/motion";
import gsap from "gsap";

export interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

const SUGGESTION_CHIPS = [
  "Bergamot",
  "Sea Salt",
  "Mysore Sandalwood",
  "Smoked Lavender",
  "Smoked Oud",
  "Damask Rose",
  "Whipped Vanilla",
  "Golden Amber",
];

export function SearchOverlay({ isOpen, onClose, triggerRef }: SearchOverlayProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Debounce input typing 120ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 120);

    return () => clearTimeout(handler);
  }, [query]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);

    if (isReducedMotion() || !overlayRef.current) {
      setQuery("");
      setDebouncedQuery("");
      setIsClosing(false);
      onClose();
      return;
    }

    gsap.to(overlayRef.current, {
      clipPath: "inset(0 0 100% 0)",
      duration: 0.5,
      ease: "power4.inOut",
      onComplete: () => {
        setQuery("");
        setDebouncedQuery("");
        setIsClosing(false);
        onClose();
      },
    });
  }, [isClosing, onClose]);

  const handleSelect = useCallback(
    (slug: string) => {
      handleClose();
      router.push(`/scent/${slug}`);
    },
    [handleClose, router]
  );

  // Entrance curtain wipe and chip stagger
  useEffect(() => {
    if (!isOpen || !overlayRef.current) return;
    setIsClosing(false);

    if (isReducedMotion()) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    } else {
      gsap.fromTo(
        overlayRef.current,
        { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: 0.8, ease: "power4.inOut" }
      );

      const chips = overlayRef.current.querySelectorAll(".search-chip");
      if (chips.length > 0) {
        gsap.fromTo(
          chips,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.04,
            delay: 0.25,
            ease: "power2.out",
          }
        );
      }
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const triggerNode = triggerRef?.current;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 80);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === "Tab" && overlayRef.current) {
        const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
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
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
      triggerNode?.focus();
    };
  }, [isOpen, handleClose, triggerRef]);

  // Matching algorithm: searches name, role, profile, notes
  const matchedProducts = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    if (!q) return [];

    return PRODUCTS.filter((p) => {
      const inName = p.name.toLowerCase().includes(q);
      const inRole = p.role.toLowerCase().includes(q);
      const inProfile = p.profile.toLowerCase().includes(q);
      const inNotes = p.notes.some((note) => note.toLowerCase().includes(q));
      return inName || inRole || inProfile || inNotes;
    });
  }, [debouncedQuery]);

  // Animate results appearing
  useEffect(() => {
    if (!overlayRef.current || matchedProducts.length === 0) return;
    const cards = overlayRef.current.querySelectorAll(".search-result-card");
    if (cards.length > 0 && !isReducedMotion()) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.08,
          ease: "power2.out",
        }
      );
    }
  }, [matchedProducts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchedProducts.length > 0) {
      handleSelect(matchedProducts[0].slug);
    }
  };

  const getHighlightInfo = (product: Product, queryStr: string) => {
    const q = queryStr.toLowerCase();
    const matchingNote = product.notes.find((n) => n.toLowerCase().includes(q));
    return { matchingNote };
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Search Fragrances"
      className="fixed inset-0 z-50 bg-cream text-ink flex flex-col justify-between p-6 md:p-12 overflow-y-auto"
    >
      {/* Top Bar */}
      <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between border-b border-ink/10 pb-6">
        <Wordmark size="sm" />
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          className="font-sans uppercase text-xs md:text-sm tracking-widest px-3 py-2 text-ink hover:text-rust transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          aria-label="Close search"
        >
          Close
        </button>
      </div>

      {/* Main Search Area */}
      <div className="w-full max-w-4xl mx-auto my-auto py-8 md:py-12 flex flex-col gap-8 md:gap-10">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <Label>SEARCH BY NOTE, PROFILE OR FLEX</Label>
          </div>

          {/* Large Cormorant input with 2px underline animating scaleX 0 to 1 on focus turning gold */}
          <div className="relative">
            <input
              id="search-input"
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="e.g. vanilla, sandalwood, bergamot..."
              className="w-full bg-transparent font-display text-3xl sm:text-4xl md:text-6xl text-ink placeholder:text-ink/30 pb-3 focus:outline-none"
            />
            {/* Base 2px ink line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-ink/20 pointer-events-none" />
            {/* Animated 2px focus line, scaleX 0 to 1 origin-left turning gold */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gold origin-left transition-transform duration-500 ease-out pointer-events-none ${
                isFocused ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </div>
        </form>

        {/* Suggestion Chips (Shown when input is empty) */}
        {!debouncedQuery && (
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest font-sans text-ink/50">
              Suggestions
            </span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setQuery(chip);
                    setDebouncedQuery(chip);
                    inputRef.current?.focus();
                  }}
                  className="search-chip px-3.5 py-1.5 bg-ink/5 hover:bg-ink hover:text-cream text-xs font-sans uppercase tracking-wider rounded-xs transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Results or No Match */}
        <div className="min-h-[220px] flex flex-col justify-start">
          {debouncedQuery && matchedProducts.length === 0 && (
            <p className="font-display text-xl sm:text-2xl text-rust italic my-auto">
              No scent matches that. Try a note like vanilla or sandalwood.
            </p>
          )}

          {debouncedQuery && matchedProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full">
              {matchedProducts.map((p) => {
                const { matchingNote } = getHighlightInfo(p, debouncedQuery);
                const packImg = p.packShot || IMAGES[`pack-${p.slug}` as keyof typeof IMAGES];

                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => handleSelect(p.slug)}
                    className="search-result-card bg-cream border border-ink/15 hover:border-gold hover:shadow-md transition-all duration-300 p-3 md:p-4 flex flex-col text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    {/* Pack Shot Thumbnail (Square crop 56x56 / 64x64, rounded-sm, grey background) */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 aspect-square shrink-0 rounded-xs bg-[#ECECEA] p-1 flex items-center justify-center overflow-hidden border border-ink/10">
                        <div className="relative w-full h-full">
                          <Image
                            src={packImg.src}
                            alt={packImg.alt}
                            fill
                            sizes="64px"
                            placeholder="blur"
                            blurDataURL={packImg.blurDataURL}
                            quality={90}
                            className="object-contain object-center mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <Tag color={p.color} className="text-[9px] py-0.5 px-1.5">
                            {p.number} · {p.name}
                          </Tag>
                        </div>
                        <h4 className="font-sans font-bold text-sm md:text-base uppercase tracking-wider text-ink truncate">
                          {p.name}
                        </h4>
                        <p className="font-display italic text-xs md:text-sm text-ink/75 truncate">
                          {p.role}
                        </p>
                      </div>
                    </div>

                    {/* Matching Note with Gold Underline */}
                    <div className="mt-auto pt-2 border-t border-ink/10 text-[11px] font-sans text-ink/70">
                      {matchingNote ? (
                        <span className="inline-block">
                          Note:{" "}
                          <span className="font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4">
                            {matchingNote}
                          </span>
                        </span>
                      ) : (
                        <span className="line-clamp-1 text-ink/60">
                          {p.notes.slice(0, 3).join(", ")}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-[1440px] mx-auto pt-6 border-t border-ink/10 text-xs font-sans text-ink/60 uppercase tracking-widest flex items-center justify-between">
        <span>Press Enter to select first match · Escape to close</span>
        <span className="font-display italic text-rust text-sm">Your Sirra.</span>
      </div>
    </div>
  );
}

export default SearchOverlay;
