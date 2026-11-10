import heroManifest from "./hero-manifest.json";

export type HeroMode = "youtube" | "video" | "persona" | "single" | "panels";
export type HeroCaption = "name" | "none";

export interface HeroYouTubeConfig {
  id: string;
  start: number;
  end: number;
}

export interface SlideOverride {
  kv: {
    src: string;
    width: number;
    height: number;
  } | null;
  video: {
    src: string;
  } | null;
}

export interface HeroVideoSuite {
  src: string;
  webm?: string | null;
  mobile?: string | null;
  mobileWebm?: string | null;
  poster?: string | null;
  hasPoster?: boolean;
  sizes?: Record<string, number>;
}

export interface HeroManifestData {
  mode: HeroMode;
  image: {
    src: string;
    width: number;
    height: number;
  } | null;
  video: HeroVideoSuite | null;
  slides: Record<string, SlideOverride>;
  reason: string;
}

const manifest = heroManifest as HeroManifestData;

// YouTube Preview Configuration
export const HERO_YT_CONFIG: HeroYouTubeConfig = {
  id: process.env.NEXT_PUBLIC_HERO_YT_ID || "mxD7QEt85ms",
  start: Math.max(0, parseFloat(process.env.NEXT_PUBLIC_HERO_YT_START || "0") || 0),
  end: Math.max(0, parseFloat(process.env.NEXT_PUBLIC_HERO_YT_END || "0") || 0),
};

// Allow environment variable override: NEXT_PUBLIC_HERO_MODE ("video" | "persona" | "single" | "panels")
const envMode = process.env.NEXT_PUBLIC_HERO_MODE as HeroMode | undefined;
let resolvedMode: HeroMode =
  envMode === "persona" || envMode === "single" || envMode === "panels"
    ? envMode
    : "video";

// Automatic fallback: If "video" mode is requested but no video file exists in manifest, fall back to "persona"
if (resolvedMode === "video" && !manifest.video?.src) {
  if (typeof console !== "undefined") {
    console.warn(
      "[hero] HERO_MODE 'video' requested, but no hero video found in manifest. Falling back to 'persona' mode."
    );
  }
  resolvedMode = "persona";
}

export const HERO_MODE: HeroMode = resolvedMode;

// Allow environment variable override: NEXT_PUBLIC_HERO_CAPTION ("name" | "none")
const envCaption = process.env.NEXT_PUBLIC_HERO_CAPTION as HeroCaption | undefined;
export const HERO_CAPTION: HeroCaption = envCaption === "none" ? "none" : "name";

export const HERO_DATA = {
  ...manifest,
  mode: HERO_MODE,
  caption: HERO_CAPTION,
  youtube: HERO_YT_CONFIG,
};

export default HERO_DATA;
