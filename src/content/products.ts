import { MARKETS } from "./markets";
import { IMAGES, type ImageKey, type ImageData } from "./images";

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
}

export const PRODUCTS: Product[] = [
  {
    slug: "wayfarer",
    sku: "SIR-WAY-050",
    number: "01",
    name: "Wayfarer",
    role: "The Wanderer's Flex",
    summary:
      "Confidence through movement. Belonging everywhere because you never needed one fixed address to prove yourself.",
    oneLiner:
      "Confidence through movement. Belonging everywhere because you never needed one fixed address to prove yourself.",
    quote: "“Top-class is a place you carry, not a place you’re from.”",
    body: "Wayfarer is for the ones who treat every new city like a room they already own. Not tourists—locals-in-waiting. The flex isn't passport stamps; it's ease. You don't perform belonging—you just belong, wherever you land.",
    profile: "Fresh / Aquatic / Liberating Mineral Woody",
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
  },
  {
    slug: "equinox",
    sku: "SIR-EQX-050",
    number: "02",
    name: "Equinox",
    role: "The Quiet Top",
    summary:
      "Top-class that doesn't announce itself. Nothing to prove. You already know—that's the whole flex.",
    oneLiner:
      "Top-class that doesn't announce itself. Nothing to prove. You already know—that's the whole flex.",
    quote: "“Some people announce the top. Others just are it.”",
    body: "Equinox is worn by people who stopped needing an audience a long time ago. Nothing to prove, nothing to perform. The confidence is already settled. It’s walking into a room without checking who’s watching.",
    profile: "Refined Woody / Warm Amber / Cashmere",
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
  },
  {
    slug: "silk-smoke",
    sku: "SIR-SLK-050",
    number: "03",
    name: "Silk & Smoke",
    role: "The Bold Roots",
    summary:
      "Heritage worn loud. Your language, your block, your roots as the sharpest thing in the room.",
    oneLiner:
      "Heritage worn loud. Your language, your block, your roots as the sharpest thing in the room.",
    quote: "“Your roots aren’t what you soften. They’re what you lead with.”",
    body: "Silk & Smoke is for the ones whose accent gets louder in rooms that expect them to shrink. Your language, your city, your block—worn as the most self-assured thing about you. No translation needed. No apology attached.",
    profile: "Spicy / Smoky / Rich Leather",
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
  },
  {
    slug: "heartthrob",
    sku: "SIR-HTB-050",
    number: "04",
    name: "Heartthrob",
    role: "The Open Heart",
    summary:
      "Flex through feeling. Loving fully and showing up completely without apologizing for it.",
    oneLiner:
      "Flex through feeling. Loving fully and showing up completely without apologizing for it.",
    quote: "“Feeling everything, fully, is its own kind of top-class.”",
    body: "Heartthrob is for the ones who love loudly and mean it—who show up fully instead of playing it cool. The flex here isn't distance; it's devotion. Warm, unguarded, all-in.",
    profile: "Warm Amber / Luminous Floral / Gourmand",
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
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

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
  offers: {
    "@type": "AggregateOffer";
    offerCount: number;
    priceCurrency?: string;
    availability: "https://schema.org/InStock";
    offers: Array<{
      "@type": "Offer";
      name: string;
      url: string;
      availability: "https://schema.org/InStock";
    }>;
  };
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
    offers: {
      "@type": "AggregateOffer",
      offerCount: 3,
      availability: "https://schema.org/InStock",
      offers: [
        {
          "@type": "Offer",
          name: "Amazon",
          url: product.links.amazon,
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "Flipkart",
          url: product.links.flipkart,
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "Meesho",
          url: product.links.meesho,
          availability: "https://schema.org/InStock",
        },
      ],
    },
  };
}

export default PRODUCTS;
