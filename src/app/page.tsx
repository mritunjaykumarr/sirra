import {
  HeroFragranceSection,
  MarqueeSection,
  ScentChapters,
  CollectionGridSection,
  IntroStatementSection,
  NameCompositionSection,
  TruthStatementSection,
  TheFlexSection,
  ManifestoSection,
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

      {/* 3. SCENT CHAPTERS: The Catalogue Story (id="scents") */}
      <ScentChapters availableLogos={availableLogos} />

      {/* 4. COLLECTION AT A GLANCE: Catalogue Index (id="collection") */}
      <CollectionGridSection availableLogos={availableLogos} />

      {/* 5. THE HOUSE: Brand Story (id="house") */}
      <section id="house" className="w-full flex flex-col">
        {/* Intro Section Header */}
        <div className="w-full bg-cream pt-14 pb-2 px-5 md:px-10 border-t border-ink/10 flex justify-center">
          <Label className="tracking-[0.25em] text-ink/60">
            THE HOUSE OF SIRRA
          </Label>
        </div>

        {/* 5a. Intro Statement */}
        <IntroStatementSection />

        {/* 5b. The Name Composition (id="name") */}
        <NameCompositionSection />

        {/* 5c. The Truth & Pull Statement */}
        <TruthStatementSection />

        {/* 5d. The Flex: Loud vs. Quiet */}
        <TheFlexSection />

        {/* 5e. The Manifesto */}
        <ManifestoSection />
      </section>

      {/* 6. THE BRAND MANTRA */}
      <MantraSection />

      {/* Mobile-only Sticky Bottom Action Bar */}
      <MobileStickyBar />
    </div>
  );
}
