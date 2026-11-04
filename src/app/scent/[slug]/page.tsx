import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PRODUCTS, getProduct, getProductJsonLd } from "@/content";
import { getLogoAvailability } from "@/lib/logos.server";
import {
  ScentHero,
  ScentNotes,
  ScentDetails,
  ScentAvailableOn,
  ScentNextBand,
} from "@/components/scent";

export interface ScentPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: ScentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  const description = `${product.role} — ${product.profile}. 50ml Eau de Parfum.`;

  return {
    title: `${product.name} · SIRRA`,
    description,
    openGraph: {
      title: `${product.name} · SIRRA`,
      description,
      images: [
        {
          url: product.packShot.src,
          width: product.packShot.width,
          height: product.packShot.height,
          alt: product.packShot.alt,
        },
      ],
    },
  };
}

export default async function ScentPage({ params }: ScentPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  const availableLogos = getLogoAvailability();
  const jsonLd = getProductJsonLd(product);

  return (
    <article className="w-full flex flex-col overflow-x-hidden">
      {/* Product JSON-LD structured data (name, sku, brand, size, without prices/offers) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* a) Scent Hero (ink, 100svh): Profile first, quote, personality body, VideoSlot */}
      <ScentHero product={product} />

      {/* b) Scent Notes (cream): Large chip cards + pack shot on grey plate with notes panel */}
      <ScentNotes product={product} />

      {/* c) Technical Details: Hairline table without prices or stock status */}
      <ScentDetails product={product} />

      {/* d) Available On: Shared logo tiles with product-specific UTMs */}
      <ScentAvailableOn product={product} availableLogos={availableLogos} />

      {/* e) Next Scent Band: Fixed cycle preview with Discover action & Previous link */}
      <ScentNextBand product={product} />
    </article>
  );
}
