/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const projectRoot = fs.existsSync(path.join(process.cwd(), "public"))
  ? process.cwd()
  : path.join(process.cwd(), "sirra-web");

const imagesDir = path.join(projectRoot, "public", "images");
const videoDir = path.join(projectRoot, "public", "video");
const manifestPath = path.join(projectRoot, "src", "content", "hero-manifest.json");

const HERO_MAIN_EXTS = [".jpg", ".jpeg", ".png", ".webp"];
const HERO_VIDEO_EXTS = [".mp4", ".webm"];

async function scanHero() {
  console.log("[scan-hero] Scanning hero visual assets...");

  let heroMainFile = null;
  let heroMainMeta = null;

  if (fs.existsSync(imagesDir)) {
    const files = fs.readdirSync(imagesDir);
    for (const ext of HERO_MAIN_EXTS) {
      const match = files.find(
        (f) => f.toLowerCase() === `hero-main${ext}`.toLowerCase()
      );
      if (match) {
        heroMainFile = match;
        try {
          const meta = await sharp(path.join(imagesDir, match)).metadata();
          heroMainMeta = { width: meta.width || 0, height: meta.height || 0 };
        } catch (err) {
          console.warn("[scan-hero] Failed to read metadata with sharp:", err.message);
        }
        break;
      }
    }
  }

  // Check for hero video
  let heroVideo = null;
  if (fs.existsSync(videoDir)) {
    const videoFiles = fs.readdirSync(videoDir);
    for (const ext of HERO_VIDEO_EXTS) {
      const match = videoFiles.find(
        (f) => f.toLowerCase() === `hero${ext}`.toLowerCase()
      );
      if (match) {
        heroVideo = { src: `/video/${match}` };
        break;
      }
    }
  }

  const forcedMode = process.env.NEXT_PUBLIC_HERO_MODE;
  let mode = "panels";
  let reason = "";

  const hasQualifiedImage = Boolean(heroMainFile && heroMainMeta && heroMainMeta.width >= 2000);
  const hasVideo = Boolean(heroVideo);

  if (forcedMode === "panels") {
    mode = "panels";
    reason = "NEXT_PUBLIC_HERO_MODE forced mode to panels";
  } else if (forcedMode === "single") {
    mode = "single";
    reason = "NEXT_PUBLIC_HERO_MODE forced mode to single";
  } else if (hasQualifiedImage) {
    mode = "single";
    reason = `hero-main found (${heroMainMeta.width}px >= 2000px): activated full-bleed single mode`;
  } else if (hasVideo) {
    mode = "single";
    reason = `hero video found (${heroVideo.src}): activated full-bleed single mode`;
  } else {
    mode = "panels";
    reason = heroMainFile
      ? `hero-main width (${heroMainMeta?.width || 0}px < 2000px): preserved 4-panel mode (no stretching)`
      : "No full-res hero-main (>=2000px) or hero video found: default 4-panel mode active";
  }

  const manifest = {
    mode,
    image: heroMainFile && heroMainMeta ? {
      src: `/images/${heroMainFile}`,
      width: heroMainMeta.width,
      height: heroMainMeta.height,
    } : null,
    video: heroVideo,
    reason,
  };

  console.log(`[scan-hero] Mode '${mode}' active: ${reason}`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log("[scan-hero] Wrote manifest to:", manifestPath);
}

scanHero().catch((err) => {
  console.error("[scan-hero] Fatal scan error:", err);
  process.exit(1);
});
