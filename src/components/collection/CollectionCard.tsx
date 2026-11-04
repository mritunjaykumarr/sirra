"use client";

import React from "react";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import OutboundLink from "@/components/ui/OutboundLink";
import MarketLogo from "./MarketLogo";
import { Product, IMAGES, ProductColor } from "@/content";

export interface CollectionCardProps {
  product: Product;
  isMatching: boolean;
  onOpenDrawer: (slug: string) => void;
}

export function CollectionCard({
  product,
  isMatching,
  onOpenDrawer,
}: CollectionCardProps) {
  const imgData = IMAGES[product.image];

  const roleColors: Record<ProductColor, string> = {
    wayfarer: "text-wayfarer",
    equinox: "text-equinox",
    silkSmoke: "text-silkSmoke",
    heartthrob: "text-heartthrob",
  };

  const handleCardClick = () => {
    onOpenDrawer(product.slug);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenDrawer(product.slug);
    }
  };

  return (
    <div
      id={product.slug}
      role="button"
      tabIndex={0}
      aria-label={`View ${product.name} details`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      style={
        !isMatching
          ? { opacity: 0.15, transform: "scale(0.96)", pointerEvents: "none" }
          : { opacity: 1, transform: "scale(1)", pointerEvents: "auto" }
      }
      className={`product-card group relative bg-cream p-5 md:p-6 flex flex-col justify-between border border-ink/10 cursor-pointer select-none transition-[opacity,transform] duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
        isMatching ? "shadow-xs hover:shadow-md" : ""
      }`}
    >
      <div>
        {/* Persona Image Frame (Aspect 3/4) */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink/10 mb-5">
          <Image
            src={imgData.src}
            alt={imgData.alt}
            fill
            placeholder="blur"
            blurDataURL={imgData.blurDataURL}
            quality={90}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-104"
          />

          {/* Desktop Hover/Focus Slide-up Panel (Overlays bottom of image) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="hidden [@media(hover:hover)]:flex absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 group-focus-within:translate-y-0 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] bg-cream/95 backdrop-blur-sm p-4 border-t border-ink/15 z-20 flex-col gap-3"
          >
            {/* Notes Chips */}
            <div className="flex flex-wrap gap-1.5">
              {product.notes.slice(0, 3).map((note) => (
                <span
                  key={note}
                  className="px-2 py-0.5 bg-ink/5 border border-ink/10 text-[10px] font-sans text-ink uppercase tracking-wider"
                >
                  {note}
                </span>
              ))}
            </div>

            {/* Primary Buy Action */}
            <OutboundLink
              market="amazon"
              product={product.slug}
              className="w-full py-2.5 px-3 bg-ink text-cream text-[11px] font-sans font-semibold uppercase tracking-wider text-center hover:bg-rust transition-colors"
            >
              Buy on Amazon
            </OutboundLink>

            {/* Marketplace Chips */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-ink/10">
              <MarketLogo market="flipkart" product={product.slug} className="flex-1 text-[10px] py-1" />
              <MarketLogo market="meesho" product={product.slug} className="flex-1 text-[10px] py-1" />
            </div>
          </div>
        </div>

        {/* Touch Devices Permanent Panel (Visible below image when hover is not supported) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex [@media(hover:hover)]:hidden flex-col gap-3 mb-4 p-3 bg-ink/5 border border-ink/10"
        >
          <div className="flex flex-wrap gap-1.5">
            {product.notes.slice(0, 3).map((note) => (
              <span
                key={note}
                className="px-2 py-0.5 bg-cream border border-ink/10 text-[10px] font-sans text-ink uppercase tracking-wider"
              >
                {note}
              </span>
            ))}
          </div>
          <OutboundLink
            market="amazon"
            product={product.slug}
            className="w-full py-2.5 px-3 bg-ink text-cream text-[11px] font-sans font-semibold uppercase tracking-wider text-center"
          >
            Buy on Amazon
          </OutboundLink>
          <div className="flex items-center justify-between gap-2">
            <MarketLogo market="flipkart" product={product.slug} className="flex-1 text-[10px] py-1" />
            <MarketLogo market="meesho" product={product.slug} className="flex-1 text-[10px] py-1" />
          </div>
        </div>

        {/* Persona Tag in Persona Colour */}
        <div className="mb-2.5">
          <Tag color={product.color} className="text-[10px] py-1 px-2.5">
            {product.number} · {product.name.toUpperCase()}
          </Tag>
        </div>

        {/* Name Archivo 700 Uppercase */}
        <h3 className="font-sans font-bold text-xl md:text-2xl uppercase tracking-wider text-ink mb-1">
          {product.name}
        </h3>

        {/* Role Cormorant Italic in Persona Colour */}
        <p className={`font-display italic text-lg ${roleColors[product.color]} mb-3`}>
          {product.role}
        </p>
      </div>

      <div>
        <span className="block font-sans text-xs uppercase tracking-widest text-ink/50 mt-2">
          {product.size}
        </span>
      </div>
    </div>
  );
}

export default CollectionCard;

