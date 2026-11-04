import {
  HeroSplitSection,
  MarqueeSection,
  IntroStatementSection,
  NameCompositionSection,
  TruthStatementSection,
  CollectionGridSection,
  MantraSection,
  MobileStickyBar,
  ScrollRefresher,
} from "@/components/home";
import { getLogoAvailability } from "@/lib/logos.server";

export default function Home() {
  const availableLogos = getLogoAvailability();

  return (
    <div className="w-full flex flex-col overflow-x-hidden">
      <ScrollRefresher />

      {/* 1. HERO (Four-Panel Split) */}
      <HeroSplitSection />

      {/* 2. MARQUEE */}
      <MarqueeSection />

      {/* 3. INTRO STATEMENT */}
      <IntroStatementSection />

      {/* 4. THE NAME COMPOSITION */}
      <NameCompositionSection />

      {/* 5. THE SIRRA TRUTH (+ Pull Statement on Ink) */}
      <TruthStatementSection />

      {/* 6. THE COLLECTION (Rabanne-style Product Grid) */}
      <CollectionGridSection availableLogos={availableLogos} />

      {/* 7. THE BRAND MANTRA */}
      <MantraSection />

      {/* Mobile-only Sticky Bottom Action Bar */}
      <MobileStickyBar />
    </div>
  );
}
