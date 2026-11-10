/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const projectRoot = fs.existsSync(path.join(process.cwd(), "public"))
  ? process.cwd()
  : path.join(process.cwd(), "sirra-web");

const imagesDir = path.join(projectRoot, "public", "images");
const videoDir = path.join(projectRoot, "public", "video");
const heroDir = path.join(projectRoot, "public", "hero");
const manifestPath = path.join(projectRoot, "src", "content", "hero-manifest.json");

const HERO_SLUGS = ["wayfarer", "equinox", "silk-smoke", "heartthrob"];
const KV_EXTS = [".jpg", ".jpeg", ".png", ".webp"];
const VIDEO_EXTS = [".mp4", ".webm"];
const HERO_MAIN_EXTS = [".jpg", ".jpeg", ".png", ".webp"];

async function scanHero() {
  console.log("[scan-hero] Scanning hero visual assets...");

  // Ensure directories exist
  if (!fs.existsSync(heroDir)) {
    fs.mkdirSync(heroDir, { recursive: true });
  }
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  // 1. Scan per-slug Key Visuals in public/hero/
  const slides = {
    wayfarer: { kv: null, video: null },
    equinox: { kv: null, video: null },
    "silk-smoke": { kv: null, video: null },
    heartthrob: { kv: null, video: null },
  };

  const heroFiles = fs.existsSync(heroDir) ? fs.readdirSync(heroDir) : [];
  for (const slug of HERO_SLUGS) {
    for (const ext of KV_EXTS) {
      const targetName = `${slug}-kv${ext}`.toLowerCase();
      const match = heroFiles.find((f) => f.toLowerCase() === targetName);
      if (match) {
        const fullPath = path.join(heroDir, match);
        try {
          const meta = await sharp(fullPath).metadata();
          const width = meta.width || 0;
          const height = meta.height || 0;
          if (width >= 2000) {
            slides[slug].kv = {
              src: `/hero/${match}`,
              width,
              height,
            };
            console.log(`[scan-hero] Qualified key visual for ${slug}: /hero/${match} (${width}x${height})`);
          } else {
            console.warn(
              `[scan-hero] Key visual for ${slug} (${match}) width ${width}px is under 2000px threshold: ignored (no stretching allowed)`
            );
          }
        } catch (err) {
          console.warn(`[scan-hero] Failed to inspect ${match} with sharp:`, err.message);
        }
        break;
      }
    }
  }

  // 2. Scan per-slug videos in public/video/
  const videoFiles = fs.existsSync(videoDir) ? fs.readdirSync(videoDir) : [];
  for (const slug of HERO_SLUGS) {
    for (const ext of VIDEO_EXTS) {
      const targetName = `${slug}${ext}`.toLowerCase();
      const match = videoFiles.find((f) => f.toLowerCase() === targetName);
      if (match) {
        slides[slug].video = { src: `/video/${match}` };
        console.log(`[scan-hero] Found video for ${slug}: /video/${match}`);
        break;
      }
    }
  }

  // 3. Scan legacy hero-main in public/images/
  let heroMainFile = null;
  let heroMainMeta = null;
  if (fs.existsSync(imagesDir)) {
    const imgFiles = fs.readdirSync(imagesDir);
    for (const ext of HERO_MAIN_EXTS) {
      const match = imgFiles.find(
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

  // 4. Scan Hero Video Files & Poster in public/video/
  let heroVideo = null;
  const heroMp4 = videoFiles.find((f) => f.toLowerCase() === "hero.mp4") || videoFiles.find((f) => f.toLowerCase() === "videoplayback.mp4");
  const heroWebm = videoFiles.find((f) => f.toLowerCase() === "hero.webm");
  const heroMobileMp4 = videoFiles.find((f) => f.toLowerCase() === "hero-mobile.mp4");
  const heroMobileWebm = videoFiles.find((f) => f.toLowerCase() === "hero-mobile.webm");
  const heroPoster = videoFiles.find((f) => f.toLowerCase() === "hero-poster.jpg");

  const MAX_RECOMMENDED_BYTES = 10 * 1024 * 1024; // 10MB threshold warning

  if (heroMp4) {
    const videoSizes = {};
    const checkFile = (name, relativeName) => {
      if (!relativeName) return null;
      const full = path.join(videoDir, relativeName);
      if (fs.existsSync(full)) {
        const stats = fs.statSync(full);
        videoSizes[name] = stats.size;
        if (stats.size > MAX_RECOMMENDED_BYTES) {
          console.warn(`[scan-hero] WARNING: ${relativeName} is ${(stats.size / (1024 * 1024)).toFixed(2)}MB (exceeds recommended 10MB limit)`);
        }
        return `/video/${relativeName}`;
      }
      return null;
    };

    heroVideo = {
      src: checkFile("mp4", heroMp4),
      webm: checkFile("webm", heroWebm),
      mobile: checkFile("mobileWebm", heroMobileWebm) || checkFile("mobileMp4", heroMobileMp4),
      mobileMp4: checkFile("mobileMp4", heroMobileMp4),
      mobileWebm: checkFile("mobileWebm", heroMobileWebm),
      poster: checkFile("poster", heroPoster) || "/video/hero-poster.jpg",
      hasPoster: Boolean(heroPoster),
      sizes: videoSizes,
    };
    console.log(`[scan-hero] Found hero video suite (Desktop: ${heroMp4}${heroWebm ? `, ${heroWebm}` : ""}; Mobile: ${heroMobileWebm || heroMobileMp4 || "none"})`);
  }

  // 5. Determine active mode: "youtube" (preview) | "video" (new default) | "persona" (fallback) | "single" | "panels"
  const forcedMode = process.env.NEXT_PUBLIC_HERO_MODE;
  let mode = "video";
  let reason = "Default video mode active (cinematic full-screen fragrance video)";

  if (forcedMode === "youtube") {
    mode = "youtube";
    reason = "NEXT_PUBLIC_HERO_MODE forced mode to youtube (internal preview only)";
    console.warn("HERO_MODE=youtube is a preview. The video source is not licensed for production use.");
  } else if (forcedMode === "panels") {
    mode = "panels";
    reason = "NEXT_PUBLIC_HERO_MODE forced mode to panels";
  } else if (forcedMode === "single") {
    mode = "single";
    reason = "NEXT_PUBLIC_HERO_MODE forced mode to single";
  } else if (forcedMode === "persona") {
    mode = "persona";
    reason = "NEXT_PUBLIC_HERO_MODE forced mode to persona";
  } else if (forcedMode === "video") {
    if (heroVideo && heroVideo.src) {
      mode = "video";
      reason = "NEXT_PUBLIC_HERO_MODE forced mode to video";
    } else {
      mode = "persona";
      reason = "NEXT_PUBLIC_HERO_MODE set to 'video' but no hero.mp4 found; falling back to persona mode";
      console.warn(`[scan-hero] ${reason}`);
    }
  } else {
    // Default mode resolution
    if (heroVideo && heroVideo.src) {
      mode = "video";
      reason = "Hero video found in public/video/: video mode active by default";
    } else {
      mode = "persona";
      reason = "No hero video found in public/video/: automatically fell back to persona mode";
    }
  }

  const manifest = {
    mode,
    image: heroMainFile && heroMainMeta ? {
      src: `/images/${heroMainFile}`,
      width: heroMainMeta.width,
      height: heroMainMeta.height,
    } : null,
    video: heroVideo,
    slides,
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
