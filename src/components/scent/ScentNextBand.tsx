import React from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";
import { Product, getAdjacentProducts } from "@/content";

export interface ScentNextBandProps {
  product: Product;
}

export function ScentNextBand({ product }: ScentNextBandProps) {
  const { prev, next } = getAdjacentProducts(product.slug);

  return (
    <section className="relative z-20 w-full bg-[#EAE5DA] text-ink py-16 md:py-24 px-5 md:px-12 border-b border-ink/10">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-10">
        {/* Navigation Breadcrumb & Previous Link */}
        <div className="flex items-center justify-between border-b border-ink/15 pb-4">
          <Link
            href={`/scent/${prev.slug}`}
            className="font-sans text-xs uppercase tracking-[0.2em] font-semibold text-ink/65 hover:text-gold transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold p-1"
          >
            <span aria-hidden="true">&larr;</span> Previous: {prev.name}
          </Link>

          <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-ink/50 font-medium hidden sm:inline">
            THE FOUR FLEXES
          </span>
        </div>

        {/* Next Scent Preview Box: Pack shot on grey, name, profile, Discover button */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-4xl mx-auto w-full py-4">
          {/* Next Scent Bottle Thumbnail on Grey Plate */}
          <div className="md:col-span-5 flex justify-center">
            <Link
              href={`/scent/${next.slug}`}
              tabIndex={-1}
              aria-hidden="true"
              className="relative w-48 sm:w-56 md:w-64 aspect-[4/5] bg-[#ECECEA] border border-ink/10 p-5 shadow-lg flex items-center justify-center overflow-hidden group"
            >
              <div className="relative w-full h-full">
                <Image
                  src={next.packShot.src}
                  alt={next.packShot.alt}
                  fill
                  quality={90}
                  placeholder="blur"
                  blurDataURL={next.packShot.blurDataURL}
                  sizes="260px"
                  className="object-contain object-center mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>

              {/* Single Contact Shadow */}
              <div
                aria-hidden="true"
                className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-3/5 h-2.5 bg-black/18 rounded-full blur-[5px] pointer-events-none"
              />
            </Link>
          </div>

          {/* Next Scent Details & Discover Action */}
          <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <Tag color={next.color} className="text-[10px] py-1 px-3">
              NEXT SCENT · {next.number}
            </Tag>

            <h3 className="font-display font-light text-[clamp(36px,4.5vw,56px)] text-ink leading-tight">
              {next.name}
            </h3>

            {/* Profile */}
            <p className="font-display italic text-lg sm:text-xl text-ink font-medium">
              {next.profile}
            </p>

            <p className="font-sans text-xs uppercase tracking-[0.2em] font-semibold text-ink/65 mb-2">
              {next.role}
            </p>

            <div className="pt-2">
              <Button variant="dark" href={`/scent/${next.slug}`}>
                Discover {next.name}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ScentNextBand;
