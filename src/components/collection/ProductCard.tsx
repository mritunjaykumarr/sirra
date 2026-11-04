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
  onOpenDrawer?: (slug: string) => void;
  availableLogos?: Record<MarketKey, boolean>;
  showDiscoverLink?: boolean;
}

export function ProductCard({
  product,
  isMatching = true,
  onOpenDrawer,
  availableLogos,
  showDiscoverLink = true,
}: ProductCardProps) {
  const personaImg = IMAGES[product.image];
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

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking an interactive child (a, button), do not intercept
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button")) {
      return;
    }
    if (onOpenDrawer) {
      onOpenDrawer(product.slug);
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      const target = e.target as HTMLElement;
      if (target.closest("a") || target.closest("button")) {
        return;
      }
      if (onOpenDrawer) {
        e.preventDefault();
        onOpenDrawer(product.slug);
      }
    }
  };

  const hasAmazonLogo = availableLogos ? availableLogos.amazon : MARKETS.amazon.hasLogo;
  const hasFlipkartLogo = availableLogos ? availableLogos.flipkart : MARKETS.flipkart.hasLogo;
  const hasMeeshoLogo = availableLogos ? availableLogos.meesho : MARKETS.meesho.hasLogo;

  return (
    <article
      id={product.slug}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role={onOpenDrawer ? "button" : undefined}
      tabIndex={onOpenDrawer ? 0 : undefined}
      aria-label={onOpenDrawer ? `View ${product.name} details` : undefined}
      style={
        !isMatching
          ? { opacity: 0.15, transform: "scale(0.96)", pointerEvents: "none" }
          : { opacity: 1, transform: "scale(1)", pointerEvents: "auto" }
      }
      className={`product-card scroll-mt-28 md:scroll-mt-36 group relative bg-grey p-5 md:p-6 flex flex-col justify-between border border-[#E2E0D8] transition-all duration-300 ${
        isMatching ? "hover:shadow-md" : ""
      } ${onOpenDrawer ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" : ""}`}
    >
      <div>
        {/* Image Container: 4/5 Aspect Ratio with Grey Background */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#ECECEA] mb-5 border border-ink/5">
          {/* Primary Layer: Pack Shot centered with ~8% breathing room, mix-blend-mode: multiply */}
          <div className="absolute inset-0 p-[8%] flex items-center justify-center z-0">
            <div className="relative w-full h-full">
              <Image
                src={packShotImg.src}
                alt={packShotImg.alt}
                fill
                quality={90}
                placeholder="blur"
                blurDataURL={packShotImg.blurDataURL}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                className="object-contain object-center mix-blend-multiply transition-transform duration-500"
              />
            </div>
          </div>

          {/* Secondary Layer: Persona photograph on desktop hover/focus (hidden on touch devices) */}
          {personaImg && (
            <div
              aria-hidden="true"
              className="hidden [@media(hover:hover)]:block absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-400 ease-out"
            >
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={personaImg.src}
                  alt={personaImg.alt}
                  fill
                  quality={90}
                  placeholder="blur"
                  blurDataURL={personaImg.blurDataURL}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                  className="object-cover object-center transform scale-104 group-hover:scale-100 group-focus-within:scale-100 transition-transform duration-500 ease-out"
                />
              </div>
            </div>
          )}
        </div>

        {/* Card Body: Top Tag in Persona Colour */}
        <div className="mb-2.5">
          <Tag color={product.color} className="text-[10px] py-1 px-2.5">
            {product.role.toUpperCase()}
          </Tag>
        </div>

        {/* Title: Cormorant Garamond 28-32px Bold */}
        <h3 className="font-display font-bold text-[clamp(26px,2.2vw,32px)] text-ink leading-tight mb-1">
          {product.name}
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

      {/* Action Row */}
      <div className="w-full pt-3 border-t border-ink/10">
        {/* Primary Buy Button */}
        <OutboundLink
          market="amazon"
          product={product.slug}
          className={`w-full py-3 px-4 bg-ink text-cream text-xs font-sans font-semibold uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${hoverColorClasses[product.color]}`}
        >
          {hasAmazonLogo && (
            <MarketLogo
              market="amazon"
              hasLogo={true}
              height={16}
              variant="compact"
              className="max-h-[16px] object-contain brightness-0 invert"
            />
          )}
          <span>Buy on Amazon</span>
        </OutboundLink>

        {/* Marketplace Chips & Optional Discover Link */}
        <div className="flex items-center gap-2 mt-2.5">
          <OutboundLink
            market="flipkart"
            product={product.slug}
            className={`flex-1 min-w-0 h-[38px] bg-cream border border-ink/15 text-ink flex items-center justify-center px-2 transition-all duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${hoverBorderClasses[product.color]}`}
            aria-label={`Buy ${product.name} on Flipkart`}
          >
            <div className="flex items-center justify-center max-w-[75%] h-[18px]">
              <MarketLogo
                market="flipkart"
                hasLogo={hasFlipkartLogo}
                height={18}
                variant="compact"
              />
            </div>
          </OutboundLink>

          <OutboundLink
            market="meesho"
            product={product.slug}
            className={`flex-1 min-w-0 h-[38px] bg-cream border border-ink/15 text-ink flex items-center justify-center px-2 transition-all duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${hoverBorderClasses[product.color]}`}
            aria-label={`Buy ${product.name} on Meesho`}
          >
            <div className="flex items-center justify-center max-w-[75%] h-[18px]">
              <MarketLogo
                market="meesho"
                hasLogo={hasMeeshoLogo}
                height={18}
                variant="compact"
              />
            </div>
          </OutboundLink>

          {showDiscoverLink && (
            <div className="shrink-0 flex items-center pl-1">
              {onOpenDrawer ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDrawer(product.slug);
                  }}
                  className="font-sans text-[11px] uppercase tracking-wider font-semibold text-ink/70 hover:text-rust py-1.5 px-2 underline underline-offset-4 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  Discover
                </button>
              ) : (
                <Link
                  href={`/collection?open=${product.slug}`}
                  className="font-sans text-[11px] uppercase tracking-wider font-semibold text-ink/70 hover:text-rust py-1.5 px-2 underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  Discover
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;

