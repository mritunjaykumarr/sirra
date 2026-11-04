"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Tag from "@/components/ui/Tag";
import OutboundLink from "@/components/ui/OutboundLink";
import MarketLogo from "@/components/ui/MarketLogo";
import { Product, IMAGES, ProductColor, MarketKey, MARKETS } from "@/content";

export interface ProductCardProps {
  product: Product;
  isMatching?: boolean;
  availableLogos?: Record<MarketKey, boolean>;
}

export function ProductCard({
  product,
  isMatching = true,
  availableLogos,
}: ProductCardProps) {
  const packShotImg = product.packShot || IMAGES[`pack-${product.slug}` as keyof typeof IMAGES];

  const hoverColorClasses: Record<ProductColor, string> = {
    wayfarer: "hover:bg-wayfarer focus-visible:bg-wayfarer",
    equinox: "hover:bg-equinox focus-visible:bg-equinox",
    silkSmoke: "hover:bg-silkSmoke focus-visible:bg-silkSmoke",
    heartthrob: "hover:bg-heartthrob focus-visible:bg-heartthrob",
  };

  const hoverBorderClasses: Record<ProductColor, string> = {
    wayfarer: "hover:border-wayfarer",
    equinox: "hover:border-equinox",
    silkSmoke: "hover:border-silkSmoke",
    heartthrob: "hover:border-heartthrob",
  };

  const personaPanelBg: Record<ProductColor, string> = {
    wayfarer: "bg-[#1E3A6B]",
    equinox: "bg-[#8B7A5E]",
    silkSmoke: "bg-[#B84A2B]",
    heartthrob: "bg-[#7A1E26]",
  };

  const hasAmazonLogo = availableLogos ? availableLogos.amazon : MARKETS.amazon.hasLogo;
  const hasFlipkartLogo = availableLogos ? availableLogos.flipkart : MARKETS.flipkart.hasLogo;
  const hasMeeshoLogo = availableLogos ? availableLogos.meesho : MARKETS.meesho.hasLogo;

  return (
    <article
      id={product.slug}
      style={
        !isMatching
          ? { opacity: 0.15, transform: "scale(0.96)", pointerEvents: "none" }
          : { opacity: 1, transform: "scale(1)", pointerEvents: "auto" }
      }
      className={`product-card scroll-mt-28 md:scroll-mt-36 group relative bg-grey p-5 md:p-6 flex flex-col justify-between border border-[#E2E0D8] transition-all duration-300 ${
        isMatching ? "hover:shadow-md" : ""
      }`}
    >
      <div>
        {/* Image Container: 4/5 Aspect Ratio with Grey Background & Slide-Up Notes Panel */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#ECECEA] mb-5 border border-ink/5 group/image">
          {/* Primary Layer: Pack Shot centered with ~8% breathing room, mix-blend-mode: multiply */}
          <div className="absolute inset-0 p-[8%] flex items-center justify-center z-0">
            <div
              style={{
                filter: "drop-shadow(0 12px 12px rgba(0,0,0,0.18))",
              }}
              className="relative w-full h-full"
            >
              <Image
                src={packShotImg.src}
                alt={packShotImg.alt}
                fill
                quality={90}
                placeholder="blur"
                blurDataURL={packShotImg.blurDataURL}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                className="object-contain object-center mix-blend-multiply transition-transform duration-500 group-hover:scale-104"
              />
            </div>
          </div>

          {/* Solid Persona Notes Panel on Desktop Hover / Keyboard Focus-Within */}
          <div
            className={`hidden [@media(hover:hover)]:flex absolute inset-x-0 bottom-0 ${personaPanelBg[product.color]} text-cream p-4 flex-col justify-end translate-y-full group-hover:translate-y-0 group-focus-within:translate-y-0 transition-transform duration-500 ease-out z-20 pointer-events-none shadow-lg`}
          >
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-cream/70 font-bold mb-0.5">
              PROFILE
            </span>
            <p className="font-display italic text-sm text-cream font-medium line-clamp-1 mb-2">
              {product.profile}
            </p>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-cream/70 font-bold mb-0.5">
              NOTES
            </span>
            <p className="font-display italic text-xs text-cream/90 leading-snug line-clamp-2">
              {product.notes.join(", ")}
            </p>
          </div>
        </div>

        {/* Touch devices: static text block instead of hover */}
        <div className="block [@media(hover:hover)]:hidden mt-[-10px] mb-4 pt-2 border-t border-ink/10">
          <span className="block font-sans text-[10px] uppercase tracking-[0.18em] text-ink/60 font-semibold mb-0.5">
            PROFILE
          </span>
          <p className="font-display italic text-xs text-ink mb-1.5">
            {product.profile}
          </p>
          <span className="block font-sans text-[10px] uppercase tracking-[0.18em] text-ink/60 font-semibold mb-0.5">
            NOTES
          </span>
          <p className="font-display italic text-xs text-ink/80">
            {product.notes.join(", ")}
          </p>
        </div>

        {/* Screen Reader accessible notes description */}
        <div className="sr-only">
          Profile: {product.profile}. Notes: {product.notes.join(", ")}.
        </div>

        {/* Card Body: Top Tag in Persona Colour */}
        <div className="mb-2.5">
          <Tag color={product.color} className="text-[10px] py-1 px-2.5">
            {product.role.toUpperCase()}
          </Tag>
        </div>

        {/* Title: Cormorant Garamond 28-32px Bold */}
        <h3 className="font-display font-bold text-[clamp(26px,2.2vw,32px)] text-ink leading-tight mb-1">
          <Link
            href={`/scent/${product.slug}`}
            className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
          >
            {product.name}
          </Link>
        </h3>

        {/* Subtitle: Volume & Concentration Archivo 11px Uppercase Tracked */}
        <span className="block font-sans text-[11px] uppercase tracking-[0.2em] text-ink/60 mb-3">
          {product.volume} · {product.concentration}
        </span>

        {/* Scent Family Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {product.families.map((family) => (
            <span
              key={family}
              className="px-2 py-0.5 bg-ink/5 border border-ink/10 text-[10px] font-sans font-medium text-ink uppercase tracking-wider"
            >
              {family}
            </span>
          ))}
        </div>

        {/* One-Liner (1 line clamped) */}
        <p className="font-display italic text-sm text-ink/75 mb-5 line-clamp-1">
          {product.oneLiner}
        </p>
      </div>

      {/* Action Row: Primary Discover Button + Secondary Marketplace Chips */}
      <div className="w-full pt-3 border-t border-ink/10 flex flex-col gap-3">
        {/* Primary Discover Button */}
        <Link
          href={`/scent/${product.slug}`}
          className={`w-full py-3 px-4 bg-ink text-cream text-xs font-sans font-semibold uppercase tracking-wider text-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${hoverColorClasses[product.color]}`}
        >
          Discover {product.name}
        </Link>

        {/* Secondary Marketplace Logo Chips under "AVAILABLE ON" */}
        <div className="w-full flex flex-col gap-1.5 pt-1">
          <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-ink/55 text-center">
            AVAILABLE ON
          </span>
          <div className="grid grid-cols-3 gap-1.5 w-full">
            <OutboundLink
              market="amazon"
              product={product.slug}
              className={`h-[34px] bg-cream border border-ink/15 text-ink flex items-center justify-center px-1.5 transition-all duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${hoverBorderClasses[product.color]}`}
              aria-label={`Buy ${product.name} on Amazon`}
            >
              <MarketLogo
                market="amazon"
                hasLogo={hasAmazonLogo}
                height={13}
                variant="compact"
              />
            </OutboundLink>

            <OutboundLink
              market="flipkart"
              product={product.slug}
              className={`h-[34px] bg-cream border border-ink/15 text-ink flex items-center justify-center px-1.5 transition-all duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${hoverBorderClasses[product.color]}`}
              aria-label={`Buy ${product.name} on Flipkart`}
            >
              <MarketLogo
                market="flipkart"
                hasLogo={hasFlipkartLogo}
                height={14}
                variant="compact"
              />
            </OutboundLink>

            <OutboundLink
              market="meesho"
              product={product.slug}
              className={`h-[34px] bg-cream border border-ink/15 text-ink flex items-center justify-center px-1.5 transition-all duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${hoverBorderClasses[product.color]}`}
              aria-label={`Buy ${product.name} on Meesho`}
            >
              <MarketLogo
                market="meesho"
                hasLogo={hasMeeshoLogo}
                height={14}
                variant="compact"
              />
            </OutboundLink>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
