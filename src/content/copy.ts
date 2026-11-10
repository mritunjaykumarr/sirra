export type CopyStatus = "approved-brand-book" | "ui" | "needs-copy";

export interface CopyItem {
  text: string;
  status: CopyStatus;
  source: string;
}

export const COPY = {
  hero: {
    status: "approved-brand-book" as CopyStatus,
    source: "Hero",
    label: "FINE FRAGRANCE · 50ML EAU DE PARFUM",
    wordmark: "SIRRA.",
    tagline: "“Chase your top-class self.”",
    baseline: "YOUR SIRRA.",
  },
  rangeStory: {
    status: "approved-brand-book" as CopyStatus,
    source: "The Manifesto & Persona Architecture",
    beat1: {
      line1: "SIRRA means the top.",
      line2: "So we stopped explaining ourselves and started living it.",
      status: "approved-brand-book" as CopyStatus,
      source: "The Manifesto",
    },
    beat2: {
      line1: "Sirra isn’t a soft word.",
      line2: "It means the peak. No competition.",
      status: "approved-brand-book" as CopyStatus,
      source: "The Manifesto",
    },
    beat3: {
      text: "It’s what you call someone who walked into a room and the room simply agreed.",
      status: "approved-brand-book" as CopyStatus,
      source: "The Manifesto",
    },
    beat5: {
      headline: "DIFFERENT FLEX. SAME TOP.",
      baseline: "Your Sirra.",
      status: "approved-brand-book" as CopyStatus,
      source: "The Manifesto",
    },
  },
  snapshot: {
    status: "approved-brand-book" as CopyStatus,
    source: "Brand Snapshot",
    tag: "BRAND SNAPSHOT",
    category: "Fine Fragrance / Eau de Parfum (50ml)",
    coreIdea: "Scent as Self-Belief",
    positioning: "Top-class flex meets quiet confidence.",
    baseline: "Your Sirra.",
  },
  name: {
    status: "approved-brand-book" as CopyStatus,
    source: "The Name",
    tag: "THE NAME",
    label: "WHERE IT COMES FROM",
    headline: "SIRRA.",
    sub: "Punjabi for the absolute peak. The best there is.",
    definition:
      "Literally, 'Sirra' means the edge, the very limit. Said about a person or a moment, it flips into something bigger: top-class, unmatched, touchable by no one.",
    goldLines: "We didn't invent the word. We inherited it. And we refuse to water it down.",
    stoneEngraved: "ROOTED, REFINED, UNMATCHED",
  },
  flex: {
    status: "approved-brand-book" as CopyStatus,
    source: "The Flex: Loud vs. Quiet",
    tag: "THE FLEX: LOUD VS. QUIET",
    paragraphs: [
      "People think 'flex' has to be loud—status symbols, swagger, making noise. That is amateur flex.",
      "True top-class doesn't need to shout. When you are truly at the peak, you walk into the room and the room simply agreed.",
      "That is where simplicity meets swagger: Quiet Luxury with cultural backbone.",
    ],
    pullStatement: "TRUE TOP-CLASS DOESN'T NEED TO SHOUT.",
  },
  truth: {
    status: "approved-brand-book" as CopyStatus,
    source: "The Sirra Truth",
    tag: "THE SIRRA TRUTH:",
    bullets: [
      "Most fragrance brands ask you to spray on a mask—to smell prettier, richer, or more mysterious.",
      "SIRRA doesn't add a persona on top of you. It names what is already there.",
    ],
    statement: "YOU DON'T WEAR SIRRA TO BECOME THE TOP. YOU WEAR IT BECAUSE YOU ALREADY ARE.",
  },
  positioning: {
    status: "approved-brand-book" as CopyStatus,
    source: "Brand Positioning",
    tag: "BRAND POSITIONING",
    masterStatement: "Your Sirra. Not one persona. Your own definition of the top.",
    theShift: "From fragrance as a costume → to fragrance as radical self-belief.",
    pillars: [
      {
        pillar: "What it is",
        text: "A fragrance house built on a single word for the best there is. Reframed as permission, not comparison.",
      },
      {
        pillar: "Who it's for",
        text: "Anyone chasing their own peak. The wanderer, the quiet one, the loud one, the romantic. No single face represents SIRRA, because no single flex does.",
      },
      {
        pillar: "What it promises",
        text: "SIRRA doesn't ask you to become someone new. It asks you to stop underselling who you already are—in your language, on your terms, from wherever you're from.",
      },
    ],
  },
  personaArchitecture: {
    status: "approved-brand-book" as CopyStatus,
    source: "Persona Architecture",
    heading: "ONE IDEA · FOUR FLEXES",
    intro:
      "Every SIRRA scent is a different route to the same place: your own top-class. None outranks another. Quiet and loud are equally 'Sirra'.",
  },
  mantra: {
    status: "approved-brand-book" as CopyStatus,
    source: "The Brand Mantra",
    tag: "THE BRAND MANTRA",
    label: "FINAL COPY",
    statement: "WE DON’T HAND YOU A PERSONA. WE HAND YOU THE WORD FOR WHAT YOU ALREADY ARE.",
    italicLines: "Top-class, as you are. Chase it. Reach it. Wear it.",
    baseline: "YOUR SIRRA.",
  },
  closing: {
    status: "approved-brand-book" as CopyStatus,
    source: "Closing",
    wordmark: "SIRRA.",
    tagline: "“Chase your top-class self.”",
    baseline: "YOUR SIRRA.",
  },
  ui: {
    status: "ui" as CopyStatus,
    source: "Interface",
    availableOn: "AVAILABLE ON",
    discoverCollection: "Discover the collection",
    theCollection: "THE COLLECTION",
    profile: "PROFILE",
    notes: "NOTES",
    whereToBuy: "Where to buy",
    close: "Close",
    search: "Search",
    menu: "Menu",
  },
} as const;

export default COPY;
