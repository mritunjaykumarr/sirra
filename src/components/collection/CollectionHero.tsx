"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import Label from "@/components/ui/Label";
import { IMAGES, PRODUCTS } from "@/content";
import { useGsap, fadeUp, maskReveal } from "@/lib/motion";

export function CollectionHero() {
  const heroRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const stripsRef = useRef<HTMLDivElement>(null);

  const heroStrips = PRODUCTS.map((product) => ({
    slug: product.slug,
    name: product.name,
    image: IMAGES[product.image],
  }));

  useGsap(() => {
    if (leftRef.current) {
      fadeUp(leftRef.current, { start: "top 80%" });
    }
    if (stripsRef.current) {
      const strips = stripsRef.current.querySelectorAll(".persona-strip");
      strips.forEach((strip) => {
        maskReveal(strip, { start: "top 80%" });
      });
    }
  }, [], heroRef);

  return (
    <section
      ref={heroRef}
      className="relative w-full bg-ink text-cream min-h-[50svh] md:min-h-[60svh] flex items-center pt-28 pb-16 md:py-24 px-5 md:px-10 overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Heading & Details */}
        <div ref={leftRef} className="md:col-span-7 flex flex-col items-start gap-4">
          <div className="mb-2">
            <Tag color="rust">THE COLLECTION</Tag>
          </div>

          <h1 className="font-display text-[clamp(44px,7.5vw,100px)] text-cream leading-[0.92] tracking-tight">
            The collection
          </h1>

          <p className="font-sans text-sm md:text-base text-cream/80 max-w-md font-normal leading-relaxed mt-2">
            Four scents, one idea. None outranks another.
          </p>

          <div className="mt-2">
            <Label tone="light">50ML EAU DE PARFUM</Label>
          </div>
        </div>

        {/* Right Column: Four Tall Slim Persona Image Strips */}
        <div className="md:col-span-5 flex justify-center md:justify-end">
          <div
            ref={stripsRef}
            className="flex gap-2.5 h-[340px] sm:h-[400px] md:h-[440px] w-full max-w-[480px] lg:max-w-[560px] overflow-hidden shadow-xl"
          >
            {heroStrips.map((strip) => (
              <div
                key={strip.slug}
                className="persona-strip relative flex-1 h-full overflow-hidden bg-ink/40 border border-cream/15"
              >
                <Image
                  src={strip.image.src}
                  alt={strip.image.alt}
                  fill
                  placeholder="blur"
                  blurDataURL={strip.image.blurDataURL}
                  quality={90}
                  sizes="(max-width: 768px) 25vw, 150px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CollectionHero;

