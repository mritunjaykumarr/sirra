/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const MARKETS = ["amazon", "flipkart", "meesho"];
const EXTENSIONS = [".svg", ".png", ".webp", ".jpg", ".jpeg"];

// Support running from either sirra-web folder or workspace root
const projectRoot = fs.existsSync(path.join(process.cwd(), "public", "logos"))
  ? process.cwd()
  : path.join(process.cwd(), "sirra-web");

const logosDir = path.join(projectRoot, "public", "logos");
const manifestPath = path.join(projectRoot, "src", "content", "logo-manifest.json");

let sharp = null;
try {
  sharp = require("sharp");
} catch {
  // sharp might be in node_modules
}

function parseSvgDimensions(svgContent) {
  // Try viewBox first: viewBox="0 0 120 36"
  const vbMatch = svgContent.match(/viewBox=["']\s*([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s*["']/i);
  if (vbMatch) {
    const w = parseFloat(vbMatch[3]);
    const h = parseFloat(vbMatch[4]);
    if (w > 0 && h > 0) {
      // Scale up small units (e.g. 24.7x7.5) so integer rounding does not distort aspect ratio
      const scale = w < 100 ? (w < 10 ? 100 : 10) : 1;
      return { width: Math.round(w * scale), height: Math.round(h * scale) };
    }
  }

  // Try direct width and height attributes
  const wMatch = svgContent.match(/\bwidth=["']\s*([\d.]+)(px)?\s*["']/i);
  const hMatch = svgContent.match(/\bheight=["']\s*([\d.]+)(px)?\s*["']/i);
  if (wMatch && hMatch) {
    const w = parseFloat(wMatch[1]);
    const h = parseFloat(hMatch[1]);
    if (w > 0 && h > 0) {
      return { width: Math.round(w), height: Math.round(h) };
    }
  }

  // Sensible default if unparseable
  return { width: 120, height: 36 };
}

async function scan() {
  console.log("[scan-logos] Scanning directory:", logosDir);

  if (!fs.existsSync(logosDir)) {
    console.warn(`[scan-logos] Directory does not exist: ${logosDir}`);
    fs.mkdirSync(logosDir, { recursive: true });
  }

  const files = fs.readdirSync(logosDir);
  const manifest = {
    amazon: null,
    flipkart: null,
    meesho: null,
  };

  for (const market of MARKETS) {
    const lowerMarket = market.toLowerCase();
    let matchedFile = null;
    let isDoubleExt = false;

    // 1. Exact match with extension: e.g. amazon.svg, amazon.png
    for (const ext of EXTENSIONS) {
      const target = `${lowerMarket}${ext}`;
      const found = files.find((f) => f.toLowerCase() === target);
      if (found) {
        matchedFile = found;
        break;
      }
    }

    // 2. Double extension match: e.g. amazon.png.png, amazon.svg.png
    if (!matchedFile) {
      for (const ext of EXTENSIONS) {
        const found = files.find(
          (f) =>
            f.toLowerCase().startsWith(`${lowerMarket}.`) &&
            f.toLowerCase().endsWith(ext) &&
            f.toLowerCase() !== `${lowerMarket}${ext}`
        );
        if (found) {
          matchedFile = found;
          isDoubleExt = true;
          break;
        }
      }
    }

    if (matchedFile) {
      if (isDoubleExt) {
        console.warn(
          `[scan-logos WARNING] Double extension found for ${market}: "${matchedFile}". Using it.`
        );
      }

      const filePath = path.join(logosDir, matchedFile);
      const ext = path.extname(matchedFile).toLowerCase();

      let dimensions = { width: 120, height: 36 };

      try {
        if (ext === ".svg") {
          const svgContent = fs.readFileSync(filePath, "utf-8");
          dimensions = parseSvgDimensions(svgContent);
        } else if (sharp) {
          const meta = await sharp(filePath).metadata();
          if (meta.width && meta.height) {
            dimensions = { width: meta.width, height: meta.height };
          }
        }
      } catch (err) {
        console.warn(`[scan-logos] Could not read dimensions for ${matchedFile}:`, err.message);
      }

      manifest[market] = {
        src: `/logos/${matchedFile}`,
        width: dimensions.width,
        height: dimensions.height,
      };
      console.log(`[scan-logos] Found ${market}: /logos/${matchedFile} (${dimensions.width}x${dimensions.height})`);
    } else {
      console.log(`[scan-logos] ${market}: null (no logo file found)`);
    }
  }

  // Ensure output directory exists
  const manifestDir = path.dirname(manifestPath);
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
  console.log("[scan-logos] Wrote manifest to:", manifestPath);
}

scan().catch((err) => {
  console.error("[scan-logos ERROR]:", err);
  process.exit(1);
});
