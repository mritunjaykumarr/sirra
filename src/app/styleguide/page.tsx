// TODO: Delete before launch (Phase 9)
import React from "react";
import Tag from "@/components/ui/Tag";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import Wordmark from "@/components/ui/Wordmark";
import Section from "@/components/ui/Section";
import OutboundLink from "@/components/ui/OutboundLink";
import { MARKETS, PRODUCTS, COPY, MarketKey } from "@/content";

export const metadata = {
  title: "Styleguide · SIRRA",
  description: "Temporary design system styleguide for SIRRA",
};

export default function StyleguidePage() {
  const colorTokens = [
    { name: "ink", hex: "#141312", bg: "bg-ink", text: "text-cream" },
    { name: "cream", hex: "#F3F0EA", bg: "bg-cream", text: "text-ink" },
    { name: "rust", hex: "#B84A2B", bg: "bg-rust", text: "text-cream" },
    { name: "gold", hex: "#E0A52B", bg: "bg-gold", text: "text-ink" },
    { name: "wayfarer", hex: "#1E3A6B", bg: "bg-wayfarer", text: "text-cream" },
    { name: "equinox", hex: "#8B7A5E", bg: "bg-equinox", text: "text-cream" },
    { name: "silk-smoke", hex: "#252220", bg: "bg-silkSmoke", text: "text-cream" },
    { name: "heartthrob", hex: "#7A1E26", bg: "bg-heartthrob", text: "text-cream" },
    { name: "grey", hex: "#ECECEA", bg: "bg-grey", text: "text-ink" },
  ];

  const marketKeys: MarketKey[] = ["amazon", "flipkart", "meesho"];

  return (
    <div className="w-full">
      {/* Header Spacer Test Banner (Full bleed to y=0 so transparent header has contrast) */}
      <section className="bg-ink text-cream pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <Label tone="light">TEMPORARY ROUTE</Label>
          <h1 className="font-display text-4xl md:text-6xl">Design System Styleguide</h1>
          <p className="font-sans text-sm text-cream/70 max-w-2xl">
            This page verifies the colour tokens, typography, UI components, focus rings,
            the content data layer, outbound marketplace links, and header transitions.
          </p>
        </div>
      </section>

      {/* 1. Colour Tokens */}
      <Section bg="cream">
        <div className="flex flex-col gap-8">
          <div>
            <Tag>TOKENS</Tag>
            <h2 className="font-display text-3xl md:text-4xl text-ink mt-3">Palette & Variables</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {colorTokens.map((token) => (
              <div
                key={token.name}
                className="border border-ink/10 flex flex-col overflow-hidden shadow-xs"
              >
                <div className={`h-24 w-full ${token.bg} flex items-center justify-center`}>
                  <span className={`text-xs font-mono font-bold ${token.text}`}>{token.hex}</span>
                </div>
                <div className="p-3 bg-white">
                  <span className="font-sans font-semibold text-xs uppercase tracking-wider block text-ink">
                    {token.name}
                  </span>
                  <span className="font-mono text-[11px] text-ink/60">{token.hex}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 2. Typography Specimens */}
      <Section bg="grey">
        <div className="flex flex-col gap-10">
          <div>
            <Tag>TYPOGRAPHY</Tag>
            <h2 className="font-display text-3xl md:text-4xl text-ink mt-3">Fonts & Scale</h2>
          </div>

          <div className="flex flex-col gap-6 bg-white p-6 md:p-10 border border-ink/10">
            <div>
              <Label>Cormorant Garamond (Display & Quotes)</Label>
              <p className="font-display text-5xl md:text-7xl text-ink mt-2">
                Scent as Self-Belief
              </p>
              <p className="font-display italic text-2xl md:text-3xl text-rust mt-1">
                &ldquo;Top-class is a place you carry, not a place you&rsquo;re from.&rdquo;
              </p>
            </div>

            <div className="border-t border-ink/10 pt-6">
              <Label>Archivo (Body, Labels & Heavy Uppercase 800)</Label>
              <p className="font-sans font-extrabold text-2xl md:text-4xl uppercase tracking-tight text-ink mt-2">
                TRUE TOP-CLASS DOESN&rsquo;T NEED TO SHOUT.
              </p>
              <p className="font-sans text-base text-ink/80 mt-3 max-w-2xl leading-relaxed">
                Literally, &lsquo;Sirra&rsquo; means the edge, the very limit. Said about a person or a moment,
                it flips into something bigger: top-class, unmatched, touchable by no one.
              </p>
            </div>

            <div className="border-t border-ink/10 pt-6">
              <Label>Small Labels (Tracked-out uppercase, 11-12px, 0.2em)</Label>
              <div className="flex flex-wrap gap-6 mt-2">
                <Label>WHERE IT COMES FROM</Label>
                <Label>SCENT AS SELF-BELIEF</Label>
                <Label>PRODUCT COLLECTION · 50ML EAU DE PARFUM</Label>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 3. UI Component: Tag */}
      <Section bg="cream">
        <div className="flex flex-col gap-8">
          <div>
            <Tag>COMPONENTS</Tag>
            <h2 className="font-display text-3xl md:text-4xl text-ink mt-3">Tilted Label Tags (-3deg)</h2>
            <p className="font-sans text-xs text-ink/60 uppercase tracking-wider mt-1">
              Signature device: bold uppercase Archivo, cream text, rotated -3 degrees.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 p-8 bg-white border border-ink/10">
            <Tag color="rust">BRAND SNAPSHOT</Tag>
            <Tag color="wayfarer">01 · WAYFARER</Tag>
            <Tag color="equinox">02 · EQUINOX</Tag>
            <Tag color="silkSmoke">03 · SILK &amp; SMOKE</Tag>
            <Tag color="heartthrob">04 · HEARTTHROB</Tag>
            <Tag color="ink">THE BRAND MANTRA</Tag>
          </div>
        </div>
      </Section>

      {/* 4. UI Component: Wordmark */}
      <Section bg="ink">
        <div className="flex flex-col gap-8">
          <div>
            <Tag color="gold">BRANDING</Tag>
            <h2 className="font-display text-3xl md:text-4xl text-cream mt-3">Wordmark (SIRRA)</h2>
            <p className="font-sans text-xs text-cream/60 uppercase tracking-wider mt-1">
              Cormorant Garamond 500, uppercase, letter-spacing 0.5em, optically balanced.
            </p>
          </div>

          <div className="flex flex-col gap-6 items-center justify-center p-12 border border-cream/10 bg-black/30">
            <div className="flex flex-col items-center gap-2">
              <Label tone="light">Size: hero</Label>
              <Wordmark size="hero" className="text-cream" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Label tone="light">Size: xl</Label>
              <Wordmark size="xl" className="text-cream" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Label tone="light">Size: lg</Label>
              <Wordmark size="lg" className="text-cream" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Label tone="light">Size: base</Label>
              <Wordmark size="base" className="text-cream" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Label tone="light">Size: sm</Label>
              <Wordmark size="sm" className="text-cream" />
            </div>
          </div>
        </div>
      </Section>

      {/* 5. UI Component: Buttons */}
      <Section bg="cream">
        <div className="flex flex-col gap-8">
          <div>
            <Tag>INTERACTION</Tag>
            <h2 className="font-display text-3xl md:text-4xl text-ink mt-3">Button Variants</h2>
            <p className="font-sans text-xs text-ink/60 uppercase tracking-wider mt-1">
              Plain text action buttons, link-styled, visible gold focus ring on keyboard tab.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* On Cream */}
            <div className="p-6 bg-cream border border-ink/10 flex flex-col gap-4">
              <span className="font-sans text-xs uppercase tracking-wider text-ink/70">On Cream</span>
              <Button variant="dark">Buy on Amazon</Button>
              <Button variant="outline">Discover the collection</Button>
            </div>

            {/* On Grey */}
            <div className="p-6 bg-grey border border-ink/10 flex flex-col gap-4">
              <span className="font-sans text-xs uppercase tracking-wider text-ink/70">On Grey</span>
              <Button variant="dark">Buy on Flipkart</Button>
              <Button variant="outline">Where to buy</Button>
            </div>

            {/* On Ink */}
            <div className="p-6 bg-ink text-cream border border-cream/10 flex flex-col gap-4">
              <span className="font-sans text-xs uppercase tracking-wider text-cream/70">On Ink</span>
              <Button variant="light">Discover the collection</Button>
              <Button variant="outline" className="text-cream border-cream">
                Buy on Meesho
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* 6. Phase 2: Content Check & Outbound Links */}
      <Section bg="grey">
        <div className="flex flex-col gap-10">
          <div>
            <Tag>PHASE 2</Tag>
            <h2 className="font-display text-3xl md:text-4xl text-ink mt-3">Content & Marketplace Check</h2>
            <p className="font-sans text-xs text-ink/60 uppercase tracking-wider mt-1">
              Verifying typed markets, 4 products, verbatim copy rendering, and OutboundLink components.
            </p>
          </div>

          {/* Markets Status */}
          <div className="bg-white p-6 md:p-8 border border-ink/10 flex flex-col gap-4">
            <Label>MARKETS DATA LAYER STATUS</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {marketKeys.map((key) => {
                const market = MARKETS[key];
                return (
                  <div key={key} className="border border-ink/10 p-4 bg-cream/30 flex flex-col gap-1">
                    <span className="font-sans font-bold text-sm uppercase text-ink">{market.name}</span>
                    <span className="font-sans text-xs text-ink/70">{market.note}</span>
                    <span className="font-mono text-xs text-rust break-all mt-2">
                      Configured URL: {market.url}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4 Products with Outbound Links */}
          <div className="flex flex-col gap-6">
            <Label>THE 4 PRODUCTS (TYPED DATA &amp; OUTBOUND LINKS)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PRODUCTS.map((product) => (
                <div
                  key={product.slug}
                  id={product.slug}
                  className="bg-white border border-ink/10 p-6 md:p-8 flex flex-col justify-between gap-6"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <Tag color={product.color}>
                        {product.number} · {product.name}
                      </Tag>
                      <span className="font-mono text-xs text-ink/50 uppercase">{product.size}</span>
                    </div>

                    <h3 className="font-display italic text-2xl text-ink mt-2">{product.role}</h3>
                    <p className="font-sans text-sm text-ink/80 leading-relaxed">{product.summary}</p>

                    <div className="border-t border-ink/10 pt-3 flex flex-col gap-1">
                      <span className="font-sans text-xs uppercase tracking-wider text-ink/60">
                        Profile: <strong className="text-ink font-semibold">{product.profile}</strong>
                      </span>
                      <span className="font-sans text-xs text-ink/60">
                        Notes: {product.notes.join(" · ")}
                      </span>
                    </div>
                  </div>

                  {/* Outbound Links */}
                  <div className="border-t border-ink/10 pt-4 flex flex-wrap gap-2">
                    <OutboundLink
                      market="amazon"
                      product={product.slug}
                      className="px-3 py-2 bg-ink text-cream text-xs uppercase font-sans font-semibold tracking-wider hover:bg-rust"
                    >
                      Buy on Amazon
                    </OutboundLink>
                    <OutboundLink
                      market="flipkart"
                      product={product.slug}
                      className="px-3 py-2 border border-ink text-ink text-xs uppercase font-sans font-semibold tracking-wider hover:bg-ink hover:text-cream"
                    >
                      Buy on Flipkart
                    </OutboundLink>
                    <OutboundLink
                      market="meesho"
                      product={product.slug}
                      className="px-3 py-2 border border-ink/30 text-ink/70 text-xs uppercase font-sans font-semibold tracking-wider hover:border-ink hover:text-ink"
                    >
                      Buy on Meesho
                    </OutboundLink>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Copy Spot Checks */}
          <div className="bg-white p-6 md:p-8 border border-ink/10 flex flex-col gap-4">
            <Label>COPY VERBATIM RENDERING SPOT CHECKS</Label>
            <div className="flex flex-col gap-3 text-sm font-sans text-ink/80">
              <p>
                <strong>Hero Tagline:</strong> &ldquo;{COPY.hero.tagline}&rdquo;
              </p>
              <p>
                <strong>Snapshot Positioning:</strong> {COPY.snapshot.positioning}
              </p>
              <p>
                <strong>Range Story Headline:</strong> {COPY.rangeStory.beat5.headline}
              </p>
              <p>
                <strong>Brand Mantra:</strong> {COPY.mantra.statement}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 7. Section & Header Scroll Threshold Test Spacer */}
      <section className="bg-ink text-cream min-h-[140vh] flex flex-col items-center justify-start p-8 md:p-16 border-t-2 border-gold/30">
        <div className="sticky top-28 bg-black/80 backdrop-blur-md p-6 border border-gold/40 text-center max-w-lg mx-auto flex flex-col gap-3">
          <Tag color="gold">SCROLL THRESHOLD TEST</Tag>
          <p className="font-display text-2xl text-cream">Header Transition Inspector</p>
          <p className="font-sans text-xs text-cream/80">
            Scroll down past 80% of the viewport height (80vh). The header smoothly transitions from
            transparent with cream text to solid cream with ink text, a hairline border, and a compact wordmark.
          </p>
          <div className="mt-2 text-gold font-mono text-xs">
            Scroll distance threshold: ~80vh
          </div>
        </div>
      </section>
    </div>
  );
}
