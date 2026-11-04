import { MarketKey, MARKETS, LOGO_MANIFEST } from "@/content/markets";

/**
 * Helper to inspect whether marketplace logo assets exist in public/logos/.
 * Backed by prebuild/predev logo-manifest.json.
 */
export function checkLogoExists(key: MarketKey): boolean {
  return LOGO_MANIFEST[key] !== null;
}

export function getLogoAvailability(): Record<MarketKey, boolean> {
  return {
    amazon: checkLogoExists("amazon"),
    flipkart: checkLogoExists("flipkart"),
    meesho: checkLogoExists("meesho"),
  };
}

export function getLogoDetails(): Record<MarketKey, { logo: string; hasLogo: boolean }> {
  return {
    amazon: { logo: MARKETS.amazon.logo, hasLogo: MARKETS.amazon.hasLogo },
    flipkart: { logo: MARKETS.flipkart.logo, hasLogo: MARKETS.flipkart.hasLogo },
    meesho: { logo: MARKETS.meesho.logo, hasLogo: MARKETS.meesho.hasLogo },
  };
}
