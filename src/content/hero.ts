import heroManifest from "./hero-manifest.json";

export type HeroMode = "panels" | "single";

export interface HeroManifestData {
  mode: HeroMode;
  image: {
    src: string;
    width: number;
    height: number;
  } | null;
  video: {
    src: string;
    width?: number;
    height?: number;
  } | null;
  reason: string;
}

const manifest = heroManifest as HeroManifestData;

// Allow environment variable override: NEXT_PUBLIC_HERO_MODE ("panels" | "single")
const envMode = process.env.NEXT_PUBLIC_HERO_MODE;
export const HERO_MODE: HeroMode =
  envMode === "single" || envMode === "panels"
    ? envMode
    : manifest.mode === "single"
    ? "single"
    : "panels";

export const HERO_DATA = {
  ...manifest,
  mode: HERO_MODE,
};

export default HERO_DATA;

