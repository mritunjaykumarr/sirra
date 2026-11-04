"use client";

import React, { useRef } from "react";
import Tag from "@/components/ui/Tag";
import Section from "@/components/ui/Section";
import { COPY } from "@/content";
import { useGsap, fadeUpStagger } from "@/lib/motion";

export function TheFlexSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGsap(() => {
    if (contentRef.current) {
      const items = contentRef.current.querySelectorAll(".flex-item");
      fadeUpStagger(Array.from(items), {
        trigger: contentRef.current,
        start: "top 75%",
        stagger: 0.12,
      });
    }
  }, [], sectionRef);

  return (
    <Section id="the-flex" bg="cream" className="py-16 md:py-28 border-b border-ink/10">
      <div ref={sectionRef} className="max-w-[1440px] mx-auto">
        <div
          ref={contentRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-start"
        >
          {/* Left Column: Tag and Section Identity */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex-item">
              <Tag color="rust">
                {COPY.flex.tag}
              </Tag>
            </div>
            <h2 className="flex-item font-display text-[clamp(36px,4.5vw,60px)] text-ink leading-tight">
              Simplicity meets swagger.
            </h2>
            <p className="flex-item font-sans text-xs uppercase tracking-[0.2em] text-ink/60 font-semibold">
              CULTURAL BACKBONE · QUIET LUXURY
            </p>
          </div>

          {/* Right Column: Three Verbatim Paragraphs */}
          <div className="lg:col-span-7 flex flex-col gap-6 pt-2">
            {COPY.flex.paragraphs.map((p, idx) => (
              <p
                key={idx}
                className="flex-item font-display text-xl sm:text-2xl md:text-3xl text-ink leading-relaxed font-normal"
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

export default TheFlexSection;

