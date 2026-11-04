"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Label from "@/components/ui/Label";
import { Product, ProductColor } from "@/content";
import { useGsap, fadeUpStagger, isReducedMotion } from "@/lib/motion";

export interface ScentNotesProps {
  product: Product;
}

const personaColorHex: Record<ProductColor, string> = {
  wayfarer: "#1E3A6B",
  equinox: "#8B7A5E",
  silkSmoke: "#252220",
  heartthrob: "#7A1E26",
};

export function ScentNotes({ product }: ScentNotesProps) {
  const containerRef = useRef<HTMLElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  const dotColor = personaColorHex[product.color];
  const packShot = product.packShot;

  useGsap(() => {
    if (isReducedMotion()) return;

    if (chipsRef.current) {
      const chips = chipsRef.current.querySelectorAll(".scent-large-chip");
      fadeUpStagger(Array.from(chips), {
        trigger: chipsRef.current,
        start: "top 85%",
        stagger: 0.1,
      });
    }
  }, [], containerRef);

  return (
    <section
      id="scent-notes"
      ref={containerRef}
      className="relative z-20 w-full bg-cream py-20 md:py-32 px-5 md:px-12 lg:px-16 border-b border-ink/10"
    >
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Label "NOTES" & Large Chip Cards */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="mb-4">
            <Label className="tracking-[0.25em] text-ink/60 text-xs font-semibold">
              NOTES
            </Label>
          </div>

          <h2 className="font-display font-light text-[clamp(32px,3.8vw,56px)] text-ink leading-tight mb-8">
            Fragrance notes
          </h2>

          {/* Large Chip Cards: Cormorant italic 28px, persona dot, hairline border, 0.1s stagger */}
          <div
            ref={chipsRef}
            className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 mb-8"
          >
            {product.notes.map((note) => (
              <div
                key={note}
                className="scent-large-chip px-5 sm:px-6 py-3.5 sm:py-4 bg-cream border border-ink/15 shadow-2xs flex items-center gap-3 hover:border-ink/50 transition-colors"
              >
                <span
                  style={{ backgroundColor: dotColor }}
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  aria-hidden="true"
                />
                <span className="font-display italic text-2xl sm:text-[28px] text-ink font-medium leading-none">
                  {note}
                </span>
              </div>
            ))}
          </div>

          {/* Olfactory Families Row */}
          <div className="pt-4 border-t border-ink/10 flex flex-wrap items-center gap-3">
            <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink/60 font-semibold">
              OLFACTORY FAMILIES:
            </span>
            <div className="flex flex-wrap gap-2">
              {product.families.map((family) => (
                <span
                  key={family}
                  className="px-3 py-1 bg-ink/5 border border-ink/15 font-sans text-xs uppercase tracking-wider font-semibold text-ink"
                >
                  {family}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pack Shot on Grey Plate (aspect 4/5, multiply, contact shadow only, hover/focus notes panel) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end items-center">
          <div
            tabIndex={0}
            aria-label={`${product.name} bottle and notes preview`}
            className="group/plate relative w-full max-w-[420px] aspect-[4/5] bg-[#ECECEA] border border-ink/10 shadow-[0_12px_24px_-6px_rgba(0,0,0,0.18)] overflow-hidden flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {/* Centered Pack Shot Bottle */}
            <div className="relative w-[78%] h-[78%] transition-transform duration-500 group-hover/plate:scale-[1.03]">
              <Image
                src={packShot.src}
                alt={packShot.alt}
                fill
                quality={90}
                placeholder="blur"
                blurDataURL={packShot.blurDataURL}
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 420px"
                className="object-contain object-center mix-blend-multiply"
              />
            </div>

            {/* Contact Shadow Under Bottle (opacity 0.18, max blur 12px) */}
            <div
              aria-hidden="true"
              className="absolute bottom-[9%] left-1/2 -translate-x-1/2 w-[55%] h-3 bg-black/18 rounded-full blur-[6px] pointer-events-none"
            />

            {/* Solid Slide-Up Persona Notes Panel on Hover & Keyboard Focus-Within */}
            <div
              style={{ backgroundColor: dotColor }}
              className="absolute inset-0 z-20 p-6 sm:p-8 text-cream flex flex-col justify-between translate-y-full group-hover/plate:translate-y-0 group-focus-within:translate-y-0 transition-transform duration-500 ease-out pointer-events-none group-hover/plate:pointer-events-auto group-focus-within:pointer-events-auto shadow-2xl"
            >
              <div>
                <span className="block font-sans text-[10px] uppercase tracking-[0.2em] text-cream/75 font-semibold mb-1">
                  PROFILE
                </span>
                <p className="font-display italic text-lg sm:text-xl text-cream leading-snug">
                  {product.profile}
                </p>
              </div>

              <div>
                <span className="block font-sans text-[10px] uppercase tracking-[0.2em] text-cream/75 font-semibold mb-2">
                  NOTES
                </span>
                <p className="font-sans text-sm sm:text-base text-cream/90 leading-relaxed font-normal">
                  {product.notes.join(" · ")}
                </p>
              </div>

              <div className="pt-3 border-t border-cream/20 flex items-center justify-between">
                <span className="font-sans text-[11px] uppercase tracking-wider text-cream/70 font-medium">
                  {product.volume} {product.concentration}
                </span>
                <span className="font-display italic text-base text-cream/90">
                  {product.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ScentNotes;

