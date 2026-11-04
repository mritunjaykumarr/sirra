// TODO: Delete before launch (Phase 9)
"use client";

import React, { useRef } from "react";
import Tag from "@/components/ui/Tag";
import Label from "@/components/ui/Label";
import Section from "@/components/ui/Section";
import { useGsap, fadeUp, fadeUpStagger, maskReveal } from "@/lib/motion";

export default function MotionTestPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fadeUpRef = useRef<HTMLDivElement>(null);
  const staggerRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  useGsap(() => {
    if (fadeUpRef.current) {
      fadeUp(fadeUpRef.current);
    }
    if (staggerRef.current) {
      const items = staggerRef.current.querySelectorAll(".stagger-item");
      fadeUpStagger(Array.from(items), { trigger: staggerRef.current });
    }
    if (maskRef.current) {
      maskReveal(maskRef.current);
    }
  }, [], containerRef);

  return (
    <div ref={containerRef} className="w-full pt-28">
      <Section bg="cream">
        <div className="flex flex-col gap-6">
          <Tag>MOTION TEST</Tag>
          <h1 className="font-display text-4xl text-ink">Animation Infrastructure Test</h1>
          <p className="font-sans text-sm text-ink/70">
            Testing fadeUp, fadeUpStagger, and maskReveal helpers with GSAP ScrollTrigger and reduced-motion fallback.
          </p>
        </div>
      </Section>

      <Section bg="grey">
        <div ref={fadeUpRef} className="p-8 bg-white border border-ink/10">
          <Label>Single Fade Up</Label>
          <p className="font-display text-3xl text-ink mt-2">Smoothly entering viewport</p>
        </div>
      </Section>

      <Section bg="cream">
        <div ref={staggerRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stagger-item p-6 bg-white border border-ink/10">
            <Label>Item 01</Label>
            <p className="font-display text-xl text-ink mt-1">Stagger 0.1s</p>
          </div>
          <div className="stagger-item p-6 bg-white border border-ink/10">
            <Label>Item 02</Label>
            <p className="font-display text-xl text-ink mt-1">Stagger 0.1s</p>
          </div>
          <div className="stagger-item p-6 bg-white border border-ink/10">
            <Label>Item 03</Label>
            <p className="font-display text-xl text-ink mt-1">Stagger 0.1s</p>
          </div>
        </div>
      </Section>

      <Section bg="ink">
        <div ref={maskRef} className="p-12 bg-black border border-cream/10 text-cream max-w-xl mx-auto">
          <Label tone="light">Mask Reveal</Label>
          <p className="font-display text-3xl mt-2 text-gold">Clip-path Inset Reveal</p>
        </div>
      </Section>
    </div>
  );
}

