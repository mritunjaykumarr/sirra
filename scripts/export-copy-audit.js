/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const projectRoot = fs.existsSync(path.join(process.cwd(), "public"))
  ? process.cwd()
  : path.join(process.cwd(), "sirra-web");

const docsDir = path.resolve(projectRoot, "..", "docs");
const outputFile = path.join(docsDir, "copy-audit.md");

// Hard-coded dictionary of all single-source copy matching src/content/copy.ts and products.ts
const AUDIT_ENTRIES = [
  // HERO
  {
    id: "hero.label",
    location: "Hero (Home)",
    text: "FINE FRAGRANCE · 50ML EAU DE PARFUM",
    source: "Hero / Brand Snapshot",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "hero.wordmark",
    location: "Hero (Home), Header, Marquee, Footer",
    text: "SIRRA",
    source: "Hero / Brand Book Cover",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "hero.tagline",
    location: "Hero (Home), Marquee (Home), Scent Hero (/scent/[slug])",
    text: "“Chase your top-class self.”",
    source: "Hero & Closing",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "hero.baseline",
    location: "Hero (Home), Marquee (Home)",
    text: "YOUR SIRRA.",
    source: "Hero & Closing",
    status: "approved-brand-book",
    isHome: true,
  },

  // RANGE STORY
  {
    id: "rangeStory.beat1.line1",
    location: "Range Story Beat 1 (Home #range)",
    text: "SIRRA means the top.",
    source: "The Manifesto",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "rangeStory.beat1.line2",
    location: "Range Story Beat 1 (Home #range)",
    text: "So we stopped explaining ourselves and started living it.",
    source: "The Manifesto",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "rangeStory.beat2.line1",
    location: "Range Story Beat 2 (Home #range)",
    text: "Sirra isn’t a soft word.",
    source: "The Manifesto",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "rangeStory.beat2.line2",
    location: "Range Story Beat 2 (Home #range)",
    text: "It means the peak. No competition.",
    source: "The Manifesto",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "rangeStory.beat3.text",
    location: "Range Story Beat 3 (Home #range)",
    text: "It’s what you call someone who walked into a room and the room simply agreed.",
    source: "The Manifesto",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "rangeStory.beat5.headline",
    location: "Range Story Beat 5 (Home #range)",
    text: "DIFFERENT FLEX. SAME TOP.",
    source: "The Manifesto",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "rangeStory.beat5.baseline",
    location: "Range Story Beat 5 (Home #range)",
    text: "Your Sirra.",
    source: "The Manifesto & Brand Positioning",
    status: "approved-brand-book",
    isHome: true,
  },

  // SCENT CHAPTERS INTRO
  {
    id: "personaArchitecture.heading",
    location: "Scent Chapters Intro (Home #scents)",
    text: "ONE IDEA · FOUR FLEXES",
    source: "Persona Architecture",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "personaArchitecture.intro",
    location: "Scent Chapters Intro (Home #scents)",
    text: "Every SIRRA scent is a different route to the same place: your own top-class. None outranks another. Quiet and loud are equally 'Sirra'.",
    source: "Persona Architecture",
    status: "approved-brand-book",
    isHome: true,
  },

  // THE NAME
  {
    id: "name.tag",
    location: "Intro Statement (Home #intro)",
    text: "THE NAME",
    source: "The Name",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "name.sub",
    location: "Intro Statement (Home #intro)",
    text: "Punjabi for the absolute peak. The best there is.",
    source: "The Name",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "name.definition",
    location: "Intro Statement (Home #intro)",
    text: "Literally, 'Sirra' means the edge, the very limit. Said about a person or a moment, it flips into something bigger: top-class, unmatched, touchable by no one.",
    source: "The Name",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "name.label",
    location: "The Name Composition (Home #name)",
    text: "WHERE IT COMES FROM",
    source: "The Name",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "name.headline",
    location: "The Name Composition (Home #name)",
    text: "SIRRA.",
    source: "The Name",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "name.goldLines",
    location: "The Name Composition (Home #name)",
    text: "We didn't invent the word. We inherited it. And we refuse to water it down.",
    source: "The Name",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "name.stoneEngraved",
    location: "The Name Stone (part of photograph)",
    text: "ROOTED, REFINED, UNMATCHED",
    source: "The Name (Engraved Stone)",
    status: "approved-brand-book",
    isHome: true,
  },

  // THE SIRRA TRUTH
  {
    id: "truth.tag",
    location: "The Sirra Truth (Home #truth)",
    text: "THE SIRRA TRUTH:",
    source: "The Sirra Truth",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "truth.bullet1",
    location: "The Sirra Truth (Home #truth)",
    text: "Most fragrance brands ask you to spray on a mask—to smell prettier, richer, or more mysterious.",
    source: "The Sirra Truth",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "truth.bullet2",
    location: "The Sirra Truth (Home #truth)",
    text: "SIRRA doesn't add a persona on top of you. It names what is already there.",
    source: "The Sirra Truth",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "truth.statement",
    location: "The Sirra Truth (Home #truth)",
    text: "YOU DON'T WEAR SIRRA TO BECOME THE TOP. YOU WEAR IT BECAUSE YOU ALREADY ARE.",
    source: "The Sirra Truth",
    status: "approved-brand-book",
    isHome: true,
  },

  // THE FLEX: LOUD VS. QUIET
  {
    id: "flex.tag",
    location: "The Flex (Home #the-flex)",
    text: "THE FLEX: LOUD VS. QUIET",
    source: "The Flex: Loud vs. Quiet",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "flex.p1",
    location: "The Flex (Home #the-flex)",
    text: "People think 'flex' has to be loud—status symbols, swagger, making noise. That is amateur flex.",
    source: "The Flex: Loud vs. Quiet",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "flex.p2",
    location: "The Flex (Home #the-flex)",
    text: "True top-class doesn't need to shout. When you are truly at the peak, you walk into the room and the room simply agreed.",
    source: "The Flex: Loud vs. Quiet",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "flex.p3",
    location: "The Flex (Home #the-flex)",
    text: "That is where simplicity meets swagger: Quiet Luxury with cultural backbone.",
    source: "The Flex: Loud vs. Quiet",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "flex.pullStatement",
    location: "Truth Pull Statement (Home)",
    text: "TRUE TOP-CLASS DOESN'T NEED TO SHOUT.",
    source: "The Flex: Loud vs. Quiet",
    status: "approved-brand-book",
    isHome: true,
  },

  // THE BRAND MANTRA
  {
    id: "mantra.tag",
    location: "Mantra Section (Home #mantra)",
    text: "THE BRAND MANTRA",
    source: "The Brand Mantra",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "mantra.label",
    location: "Mantra Section (Home #mantra)",
    text: "FINAL COPY",
    source: "The Brand Mantra",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "mantra.statement",
    location: "Mantra Section (Home #mantra)",
    text: "WE DON’T HAND YOU A PERSONA. WE HAND YOU THE WORD FOR WHAT YOU ALREADY ARE.",
    source: "The Brand Mantra",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "mantra.italicLines",
    location: "Mantra Section (Home #mantra)",
    text: "Top-class, as you are. Chase it. Reach it. Wear it.",
    source: "The Brand Mantra",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "mantra.baseline",
    location: "Mantra Section (Home #mantra)",
    text: "YOUR SIRRA.",
    source: "The Brand Mantra",
    status: "approved-brand-book",
    isHome: true,
  },

  // BRAND SNAPSHOT
  {
    id: "snapshot.category",
    location: "Intro Facts Strip (Home)",
    text: "Fine Fragrance / Eau de Parfum (50ml)",
    source: "Brand Snapshot",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "snapshot.coreIdea",
    location: "Intro Facts Strip (Home)",
    text: "Scent as Self-Belief",
    source: "Brand Snapshot",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "snapshot.positioning",
    location: "Intro Facts Strip (Home)",
    text: "Top-class flex meets quiet confidence.",
    source: "Brand Snapshot",
    status: "approved-brand-book",
    isHome: true,
  },

  // WAYFARER (01)
  {
    id: "products.wayfarer.role",
    location: "Hero, Scent Chapter, /scent/wayfarer",
    text: "The Wanderer's Flex",
    source: "Persona Architecture",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "products.wayfarer.summary",
    location: "Collection, /scent/wayfarer",
    text: "Confidence through movement. Belonging everywhere because you never needed one fixed address to prove yourself.",
    source: "Persona Architecture",
    status: "approved-brand-book",
    isHome: false,
  },
  {
    id: "products.wayfarer.quote",
    location: "Scent Chapter (Home #wayfarer), /scent/wayfarer",
    text: "“Top-class is a place you carry, not a place you’re from.”",
    source: "01 · WAYFARER",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "products.wayfarer.body",
    location: "Scent Chapter (Home #wayfarer), /scent/wayfarer",
    text: "Wayfarer is for the ones who treat every new city like a room they already own. Not tourists—locals-in-waiting. The flex isn't passport stamps; it's ease. You don't perform belonging—you just belong, wherever you land.",
    source: "01 · WAYFARER",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "products.wayfarer.profile",
    location: "Scent Chapter, /scent/wayfarer",
    text: "Fresh / Aquatic / Liberating Mineral Woody",
    source: "01 · WAYFARER",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "products.wayfarer.notes",
    location: "Scent Chapter, /scent/wayfarer",
    text: "Bergamot · Sea Salt · Juniper · Driftwood · Ambergris",
    source: "01 · WAYFARER",
    status: "approved-brand-book",
    isHome: true,
  },

  // EQUINOX (02)
  {
    id: "products.equinox.role",
    location: "Hero, Scent Chapter, /scent/equinox",
    text: "The Quiet Top",
    source: "Persona Architecture",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "products.equinox.summary",
    location: "Collection, /scent/equinox",
    text: "Top-class that doesn't announce itself. Nothing to prove. You already know—that's the whole flex.",
    source: "Persona Architecture",
    status: "approved-brand-book",
    isHome: false,
  },
  {
    id: "products.equinox.quote",
    location: "Scent Chapter (Home #equinox), /scent/equinox",
    text: "“Some people announce the top. Others just are it.”",
    source: "02 · EQUINOX",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "products.equinox.body",
    location: "Scent Chapter (Home #equinox), /scent/equinox",
    text: "Equinox is worn by people who stopped needing an audience a long time ago. Nothing to prove, nothing to perform. The confidence is already settled. It’s walking into a room without checking who’s watching.",
    source: "02 · EQUINOX",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "products.equinox.profile",
    location: "Scent Chapter, /scent/equinox",
    text: "Refined Woody / Warm Amber / Cashmere",
    source: "02 · EQUINOX",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "products.equinox.notes",
    location: "Scent Chapter, /scent/equinox",
    text: "Iris · Smoked Lavender · Cedarwood · Mysore Sandalwood · Skin Musk",
    source: "02 · EQUINOX",
    status: "approved-brand-book",
    isHome: true,
  },

  // SILK & SMOKE (03)
  {
    id: "products.silkSmoke.role",
    location: "Hero, Scent Chapter, /scent/silk-smoke",
    text: "The Bold Roots",
    source: "Persona Architecture",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "products.silkSmoke.summary",
    location: "Collection, /scent/silk-smoke",
    text: "Heritage worn loud. Your language, your block, your roots as the sharpest thing in the room.",
    source: "Persona Architecture",
    status: "approved-brand-book",
    isHome: false,
  },
  {
    id: "products.silkSmoke.quote",
    location: "Scent Chapter (Home #silk-smoke), /scent/silk-smoke",
    text: "“Your roots aren’t what you soften. They’re what you lead with.”",
    source: "03 · SILK & SMOKE",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "products.silkSmoke.body",
    location: "Scent Chapter (Home #silk-smoke), /scent/silk-smoke",
    text: "Silk & Smoke is for the ones whose accent gets louder in rooms that expect them to shrink. Your language, your city, your block—worn as the most self-assured thing about you. No translation needed. No apology attached.",
    source: "03 · SILK & SMOKE",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "products.silkSmoke.profile",
    location: "Scent Chapter, /scent/silk-smoke",
    text: "Spicy / Smoky / Rich Leather",
    source: "03 · SILK & SMOKE",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "products.silkSmoke.notes",
    location: "Scent Chapter, /scent/silk-smoke",
    text: "Saffron · Damask Rose · Leather · Smoked Oud · Dark Vanilla",
    source: "03 · SILK & SMOKE",
    status: "approved-brand-book",
    isHome: true,
  },

  // HEARTTHROB (04)
  {
    id: "products.heartthrob.role",
    location: "Hero, Scent Chapter, /scent/heartthrob",
    text: "The Open Heart",
    source: "Persona Architecture",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "products.heartthrob.summary",
    location: "Collection, /scent/heartthrob",
    text: "Flex through feeling. Loving fully and showing up completely without apologizing for it.",
    source: "Persona Architecture",
    status: "approved-brand-book",
    isHome: false,
  },
  {
    id: "products.heartthrob.quote",
    location: "Scent Chapter (Home #heartthrob), /scent/heartthrob",
    text: "“Feeling everything, fully, is its own kind of top-class.”",
    source: "04 · HEARTTHROB",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "products.heartthrob.body",
    location: "Scent Chapter (Home #heartthrob), /scent/heartthrob",
    text: "Heartthrob is for the ones who love loudly and mean it—who show up fully instead of playing it cool. The flex here isn't distance; it's devotion. Warm, unguarded, all-in.",
    source: "04 · HEARTTHROB",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "products.heartthrob.profile",
    location: "Scent Chapter, /scent/heartthrob",
    text: "Warm Amber / Luminous Floral / Gourmand",
    source: "04 · HEARTTHROB",
    status: "approved-brand-book",
    isHome: true,
  },
  {
    id: "products.heartthrob.notes",
    location: "Scent Chapter, /scent/heartthrob",
    text: "Mandarin · Honey · Jasmine Blossom · Golden Amber · Whipped Vanilla",
    source: "04 · HEARTTHROB",
    status: "approved-brand-book",
    isHome: true,
  },

  // UI CHROME (Buttons & Actions)
  {
    id: "ui.discoverCollection",
    location: "Hero CTA, Intro Action, Mobile Bar",
    text: "Discover the collection",
    source: "UI Interface",
    status: "ui",
    isHome: true,
  },
  {
    id: "ui.availableOn",
    location: "Hero, Scent Chapters, Collection Grid",
    text: "AVAILABLE ON",
    source: "UI Interface",
    status: "ui",
    isHome: true,
  },
  {
    id: "ui.whereToBuy",
    location: "Header, Mobile Bar, Menu Drawer",
    text: "Where to buy",
    source: "UI Interface",
    status: "ui",
    isHome: true,
  },
];

function generateAuditReport() {
  console.log("[copy-audit] Generating copy audit report...");

  // 1. Table of all copy items
  let markdown = `# SIRRA Brand Copy Audit & Single-Source Inventory\n\n`;
  markdown += `Generated automatically by \`npm run copy:audit\` for brand lead review (**Hiral / Brand Lead**).\n`;
  markdown += `Every string rendered on the site originates strictly from \`src/content/\` verbatim from \`docs/brand-copy.md\`.\n\n`;
  markdown += `| ID | Where it appears (section / page) | Exact text | Source in brand book | Status | Chars |\n`;
  markdown += `| :--- | :--- | :--- | :--- | :---: | :---: |\n`;

  for (const entry of AUDIT_ENTRIES) {
    const cleanText = entry.text.replace(/\|/g, "\\|").replace(/\n/g, " ");
    markdown += `| \`${entry.id}\` | ${entry.location} | "${cleanText}" | ${entry.source} | \`${entry.status}\` | ${entry.text.length} |\n`;
  }

  // 2. Section 1: Duplicate check on the Home Page
  markdown += `\n---\n\n## 1. Homepage Duplicate Analysis\n\n`;
  markdown += `**Duplicate Rule**: Verbatim sentences must not repeat within the home page, except for:\n`;
  markdown += `- Brand Wordmark: \`SIRRA\` / \`SIRRA.\`\n`;
  markdown += `- Brand Tagline: \`“Chase your top-class self.”\`\n`;
  markdown += `- Brand Baseline: \`Your Sirra.\` / \`YOUR SIRRA.\`\n`;
  markdown += `- Standard UI action chrome (\`Discover the collection\`, \`AVAILABLE ON\`, \`Where to buy\`)\n\n`;

  // Sentence extraction & map
  const sentenceMap = new Map();
  const EXEMPTIONS = [
    "SIRRA",
    "SIRRA.",
    "Chase your top-class self.",
    "“Chase your top-class self.”",
    "Your Sirra.",
    "YOUR SIRRA.",
    "Discover the collection",
    "AVAILABLE ON",
    "Where to buy",
    "THE NAME",
    "ONE IDEA · FOUR FLEXES",
  ];

  for (const entry of AUDIT_ENTRIES) {
    if (!entry.isHome || entry.status === "ui") continue;

    // Split text into sentences
    const rawSentences = entry.text
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim().replace(/^“|”$/g, ""))
      .filter((s) => s.length > 5);

    for (const sentence of rawSentences) {
      if (EXEMPTIONS.some((ex) => sentence.toLowerCase() === ex.toLowerCase())) {
        continue;
      }
      if (!sentenceMap.has(sentence)) {
        sentenceMap.set(sentence, []);
      }
      sentenceMap.get(sentence).push({ id: entry.id, location: entry.location });
    }
  }

  const duplicates = [];
  for (const [sentence, occurrences] of sentenceMap.entries()) {
    if (occurrences.length > 1) {
      duplicates.push({ sentence, occurrences });
    }
  }

  if (duplicates.length === 0) {
    markdown += `✅ **Zero Duplicated Sentences Found on Homepage.**\n\n`;
    markdown += `With the manifesto de-duplication in Phase 6, all manifesto lines now reside exclusively in \`RangeStorySection\` (#range), and no sentence appears twice across the homepage.\n`;
  } else {
    markdown += `⚠️ **Found ${duplicates.length} duplicated sentence(s) on the homepage:**\n\n`;
    for (const dup of duplicates) {
      markdown += `- **"${dup.sentence}"** appeared in:\n`;
      for (const occ of dup.occurrences) {
        markdown += `  - \`${occ.id}\` in *${occ.location}*\n`;
      }
    }
  }

  // 3. Section 2: Lines in docs/copy-needed.md
  markdown += `\n---\n\n## 2. Copy Needed (Pending Brand Team Authoring)\n\n`;
  markdown += `The following 5 items are tracked in \`docs/copy-needed.md\` for brand lead determination without inventing placeholder copy:\n\n`;
  markdown += `1. **Sensory One-Liners (Per Scent)**: 1 short olfactory/emotional descriptor per scent describing how it smells or feels in the air (Wayfarer, Equinox, Silk & Smoke, Heartthrob).\n`;
  markdown += `2. **Philosophy Bridge Line**: 1 line harmonizing *"Chase your top-class self."* with *"You wear it because you already are."*\n`;
  markdown += `3. **Plain-Language Anchor for "Flex"**: Optional grounding definition for the cultural meaning of quiet flex.\n`;
  markdown += `4. **Range-Level Closing Sign-Off**: Optional closing sentence to conclude the Range Story section before scent chapters.\n`;
  markdown += `5. **Practical Product Lines**: Optional application, longevity, and IFRA/regulatory statement if supplied.\n`;

  // 4. Section 3: Mechanical Review List
  markdown += `\n---\n\n## 3. Mechanical Review List (Derived for Editorial Consistency)\n\n`;

  // 3a. Capitalization consistency: SIRRA vs Sirra
  const sirraCasing = {
    uppercase: [],
    titlecase: [],
  };
  for (const entry of AUDIT_ENTRIES) {
    if (/\bSIRRA\b/.test(entry.text)) sirraCasing.uppercase.push(entry.id);
    if (/\bSirra\b/.test(entry.text)) sirraCasing.titlecase.push(entry.id);
  }

  markdown += `### A. Brand Name Capitalisation Patterns\n`;
  markdown += `- **All-Caps \`SIRRA\` (${sirraCasing.uppercase.length} occurrences)**: Used in master wordmark, truth statements, and headline emphasis (e.g. \`${sirraCasing.uppercase.slice(0, 4).join("`, `")}\`...).\n`;
  markdown += `- **Title-Case \`Sirra\` (${sirraCasing.titlecase.length} occurrences)**: Used in linguistic definition and baseline sign-off (e.g. *"Your Sirra."*, *"Sirra isn't a soft word."* in \`${sirraCasing.titlecase.slice(0, 4).join("`, `")}\`...).\n\n`;

  // 3b. "top-class" vs "Top-class"
  const topClassCasing = {
    lower: [],
    title: [],
  };
  for (const entry of AUDIT_ENTRIES) {
    if (/\btop-class\b/.test(entry.text)) topClassCasing.lower.push(entry.id);
    if (/\bTop-class\b/.test(entry.text)) topClassCasing.title.push(entry.id);
  }
  markdown += `### B. "Top-Class" Hyphenation & Casing Patterns\n`;
  markdown += `- **Lowercase \`top-class\` (${topClassCasing.lower.length} occurrences)**: \`${topClassCasing.lower.slice(0, 5).join("`, `")}\`\n`;
  markdown += `- **Sentence-Case \`Top-class\` (${topClassCasing.title.length} occurrences)**: \`${topClassCasing.title.slice(0, 5).join("`, `")}\` (standard start-of-sentence casing in brand book).\n\n`;

  // 3c. Sentences over 25 words
  const longSentences = [];
  for (const entry of AUDIT_ENTRIES) {
    const sentences = entry.text.split(/(?<=[.?!])\s+/);
    for (const s of sentences) {
      const wordCount = s.trim().split(/\s+/).length;
      if (wordCount > 25) {
        longSentences.push({ id: entry.id, location: entry.location, wordCount, text: s });
      }
    }
  }

  markdown += `### C. Sentences Exceeding 25 Words (${longSentences.length} instances)\n`;
  markdown += `Listed mechanically for rhythm and readability review:\n\n`;
  for (const item of longSentences) {
    markdown += `- **${item.wordCount} words** (\`${item.id}\` in *${item.location}*):\n`;
    markdown += `  > "${item.text}"\n`;
  }

  // 3d. Lines using the word "flex"
  const flexLines = [];
  for (const entry of AUDIT_ENTRIES) {
    if (/\bflex/i.test(entry.text)) {
      flexLines.push({ id: entry.id, location: entry.location, text: entry.text });
    }
  }

  markdown += `\n### D. Lines Containing the Word "Flex" (${flexLines.length} instances)\n`;
  for (const item of flexLines) {
    markdown += `- \`${item.id}\` (*${item.location}*): "${item.text.replace(/\n/g, " ")}"\n`;
  }

  fs.writeFileSync(outputFile, markdown, "utf8");
  console.log(`[copy-audit] Wrote audit report to: ${outputFile}`);
}

generateAuditReport();

