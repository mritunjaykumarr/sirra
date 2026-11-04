import React from "react";
import Section from "@/components/ui/Section";
import Label from "@/components/ui/Label";
import { Product } from "@/content";

export interface ScentDetailsProps {
  product: Product;
}

export function ScentDetails({ product }: ScentDetailsProps) {
  const specs = [
    { label: "VOLUME", value: product.volume },
    { label: "CONCENTRATION", value: product.concentration },
    { label: "PROFILE", value: product.profile },
    { label: "SKU", value: product.sku },
  ];

  return (
    <Section bg="grey" className="py-20 md:py-28 border-b border-ink/10 relative z-20">
      <div className="max-w-[1440px] mx-auto">
        <div className="max-w-3xl mx-auto flex flex-col">
          <div className="mb-3">
            <Label className="tracking-[0.25em] text-ink/60">
              SPECIFICATIONS
            </Label>
          </div>

          <h2 className="font-display font-light text-[clamp(32px,3.8vw,52px)] text-ink leading-tight mb-8">
            Product details
          </h2>

          {/* Hairline Specifications Table: Volume, Concentration, Profile, SKU */}
          <div className="w-full border-t border-b border-ink/15 divide-y divide-ink/10">
            {specs.map((item) => (
              <div
                key={item.label}
                className="py-4 sm:py-5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-baseline"
              >
                <div className="sm:col-span-4 font-sans text-xs uppercase tracking-[0.2em] font-semibold text-ink/60">
                  {item.label}
                </div>
                <div className="sm:col-span-8 font-display text-lg sm:text-xl text-ink font-medium">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <p className="font-sans text-xs uppercase tracking-wider text-ink/50 mt-6 text-center sm:text-left">
            Eau de Parfum concentration designed for skin-close longevity and personal projection.
          </p>
        </div>
      </div>
    </Section>
  );
}

export default ScentDetails;
