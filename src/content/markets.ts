import logoManifest from "./logo-manifest.json";

export const SUPPORTED_LOGO_EXTENSIONS = [
  ".svg",
  ".png",
  ".webp",
  ".jpg",
  ".jpeg",
] as const;

export interface LogoMeta {
  src: string;
  width: number;
  height: number;
}

export type MarketKey = "amazon" | "flipkart" | "meesho";
export type LogoManifest = Record<MarketKey, LogoMeta | null>;

export const LOGO_MANIFEST: LogoManifest = logoManifest as LogoManifest;

export interface CropBox {
  cropX: number; // fraction 0 to 1
  cropY: number;
  cropW: number;
  cropH: number;
}

export interface Market {
  key: MarketKey;
  name: string;
  url: string;
  note: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
  hasLogo: boolean;
  heightScale: number;
  cropBox?: CropBox;
}

export function getMarketsData(): Record<MarketKey, Market> {
  const amazonMeta = LOGO_MANIFEST.amazon;
  const flipkartMeta = LOGO_MANIFEST.flipkart;
  const meeshoMeta = LOGO_MANIFEST.meesho;

  return {
    amazon: {
      key: "amazon",
      name: "Amazon",
      url: process.env.NEXT_PUBLIC_AMAZON_URL || "#",
      note: "Shop the full collection",
      logo: amazonMeta ? amazonMeta.src : "/logos/amazon.svg",
      logoWidth: amazonMeta ? amazonMeta.width : 603,
      logoHeight: amazonMeta ? amazonMeta.height : 182,
      hasLogo: amazonMeta !== null,
      heightScale: 0.95,
    },
    flipkart: {
      key: "flipkart",
      name: "Flipkart",
      url: process.env.NEXT_PUBLIC_FLIPKART_URL || "#",
      note: "Shop the full collection",
      logo: flipkartMeta ? flipkartMeta.src : "/logos/flipkart.svg",
      logoWidth: flipkartMeta ? flipkartMeta.width : 924,
      logoHeight: flipkartMeta ? flipkartMeta.height : 244,
      hasLogo: flipkartMeta !== null,
      heightScale: 0.92,
    },
    meesho: {
      key: "meesho",
      name: "Meesho",
      url: process.env.NEXT_PUBLIC_MESHO_URL || "#",
      note: "Shop the full collection",
      logo: meeshoMeta ? meeshoMeta.src : "/logos/meesho.png",
      logoWidth: meeshoMeta ? meeshoMeta.width : 1080,
      logoHeight: meeshoMeta ? meeshoMeta.height : 1080,
      hasLogo: meeshoMeta !== null,
      heightScale: 0.88,
    },
  };
}

export const MARKETS: Record<MarketKey, Market> = getMarketsData();

// Dev-only console warning listing marketplaces whose logo is null
if (process.env.NODE_ENV !== "production") {
  const nullLogos = (["amazon", "flipkart", "meesho"] as MarketKey[]).filter(
    (k) => LOGO_MANIFEST[k] === null
  );
  if (nullLogos.length > 0) {
    console.warn(
      `[SIRRA DEV WARNING] Logo is null in logo-manifest.json for: ${nullLogos.join(
        ", "
      )}. Text fallback will be rendered.`
    );
  }
}

export default MARKETS;
