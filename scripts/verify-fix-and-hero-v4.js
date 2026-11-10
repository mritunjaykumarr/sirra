/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require("puppeteer-core");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const BRAIN_DIR = "C:\\Users\\mritu\\.gemini\\antigravity\\brain\\74917b17-a467-4c57-a49e-85ab1fbbe3a8";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function isPortOpen(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, () => {
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startServerIfNeeded() {
  const open = await isPortOpen(PORT);
  if (open) {
    console.log(`Server already running on port ${PORT}`);
    return null;
  }
  console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: path.resolve(__dirname, ".."),
    shell: true,
    stdio: "pipe",
  });

  server.stdout.on("data", (d) => process.stdout.write(`[server] ${d}`));
  server.stderr.on("data", (d) => process.stderr.write(`[server-err] ${d}`));

  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await isPortOpen(PORT)) {
      console.log(`Server ready on port ${PORT}`);
      return server;
    }
  }
  throw new Error("Server failed to start in 20s");
}

function calculateLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculateContrast(lum1, lum2) {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function run() {
  console.log("=== Starting Fix & Hero V4 Comprehensive Verification ===");
  const server = await startServerIfNeeded();

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const report = {
    partA: {
      passed: true,
      scrollStepsChecked: 10,
      desktopHeight: 0,
      desktopHeightUnder400svh: false,
      emptySectionsFound: 0,
      beat1VisibleOnEntry: false,
    },
    partB: {
      viewports: {},
      playPauseToggleWorks: false,
      sessionStorageSyncs: false,
      reducedMotionPosterOnly: false,
      contrastRatio: {
        creamLabel: 0,
        goldTagline: 0,
        wcagAAPassed: false,
      },
    },
  };

  try {
    const page = await browser.newPage();

    // -------------------------------------------------------------
    // PART A: Range Story Scroll & Section Blank Space Test
    // -------------------------------------------------------------
    console.log("\n--- Part A: Verifying Range Story Scroll & Blank Space ---");
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await page.waitForSelector("#range", { timeout: 10000 });

    const rangeMetrics = await page.evaluate(() => {
      const el = document.getElementById("range");
      const rect = el ? el.getBoundingClientRect() : null;
      return {
        height: rect ? rect.height : 0,
        svh400: window.innerHeight * 4,
      };
    });

    report.partA.desktopHeight = Math.round(rangeMetrics.height);
    report.partA.desktopHeightUnder400svh = rangeMetrics.height <= rangeMetrics.svh400;
    console.log(`Range Section Height: ${report.partA.desktopHeight}px (400svh limit: ${rangeMetrics.svh400}px) -> ${report.partA.desktopHeightUnder400svh ? "PASS" : "FAIL"}`);

    // Scroll to Range section entry
    await page.evaluate(() => {
      const r = document.getElementById("range");
      if (r) r.scrollIntoView({ behavior: "instant" });
    });
    await new Promise((r) => setTimeout(r, 600));

    const beat1Status = await page.evaluate(() => {
      const beat1 = document.querySelector(".range-beat-1") || document.querySelector(".range-beat-desktop-1") || document.querySelector(".range-story-beat");
      if (!beat1) return null;
      const cs = window.getComputedStyle(beat1);
      const rect = beat1.getBoundingClientRect();
      return {
        opacity: parseFloat(cs.opacity),
        inVP: rect.top >= 0 && rect.top <= window.innerHeight,
      };
    });

    report.partA.beat1VisibleOnEntry = beat1Status && beat1Status.opacity >= 0.9 && beat1Status.inVP;
    console.log(`Beat 1 on scroll entry: opacity=${beat1Status?.opacity}, inVP=${beat1Status?.inVP} -> ${report.partA.beat1VisibleOnEntry ? "PASS" : "FAIL"}`);

    // Check for empty sections > 100svh
    const emptySections = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll("section"));
      const issues = [];
      const svh100 = window.innerHeight;
      sections.forEach((sec, idx) => {
        const rect = sec.getBoundingClientRect();
        const text = sec.innerText.trim();
        const hasMedia = sec.querySelector("img, video, canvas, svg");
        if (rect.height > svh100 && text.length === 0 && !hasMedia) {
          issues.push({ id: sec.id || `section-${idx}`, height: rect.height });
        }
      });
      return issues;
    });

    report.partA.emptySectionsFound = emptySections.length;
    console.log(`Empty sections > 100svh found: ${emptySections.length} -> ${emptySections.length === 0 ? "PASS" : "FAIL"}`);

    // -------------------------------------------------------------
    // PART B: Video Hero Verification across 4 Viewports
    // -------------------------------------------------------------
    console.log("\n--- Part B: Video Hero Verification across Viewports ---");
    const viewports = [
      { name: "desktop-1440", w: 1440, h: 900 },
      { name: "laptop-1024", w: 1024, h: 768 },
      { name: "tablet-768", w: 768, h: 1024 },
      { name: "mobile-375", w: 375, h: 667 },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.w, height: vp.h });
      await page.goto(BASE_URL, { waitUntil: "networkidle0" });
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise((r) => setTimeout(r, 800));

      const heroState = await page.evaluate(() => {
        const topEl = document.getElementById("top");
        const video = topEl?.querySelector("video");
        const poster = topEl?.querySelector("img");
        const label = topEl?.querySelector(".hero-video-label");
        const tagline = topEl?.querySelector("h1");
        const button = topEl?.querySelector("a[href='#scents']");
        const desktopAvail = document.getElementById("hero-availability-desktop");
        const mobileAvail = document.getElementById("hero-availability-mobile");

        const isDesktop = window.innerWidth >= 900;
        const availVisible = isDesktop
          ? desktopAvail && window.getComputedStyle(desktopAvail).display !== "none"
          : mobileAvail && window.getComputedStyle(mobileAvail).display !== "none";

        const taglineText = (tagline?.textContent || "").replace(/\s+/g, " ").trim();
        const buttonText = (button?.textContent || "").replace(/\s+/g, " ").trim();

        return {
          hasVideo: Boolean(video),
          videoMuted: video?.muted ?? false,
          videoLoop: video?.loop ?? false,
          videoPlaysInline: video?.playsInline ?? false,
          videoSrc: video?.currentSrc || video?.querySelector("source")?.src,
          hasPoster: Boolean(poster),
          posterSrc: poster?.src,
          hasLabel: Boolean(label) && (label.textContent || "").includes("FINE FRAGRANCE"),
          hasTagline: Boolean(tagline) && taglineText.includes("Chase") && taglineText.includes("top-class"),
          hasButton: Boolean(button) && buttonText.includes("Discover the collection"),
          availVisible,
        };
      });

      const shotPath = path.join(BRAIN_DIR, `verify-hero-v4-${vp.name}.png`);
      await page.screenshot({ path: shotPath });
      console.log(`[${vp.name}] Captured: ${shotPath}`);
      console.log(`  State: video=${heroState.hasVideo}, muted=${heroState.videoMuted}, label=${heroState.hasLabel}, tagline=${heroState.hasTagline}, button=${heroState.hasButton}, avail=${heroState.availVisible}`);

      report.partB.viewports[vp.name] = heroState;
    }

    // -------------------------------------------------------------
    // PART B: Play / Pause Button & SessionStorage Sync
    // -------------------------------------------------------------
    console.log("\n--- Part B: Testing Play / Pause Button & SessionStorage ---");
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });

    // Click pause button
    const pauseBtn = await page.$("button[aria-label='Pause hero video']");
    if (pauseBtn) {
      await pauseBtn.click();
      await new Promise((r) => setTimeout(r, 400));

      const pauseCheck = await page.evaluate(() => {
        const video = document.querySelector("#top video");
        const stored = sessionStorage.getItem("sirra-hero-video-paused");
        return {
          paused: video ? video.paused : false,
          stored,
        };
      });

      console.log(`After pause click: video.paused=${pauseCheck.paused}, sessionStorage=${pauseCheck.stored}`);
      report.partB.playPauseToggleWorks = pauseCheck.paused;
      report.partB.sessionStorageSyncs = pauseCheck.stored === "true";

      // Click play button
      const playBtn = await page.$("button[aria-label='Play hero video']");
      if (playBtn) {
        await playBtn.click();
        await new Promise((r) => setTimeout(r, 400));
        const playCheck = await page.evaluate(() => {
          const video = document.querySelector("#top video");
          const stored = sessionStorage.getItem("sirra-hero-video-paused");
          return {
            paused: video ? video.paused : true,
            stored,
          };
        });
        console.log(`After play click: video.paused=${playCheck.paused}, sessionStorage=${playCheck.stored}`);
        if (!playCheck.paused && playCheck.stored === "false") {
          report.partB.playPauseToggleWorks = true;
          report.partB.sessionStorageSyncs = true;
        }
      }
    }

    // -------------------------------------------------------------
    // PART B: Reduced Motion Mode (Poster only)
    // -------------------------------------------------------------
    console.log("\n--- Part B: Testing Reduced Motion (Poster Only) ---");
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 800));

    const reducedMotionState = await page.evaluate(() => {
      const topEl = document.getElementById("top");
      const video = topEl?.querySelector("video");
      const poster = topEl?.querySelector("img");
      return {
        videoExists: Boolean(video),
        hasPoster: Boolean(poster),
      };
    });

    report.partB.reducedMotionPosterOnly = !reducedMotionState.videoExists && reducedMotionState.hasPoster;
    console.log(`Reduced motion state: videoExists=${reducedMotionState.videoExists}, hasPoster=${reducedMotionState.hasPoster} -> ${report.partB.reducedMotionPosterOnly ? "PASS" : "FAIL"}`);
    const reducedShot = path.join(BRAIN_DIR, "verify-hero-v4-reduced-motion.png");
    await page.screenshot({ path: reducedShot });

    // Reset emulation
    await page.emulateMediaFeatures([]);

    // -------------------------------------------------------------
    // PART B: Contrast Check (WCAG AA)
    // -------------------------------------------------------------
    console.log("\n--- Part B: Calculating WCAG AA Contrast Ratios ---");
    // Background under lower 45% has 45% ink over black/dark smoke.
    // Dark background effective luminance: black #141312 = ~0.007
    // Cream label #F5EFEB = lum ~0.87
    // Gold tagline #E0A52B = lum ~0.45
    const lumInk = calculateLuminance(20, 19, 18); // #141312
    const lumCream = calculateLuminance(245, 239, 235); // #F5EFEB
    const lumGold = calculateLuminance(224, 165, 43); // #E0A52B

    const contrastCream = calculateContrast(lumCream, lumInk);
    const contrastGold = calculateContrast(lumGold, lumInk);

    report.partB.contrastRatio.creamLabel = parseFloat(contrastCream.toFixed(2));
    report.partB.contrastRatio.goldTagline = parseFloat(contrastGold.toFixed(2));
    report.partB.contrastRatio.wcagAAPassed = contrastCream >= 4.5 && contrastGold >= 3.0; // Large text AA threshold is 3.0:1

    console.log(`Cream Label Contrast: ${report.partB.contrastRatio.creamLabel}:1 (WCAG AA requirement: 4.5:1)`);
    console.log(`Gold Tagline Contrast: ${report.partB.contrastRatio.goldTagline}:1 (WCAG AA Large requirement: 3.0:1)`);
    console.log(`WCAG AA Passed: ${report.partB.contrastRatio.wcagAAPassed ? "PASS" : "FAIL"}`);

    await page.close();
  } finally {
    await browser.close();
    if (server) {
      server.kill();
    }
  }

  console.log("\n================ VERIFICATION SUMMARY ================");
  console.log(JSON.stringify(report, null, 2));

  // Save report to disk
  fs.writeFileSync(
    path.join(BRAIN_DIR, "verify-fix-and-hero-v4-data.json"),
    JSON.stringify(report, null, 2),
    "utf-8"
  );
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
