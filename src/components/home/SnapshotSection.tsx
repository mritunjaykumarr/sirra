"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import Label from "@/components/ui/Label";
import Section from "@/components/ui/Section";
import { COPY, IMAGES } from "@/content";
import { useGsap, fadeUpStagger, maskReveal, parallax } from "@/lib/motion";

export function SnapshotSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const imageInnerRef = useRef<HTMLDivElement>(null);

  const portrait = IMAGES["cover-portrait"];

  useGsap(() => {
    if (rowsRef.current) {
      const rows = rowsRef.current.querySelectorAll(".snapshot-row");
      fadeUpStagger(Array.from(rows), {
        trigger: rowsRef.current,
        start: "top 75%",
        stagger: 0.1,
      });
    }

    if (imageFrameRef.current) {
      maskReveal(imageFrameRef.current, {
        start: "top 75%",
      });
    }

    if (imageInnerRef.current && imageFrameRef.current) {
      parallax(imageInnerRef.current, 0.06, {
        trigger: imageFrameRef.current,
        start: "top bottom",
        end: "bottom top",
      });
    }
  }, [], sectionRef);

  const snapshotRows = [
    { label: "CATEGORY", value: COPY.snapshot.category, isSpecial: false },
    { label: "CORE IDEA", value: COPY.snapshot.coreIdea, isSpecial: false },
    { label: "POSITIONING", value: COPY.snapshot.positioning, isSpecial: false },
    { label: "BASELINE", value: COPY.snapshot.baseline, isSpecial: true },
  ];

  return (
    <Section bg="cream" className="overflow-hidden" id="snapshot">
      <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-stretch">
        {/* Mobile: Image first (order-1 on mobile, order-2 on desktop) */}
        <div className="order-1 md:order-2 flex items-center justify-center">
          <div
            ref={imageFrameRef}
            className="relative w-full max-w-[540px] md:max-w-none h-[420px] sm:h-[500px] md:h-full min-h-[440px] lg:min-h-[580px] overflow-hidden shadow-xs bg-ink/5"
          >
            <div ref={imageInnerRef} className="absolute -top-[10%] left-0 w-full h-[120%]">
              <Image
                src={portrait.src}
                alt={portrait.alt}
                fill
                placeholder="blur"
                blurDataURL={portrait.blurDataURL}
                quality={90}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 620px"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* Rows: Left on desktop (order-2 on mobile, order-1 on desktop) */}
        <div className="order-2 md:order-1 flex flex-col justify-center">
          <div className="mb-8 md:mb-12">
            <Tag>{COPY.snapshot.tag}</Tag>
          </div>

          <div ref={rowsRef} className="flex flex-col border-t border-ink/15">
            {snapshotRows.map((row) => (
              <div
                key={row.label}
                className="snapshot-row py-5 md:py-6 border-b border-ink/15 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2"
              >
                <div className="min-w-[130px]">
                  <Label>{row.label}</Label>
                </div>
                <div className="flex-1 text-left sm:text-right">
                  {row.isSpecial ? (
                    <span className="font-display italic text-2xl md:text-3xl text-rust">
                      {row.value}
                    </span>
                  ) : (
                    <span className="font-sans text-base md:text-lg text-ink font-medium leading-relaxed">
                      {row.value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

export default SnapshotSection;

