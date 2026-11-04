/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const PUBLIC_IMAGES_DIR = path.join(PROJECT_ROOT, "public", "images");

async function generateBlurDataUrl(filePath) {
  const buffer = await sharp(filePath)
    .resize(16, 16, { fit: "inside" })
    .jpeg({ quality: 60 })
    .toBuffer();
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

async function run() {
  const targetFiles = [
    "pack-wayfarer.jpg",
    "pack-equinox.jpg",
    "pack-silk-smoke.jpg",
    "pack-heartthrob.jpg",
  ];

  console.log("=== Generating Blur Data URLs ===");
  const results = {};

  for (const filename of targetFiles) {
    const fullPath = path.join(PUBLIC_IMAGES_DIR, filename);
    if (fs.existsSync(fullPath)) {
      const blurUrl = await generateBlurDataUrl(fullPath);
      results[filename] = blurUrl;
      console.log(`\n// ${filename}:`);
      console.log(`blurDataURL: "${blurUrl}",`);
    } else {
      console.warn(`File not found: ${fullPath}`);
    }
  }

  return results;
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

