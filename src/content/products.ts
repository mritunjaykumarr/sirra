import { MARKETS } from "./markets";
import { IMAGES, type ImageKey, type ImageData } from "./images";
import { type CopyStatus } from "./copy";

export type ProductSlug = "wayfarer" | "equinox" | "silk-smoke" | "heartthrob";
export type ProductColor = "wayfarer" | "equinox" | "silkSmoke" | "heartthrob";

export interface ProductLinks {
  amazon: string;
  flipkart: string;
  meesho: string;
}

export interface Product {
  slug: ProductSlug;
  sku: string;
  number: string;
  name: string;
  role: string;
  summary: string;
  oneLiner: string;
  quote: string;
  body: string;
  reachForIt: string;
  profile: string;
  notes: string[];
  families: string[];
  volume: string;
  concentration: string;
  size: string;
  color: ProductColor;
  image: ImageKey;
  packShot: ImageData;
  links: ProductLinks;
  status: CopyStatus;
  source: string;
}

export const PRODUCTS: Product[] = [
  {
    slug: "wayfarer",
    sku: "SIR-WAY-050",
    number: "01",
    name: "Wayfarer",
    role: "The Wanderer",
    summary:
      "Home is the feeling of self, not a place you're from. Belong everywhere because you never needed anyone to know you first.",
    oneLiner:
      "For locals-in-waiting, not tourists. You belong everywhere because you never needed anyone to know you first.",
    quote: "“Home is the feeling of self, not a place you're from.”",
    body: "For locals-in-waiting, not tourists. You belong everywhere because you never needed anyone to know you first.",
    reachForIt: "New cities, early flights, rooms where nobody knows your name yet.",
    profile: "Fresh · Aquatic · Mineral Woody",
    notes: ["Bergamot", "Sea Salt", "Juniper", "Driftwood", "Ambergris"],
    families: ["Fresh", "Woody"],
    volume: "50ml",
    concentration: "Eau de Parfum",
    size: "50ml Eau de Parfum",
    color: "wayfarer",
    image: "flex-wayfarer",
    packShot: IMAGES.packWayfarer,
    links: {
      amazon: MARKETS.amazon.url,
      flipkart: MARKETS.flipkart.url,
      meesho: MARKETS.meesho.url,
    },
    status: "approved-brand-book",
    source: "4. The Four Flexes & 5. The Collection",
  },
  {
    slug: "equinox",
    sku: "SIR-EQX-050",
    number: "02",
    name: "Equinox",
    role: "The Quiet Top",
    summary:
      "Some people climb ladders to look down. Others just soar. The confidence is in the humility.",
    oneLiner:
      "For people who stopped needing an audience long ago. The confidence is in the humility.",
    quote: "“Some people climb ladders to look down. Others just soar.”",
    body: "For people who stopped needing an audience long ago. The confidence is in the humility.",
    reachForIt: "The meeting where you say less and land more, or the morning that's just yours.",
    profile: "Refined Woody · Warm Amber · Cashmere",
    notes: ["Iris", "Smoked Lavender", "Cedarwood", "Mysore Sandalwood", "Skin Musk"],
    families: ["Woody", "Amber"],
    volume: "50ml",
    concentration: "Eau de Parfum",
    size: "50ml Eau de Parfum",
    color: "equinox",
    image: "flex-equinox",
    packShot: IMAGES.packEquinox,
    links: {
      amazon: MARKETS.amazon.url,
      flipkart: MARKETS.flipkart.url,
      meesho: MARKETS.meesho.url,
    },
    status: "approved-brand-book",
    source: "4. The Four Flexes & 5. The Collection",
  },
  {
    slug: "silk-smoke",
    sku: "SIR-SLK-050",
    number: "03",
    name: "Silk & Smoke",
    role: "The Bold Roots",
    summary:
      "Your roots aren't what you hide. They're what make you, you. Heritage worn loud.",
    oneLiner:
      "For those whose accent gets louder in rooms that expect them to shrink.",
    quote: "“Your roots aren't what you hide. They're what make you, you.”",
    body: "For those whose accent gets louder in rooms that expect them to shrink.",
    reachForIt: "Family tables, loud nights, any room that needs to hear your mother tongue.",
    profile: "Spicy · Smoky · Rich Leather",
    notes: ["Saffron", "Damask Rose", "Leather", "Smoked Oud", "Dark Vanilla"],
    families: ["Spicy", "Woody"],
    volume: "50ml",
    concentration: "Eau de Parfum",
    size: "50ml Eau de Parfum",
    color: "silkSmoke",
    image: "flex-silk-smoke",
    packShot: IMAGES.packSilkSmoke,
    links: {
      amazon: MARKETS.amazon.url,
      flipkart: MARKETS.flipkart.url,
      meesho: MARKETS.meesho.url,
    },
    status: "approved-brand-book",
    source: "4. The Four Flexes & 5. The Collection",
  },
  {
    slug: "heartthrob",
    sku: "SIR-HTB-050",
    number: "04",
    name: "Heartthrob",
    role: "The Open Heart",
    summary:
      "Feeling everything, fully. For the ones who love loudly and mean it.",
    oneLiner:
      "For the ones who love loudly and mean it. Protecting yourself isn't safe; it's fearful.",
    quote: "“Feeling everything, fully.”",
    body: "For the ones who love loudly and mean it. Protecting yourself isn't safe; it's fearful.",
    reachForIt: "First dates, last-minute flights, the \"I love you\" you said first.",
    profile: "Warm Amber · Luminous Floral · Gourmand",
    notes: ["Mandarin", "Honey", "Jasmine Blossom", "Golden Amber", "Whipped Vanilla"],
    families: ["Amber", "Floral", "Gourmand"],
    volume: "50ml",
    concentration: "Eau de Parfum",
    size: "50ml Eau de Parfum",
    color: "heartthrob",
    image: "flex-heartthrob",
    packShot: IMAGES.packHeartthrob,
    links: {
      amazon: MARKETS.amazon.url,
      flipkart: MARKETS.flipkart.url,
      meesho: MARKETS.meesho.url,
    },
    status: "approved-brand-book",
    source: "4. The Four Flexes & 5. The Collection",
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export const getProductBySlug = getProduct;

export function getAdjacentProducts(slug: string): { prev: Product; next: Product } {
  const index = PRODUCTS.findIndex((p) => p.slug === slug);
  const total = PRODUCTS.length;
  const safeIndex = index >= 0 ? index : 0;
  const prevIndex = (safeIndex - 1 + total) % total;
  const nextIndex = (safeIndex + 1) % total;

  return {
    prev: PRODUCTS[prevIndex],
    next: PRODUCTS[nextIndex],
  };
}

export interface ProductJsonLd {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description: string;
  image: string[];
  sku: string;
  brand: {
    "@type": "Brand";
    name: "SIRRA";
  };
  size: string;
}

export function getProductJsonLd(
  product: Product,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sirra.in"
): ProductJsonLd {
  const base = siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `SIRRA ${product.name}`,
    description: product.summary,
    image: [
      `${base}${product.packShot.src}`,
      `${base}${IMAGES[product.image].src}`,
    ],
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "SIRRA",
    },
    size: "50ml",
  };
}

export default PRODUCTS;
