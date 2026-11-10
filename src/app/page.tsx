import {
  HeroFragranceSection,
  MarqueeSection,
  RangeStorySection,
  ScentChapters,
  CollectionGridSection,
  IntroStatementSection,
  NameCompositionSection,
  TruthStatementSection,
  TheFlexSection,
  MantraSection,
  MobileStickyBar,
  ScrollRefresher,
} from "@/components/home";
import Label from "@/components/ui/Label";
import { getLogoAvailability } from "@/lib/logos.server";

export default function Home() {
  const availableLogos = getLogoAvailability();

  return (
    <div className="w-full flex flex-col overflow-x-hidden">
      <ScrollRefresher />

      {/* 1. HERO: Fragrance First */}
      <HeroFragranceSection />

      {/* 2. MARQUEE */}
      <MarqueeSection />

      {/* 3. RANGE STORY: Range-level Storytelling (id="range") */}
      <RangeStorySection />

      {/* 4. SCENT CHAPTERS: The Catalogue Story (id="scents") */}
      <ScentChapters availableLogos={availableLogos} />

      {/* 5. COLLECTION AT A GLANCE: Catalogue Index (id="collection") */}
      <CollectionGridSection availableLogos={availableLogos} />

      {/* 6. THE HOUSE: Brand Story (id="house") */}
      <section id="house" className="w-full flex flex-col">
        {/* Intro Section Header */}
        <div className="w-full bg-cream pt-14 pb-2 px-5 md:px-10 border-t border-ink/10 flex justify-center">
          <Label className="tracking-[0.25em] text-ink/60">
            THE HOUSE OF SIRRA
          </Label>
        </div>

        {/* 6a. Intro Statement */}
        <IntroStatementSection />

        {/* 6b. The Name Composition (id="name") */}
        <NameCompositionSection />

        {/* 6c. The Truth & Pull Statement */}
        <TruthStatementSection />

        {/* 6d. The Flex: Loud vs. Quiet */}
        <TheFlexSection />
      </section>

      {/* 7. THE BRAND MANTRA */}
      <MantraSection />

      {/* Mobile-only Sticky Bottom Action Bar */}
      <MobileStickyBar />
    </div>
  );
}
