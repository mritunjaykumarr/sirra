/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const ASSETS_SOURCE_DIR = path.join(PROJECT_ROOT, "assets-source");
const PUBLIC_IMAGES_DIR = path.join(PROJECT_ROOT, "public", "images");

// Source to target mapping verified from bottle & box labels
const PACK_SHOT_MAPPINGS = [
  {
    scent: "wayfarer",
    sourceFile: "sirra4.jpeg",
    targetFile: "pack-wayfarer.jpg",
  },
  {
    scent: "equinox",
    sourceFile: "sirra3.jpeg",
    targetFile: "pack-equinox.jpg",
  },
  {
    scent: "silk-smoke",
    sourceFile: "sirra2.jpeg",
    targetFile: "pack-silk-smoke.jpg",
  },
  {
    scent: "heartthrob",
    sourceFile: "sirra1.jpeg",
    targetFile: "pack-heartthrob.jpg",
  },
];

async function exportPackShots() {
  console.log("=== SIRRA Pack Shot Export ===");

  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
  }

  for (const item of PACK_SHOT_MAPPINGS) {
    const inputPath = path.join(ASSETS_SOURCE_DIR, item.sourceFile);
    const outputPath = path.join(PUBLIC_IMAGES_DIR, item.targetFile);

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Source file not found: ${inputPath}`);
    }

    const inputStat = fs.statSync(inputPath);
    const image = sharp(inputPath);
    const meta = await image.metadata();

    let transform = image.rotate(); // auto-rotate if needed

    // If native resolution > 2400px long edge, resize
    const maxEdge = Math.max(meta.width || 0, meta.height || 0);
    if (maxEdge > 2400) {
      transform = transform.resize({
        width: meta.width >= meta.height ? 2400 : undefined,
        height: meta.height > meta.width ? 2400 : undefined,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Keep sRGB profile, strip EXIF metadata, mozjpeg quality 88
    await transform
      .toColorspace("srgb")
      .jpeg({
        quality: 88,
        mozjpeg: true,
        chromaSubsampling: "4:4:4",
      })
      .toFile(outputPath);

    const outStat = fs.statSync(outputPath);
    const outMeta = await sharp(outputPath).metadata();

    console.log(
      `✓ [${item.scent}] ${item.sourceFile} (${meta.width}x${meta.height}, ${(inputStat.size / 1024).toFixed(1)} KB) -> ` +
        `${item.targetFile} (${outMeta.width}x${outMeta.height}, ${(outStat.size / 1024).toFixed(1)} KB)`
    );
  }

  console.log("=== Pack Shot Export Complete ===");
}

exportPackShots().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});

