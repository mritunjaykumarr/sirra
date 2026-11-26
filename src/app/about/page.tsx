import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Tag from "@/components/ui/Tag";
import Label from "@/components/ui/Label";
import Wordmark from "@/components/ui/Wordmark";
import { COPY, IMAGES } from "@/content";

export const metadata: Metadata = {
  title: "About Us | SIRRA · Fine Fragrance",
  description:
    "A fragrance house built on one word. We'll never ask you to become someone new. We'll only ask you to stop underselling who you already are.",
};

export default function AboutPage() {
  const about = COPY.about;
  const personas = [
    {
      title: "The Wanderer",
      text: "The wanderer who owns a new city before learning its language.",
      slug: "wayfarer",
      image: IMAGES["flex-wayfarer"],
      tagColor: "wayfarer" as const,
      number: "01",
    },
    {
      title: "The Quiet One",
      text: "The quiet one whose stillness outweighs a room full of noise.",
      slug: "equinox",
      image: IMAGES["flex-equinox"],
      tagColor: "equinox" as const,
      number: "02",
    },
    {
      title: "The Rooted One",
      text: "The rooted one whose accent, city and block are the loudest flex in the room.",
      slug: "silk-smoke",
      image: IMAGES["flex-silk-smoke"],
      tagColor: "silkSmoke" as const,
      number: "03",
    },
    {
      title: "The Open One",
      text: "The open one who loves fully and never apologizes for how much.",
      slug: "heartthrob",
      image: IMAGES["flex-heartthrob"],
      tagColor: "heartthrob" as const,
      number: "04",
    },
  ];

  return (
    <main className="w-full bg-cream text-ink flex flex-col pt-24 md:pt-32">
      {/* 1. HERO SECTION */}
      <section className="w-full px-5 md:px-10 py-16 md:py-24 border-b border-ink/10">
        <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
          <div className="mb-6">
            <Tag color="rust">{about.eyebrow}</Tag>
          </div>
          <h1 className="font-display text-[clamp(44px,6vw,92px)] text-ink leading-[1.05] max-w-4xl tracking-tight mb-8">
            {about.headline}
          </h1>
          <div className="w-24 h-[1px] bg-gold mb-10" />
          <p className="font-sans text-base md:text-xl text-ink/80 max-w-2xl leading-relaxed">
            Sirra (Punjabi): the absolute peak. We bottled it for those who already live there.
          </p>
        </div>
      </section>

      {/* 2. THE BELIEF */}
      <section className="w-full bg-ink text-cream px-5 md:px-10 py-20 md:py-32">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
          <div className="md:col-span-5 flex flex-col items-start">
            <Label className="text-gold tracking-[0.25em] mb-4">
              {about.belief.heading.toUpperCase()}
            </Label>
            <h2 className="font-display italic text-[clamp(32px,3.8vw,56px)] text-cream leading-tight">
              &ldquo;People who don&apos;t chase, attract.&rdquo;
            </h2>
          </div>
          <div className="md:col-span-7 flex flex-col gap-6">
            <p className="font-sans text-lg md:text-2xl text-cream/90 font-light leading-relaxed">
              {about.belief.text}
            </p>
            <div className="pt-4">
              <span className="font-sans text-xs uppercase tracking-[0.25em] text-rust font-bold">
                ROOTED · REFINED · UNMATCHED
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHO IT'S FOR */}
      <section className="w-full px-5 md:px-10 py-20 md:py-32 border-b border-ink/10">
        <div className="max-w-[1440px] mx-auto flex flex-col gap-12 md:gap-16">
          <div className="flex flex-col items-center text-center gap-3">
            <Label className="text-ink/60 tracking-[0.25em]">
              {about.whoItsFor.heading.toUpperCase()}
            </Label>
            <h2 className="font-display text-[clamp(36px,4.5vw,68px)] text-ink leading-tight">
              {about.whoItsFor.subhead}
            </h2>
          </div>

          {/* 4 Persona Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((p) => (
              <Link
                key={p.slug}
                href={`/scent/${p.slug}`}
                className="group relative flex flex-col bg-white border border-ink/10 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-ink/5">
                  <Image
                    src={p.image.src}
                    alt={p.image.alt}
                    fill
                    placeholder="blur"
                    blurDataURL={p.image.blurDataURL}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <Tag color={p.tagColor}>
                      {p.number} · {p.title.toUpperCase()}
                    </Tag>
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent pointer-events-none"
                  />
                </div>
                <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                  <p className="font-sans text-sm md:text-base text-ink/85 leading-relaxed font-normal">
                    {p.text}
                  </p>
                  <span className="font-sans text-xs uppercase tracking-[0.18em] font-semibold text-rust group-hover:underline flex items-center gap-1">
                    Explore Scent &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center pt-4">
            <p className="font-display italic text-2xl md:text-3xl text-rust">
              {about.whoItsFor.closing}
            </p>
          </div>
        </div>
      </section>

      {/* 4. WHAT WE STAND FOR */}
      <section className="w-full bg-[#EAE6DF] px-5 md:px-10 py-20 md:py-32 border-b border-ink/10">
        <div className="max-w-[1440px] mx-auto flex flex-col gap-12 md:gap-16">
          <div className="flex flex-col items-center text-center gap-3">
            <Label className="text-ink/60 tracking-[0.25em]">
              OUR PILLARS
            </Label>
            <h2 className="font-display text-[clamp(36px,4.5vw,68px)] text-ink leading-tight">
              {about.values.heading}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {about.values.pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-cream border border-ink/15 p-8 md:p-12 flex flex-col justify-between min-h-[240px] shadow-xs"
              >
                <div>
                  <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-rust font-bold mb-3 block">
                    PILLAR
                  </span>
                  <h3 className="font-display text-3xl md:text-4xl text-ink uppercase tracking-wider mb-4">
                    {pillar.title}
                  </h3>
                </div>
                <div className="pt-6 border-t border-ink/10">
                  <p className="font-sans text-base md:text-lg text-ink/80 leading-relaxed font-light">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. OUR PROMISE */}
      <section className="w-full px-5 md:px-10 py-20 md:py-28 border-b border-ink/10">
        <div className="max-w-[1000px] mx-auto flex flex-col items-center text-center">
          <Label className="text-rust tracking-[0.25em] mb-4">
            {about.promise.heading.toUpperCase()}
          </Label>
          <blockquote className="font-display text-[clamp(28px,3.8vw,52px)] text-ink leading-[1.2] mb-8 font-normal">
            “{about.promise.text}”
          </blockquote>
          <div className="w-16 h-[1px] bg-gold" />
        </div>
      </section>

      {/* 6. HAND-OFF TO THE COLLECTION */}
      <section className="w-full bg-ink text-cream px-5 md:px-10 py-24 md:py-32">
        <div className="max-w-[1000px] mx-auto flex flex-col items-center text-center gap-6">
          <Wordmark size="base" className="text-cream" />
          <p className="font-sans text-base md:text-xl text-cream/80 max-w-xl font-light">
            {about.handoff.text}
          </p>
          <div className="pt-4">
            <Link
              href="/#scents"
              className="inline-flex items-center justify-center px-10 py-4 bg-gold text-ink font-sans font-bold text-xs uppercase tracking-[0.22em] hover:bg-[#EBB43F] transition-colors shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {about.handoff.action} &rarr;
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
