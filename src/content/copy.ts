export type CopyStatus = "approved-brand-book" | "ui" | "needs-copy";

export interface CopyItem {
  text: string;
  status: CopyStatus;
  source: string;
}

export const COPY = {
  hero: {
    status: "approved-brand-book" as CopyStatus,
    source: "1. Landing Page - Hero",
    label: "FINE FRAGRANCE · 50ML EAU DE PARFUM",
    wordmark: "SIRRA.",
    headline: "You're already the peak.",
    subhead: "Sirra is a fragrance for people who don't need to become anyone.",
    tagline: "“You're already the peak.”",
    findYourSirra: "Find Your Sirra",
    readTheStory: "Read the Story",
    discoverCollection: "Find Your Sirra",
    baseline: "YOUR SIRRA.",
    oneLineStory: "Sirra (Punjabi): the absolute peak. We bottled it for those who already live there.",
    skimStrip: [
      {
        title: "One word.",
        desc: "Punjabi for the best there is.",
      },
      {
        title: "Four scents.",
        desc: "Four ways to be yourself.",
      },
      {
        title: "Zero masks.",
        desc: "Nothing added. Only what's already you.",
      },
    ],
    footerLine: "Eau de Parfum · 50ml · Four signatures",
  },
  rangeStory: {
    status: "approved-brand-book" as CopyStatus,
    source: "2. Brand Story: The Build-Up",
    chapter1: {
      tag: "CHAPTER 1: THE WORD",
      headline: "Some words don't translate. They land.",
      body: "In Punjabi, sirra is the edge, the very limit, the peak. Say it about a person and it means more: untouchable. Self-assured. Unapologetic.\n\nWe didn't invent it. We inherited it. And we won't water it down.",
    },
    chapter2: {
      tag: "CHAPTER 2: THE PROBLEM",
      headline: "Perfume keeps selling you a costume.",
      body: "Smell richer. Smell prettier. Smell mysterious. Every bottle asks you to become someone else.",
    },
    chapter3: {
      tag: "CHAPTER 3: THE TURN",
      headline: "Sirra does the opposite.",
      body: "It doesn't add a persona. It names what's already there.\n\nYou don't wear Sirra to become the top. You wear it because you already are.",
      action: "Meet who it's for",
      actionHref: "#scents",
    },
    // Backwards compatibility keys for legacy references
    beat1: {
      line1: "Some words don't translate. They land.",
      line2: "We didn't invent it. We inherited it. And we won't water it down.",
    },
    beat2: {
      line1: "Perfume keeps selling you a costume.",
      line2: "Every bottle asks you to become someone else.",
    },
    beat3: {
      text: "You don't wear Sirra to become the top. You wear it because you already are.",
    },
    beat5: {
      headline: "DIFFERENT FLEX. SAME TOP.",
      baseline: "Your Sirra.",
    },
  },
  about: {
    status: "approved-brand-book" as CopyStatus,
    source: "3. About Us",
    eyebrow: "WHO WE ARE",
    headline: "A fragrance house built on one word.",
    belief: {
      heading: "The belief",
      text: "Confidence isn't something you earn later. People who don't chase, attract. They don't postpone life until they \"deserve\" better. They choose the best for themselves, now.",
    },
    whoItsFor: {
      heading: "Four personas",
      subhead: "You’ll find yourself in one of these",
      personas: [
        {
          title: "The wanderer",
          text: "The wanderer who owns a new city before learning its language.",
          slug: "wayfarer",
        },
        {
          title: "The quiet one",
          text: "The quiet one whose stillness outweighs a room full of noise.",
          slug: "equinox",
        },
        {
          title: "The rooted one",
          text: "The rooted one whose accent, city and block are the loudest flex in the room.",
          slug: "silk-smoke",
        },
        {
          title: "The open one",
          text: "The open one who loves fully and never apologizes for how much.",
          slug: "heartthrob",
        },
      ],
      closing: "Different lives. Same confidence.",
    },
    values: {
      heading: "What we stand for",
      pillars: [
        {
          title: "Rooted",
          desc: "Where you're from is your strength, not your footnote.",
        },
        {
          title: "Refined",
          desc: "Quiet craft over loud claims.",
        },
        {
          title: "Unmatched",
          desc: "Not better than anyone. Just entirely, unmistakably you.",
        },
      ],
    },
    promise: {
      heading: "Our promise",
      text: "We'll never ask you to become someone new. We'll only ask you to stop underselling who you already are: in your language, on your terms, from wherever you're from.",
    },
    handoff: {
      text: "No single face represents Sirra. Four scents do the talking.",
      action: "Meet the four",
      href: "/#scents",
    },
  },
  fourFlexes: {
    status: "approved-brand-book" as CopyStatus,
    source: "4. The Four Personas: Personality & Use Case",
    eyebrow: "FOUR PERSONAS",
    headline: "You’ll find yourself in one of these",
    subhead: "Every SIRRA scent is a different route to the same place: your own top-class. None outranks another.",
  },
  personaArchitecture: {
    heading: "FOUR PERSONAS",
    intro: "You’ll find yourself in one of these",
    subhead: "Every SIRRA scent is a different route to the same place: your own top-class. None outranks another.",
  },
  collection: {
    status: "approved-brand-book" as CopyStatus,
    source: "5. The Collection",
    eyebrow: "EAU DE PARFUM · 50ML",
    headline: "Know what you're wearing.",
    subhead: "Every note, listed openly. Nothing hidden behind the mystique.",
    buttonAction: "Make It Yours",
    trustStrip: [
      {
        text: "Not sure which one? Take the 30-second finder",
        href: "#scents",
      },
      {
        text: "Authentic & Certified 50ml Eau de Parfum",
        href: "#availability",
      },
      {
        text: "Available on Amazon, Flipkart & Meesho",
        href: "#availability",
      },
    ],
  },
  mantra: {
    status: "approved-brand-book" as CopyStatus,
    source: "6. Brand Story: The Conclusion",
    eyebrow: "THE MANTRA",
    tag: "THE BRAND MANTRA",
    statement: "WE DON’T HAND YOU A PERSONA. WE HAND YOU THE WORD FOR WHAT YOU ALREADY ARE.",
    headline: "We don't hand you a persona.\nWe hand you the word for what you already are.",
    italicLines: "The best, as you are. Wear it. Own it.",
    action: "Find Your Sirra",
    signoff: "The best version of you. Your Sirra.",
    baseline: "YOUR SIRRA.",
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
  closing: {
    status: "approved-brand-book" as CopyStatus,
    source: "Closing",
    wordmark: "SIRRA.",
    signoff: "The best version of you. Your Sirra.",
    tagline: "“You're already the peak.”",
    baseline: "YOUR SIRRA.",
  },
  ui: {
    status: "ui" as CopyStatus,
    source: "Interface",
    availableOn: "AVAILABLE ON",
    discoverCollection: "Find Your Sirra",
    theCollection: "THE COLLECTION",
    profile: "PROFILE",
    notes: "NOTES",
    reachForIt: "REACH FOR IT",
    whereToBuy: "Where to buy",
    aboutUs: "About Us",
    close: "Close",
    search: "Search",
    menu: "Menu",
  },
} as const;

export default COPY;
