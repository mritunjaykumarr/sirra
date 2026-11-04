/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const VIDEO_KEYS = ["hero", "wayfarer", "equinox", "silk-smoke", "heartthrob"];
const VIDEO_EXTENSIONS = [".mp4", ".webm"];

const projectRoot = fs.existsSync(path.join(process.cwd(), "public"))
  ? process.cwd()
  : path.join(process.cwd(), "sirra-web");

const videoDir = path.join(projectRoot, "public", "video");
const manifestPath = path.join(projectRoot, "src", "content", "video-manifest.json");

function scanVideos() {
  console.log("[scan-videos] Scanning directory:", videoDir);

  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  const files = fs.readdirSync(videoDir);
  const manifest = {
    hero: null,
    wayfarer: null,
    equinox: null,
    "silk-smoke": null,
    heartthrob: null,
  };

  for (const key of VIDEO_KEYS) {
    for (const ext of VIDEO_EXTENSIONS) {
      const target = `${key}${ext}`;
      const found = files.find((f) => f.toLowerCase() === target.toLowerCase());
      if (found) {
        manifest[key] = `/video/${found}`;
        console.log(`[scan-videos] Found video for ${key}: /video/${found}`);
        break;
      }
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log("[scan-videos] Wrote manifest to:", manifestPath);
}

scanVideos();

