"use client";

import React from "react";

export interface FilterBarProps {
  activeFamily: string;
  onSelectFamily: (family: string) => void;
  matchingCount: number;
}

const FAMILIES = ["All", "Fresh", "Woody", "Amber", "Spicy", "Floral", "Gourmand"];

export function FilterBar({
  activeFamily,
  onSelectFamily,
  matchingCount,
}: FilterBarProps) {
  return (
    <div className="sticky top-[54px] md:top-[64px] z-30 w-full bg-cream/95 backdrop-blur-md border-b border-ink/15 py-3 md:py-4 px-5 md:px-10 transition-all duration-200">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Chips row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {FAMILIES.map((family) => {
            const isActive = activeFamily.toLowerCase() === family.toLowerCase();
            return (
              <button
                key={family}
                type="button"
                onClick={() => onSelectFamily(family)}
                className={`px-3.5 py-1.5 rounded-none border text-xs font-sans font-semibold uppercase tracking-wider transition-colors cursor-pointer select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold ${isActive
                    ? "bg-ink text-cream border-ink"
                    : "bg-transparent text-ink/70 border-ink/20 hover:border-ink hover:text-ink"
                  }`}
              >
                {family}
              </button>
            );
          })}
        </div>

        {/* Dynamic Count Label */}
        <div className="flex items-center self-end sm:self-auto">
          <span className="font-sans text-xs uppercase tracking-widest text-ink/60 font-medium">
            {matchingCount} {matchingCount === 1 ? "scent" : "scents"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;

