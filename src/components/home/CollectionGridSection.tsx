"use client";

import React, { useRef } from "react";
import Button from "@/components/ui/Button";
import { ProductCard } from "@/components/collection/ProductCard";
import { PRODUCTS, MarketKey } from "@/content";
import { useGsap, fadeUpStagger } from "@/lib/motion";

export interface CollectionGridSectionProps {
  availableLogos?: Record<MarketKey, boolean>;
}

export function CollectionGridSection({
  availableLogos,
}: CollectionGridSectionProps = {}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGsap(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll(".product-card");
      fadeUpStagger(Array.from(cards), {
        trigger: gridRef.current,
        start: "top 75%",
        stagger: 0.12,
      });
    }
  }, [], sectionRef);

  return (
    <section
      id="collection"
      ref={sectionRef}
      className="w-full bg-grey py-18 md:py-28 px-5 md:px-10 border-b border-ink/10"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col gap-10 md:gap-14">
        {/* Section Header Row: Repositioned as Index */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-ink/15 pb-6">
          <div>
            <span className="font-sans text-xs uppercase tracking-[0.2em] font-semibold text-ink/60 mb-2 block">
              CATALOGUE INDEX
            </span>
            <h2 className="font-display text-[clamp(40px,5vw,72px)] text-ink leading-none">
              Collection at a glance
            </h2>
          </div>
          <p className="font-sans text-xs md:text-sm text-ink/75 max-w-md uppercase tracking-wider font-medium">
            Four scents, one idea. None outranks another. Explore by profile or marketplace.
          </p>
        </div>

        {/* Rabanne-style Product Grid: 4 cols desktop, 2 tablet, 1 mobile; 4px gap */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
          {PRODUCTS.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              availableLogos={availableLogos}
            />
          ))}
        </div>

        {/* View Full Collection Action */}
        <div className="flex justify-center pt-6">
          <Button variant="dark" href="/collection">
            View the full collection
          </Button>
        </div>
      </div>
    </section>
  );
}

export default CollectionGridSection;
