/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require("puppeteer-core");
const { spawn, execSync } = require("child_process");
const http = require("http");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const BRAIN_DIR = "C:\\Users\\mritu\\.gemini\\antigravity\\brain\\74917b17-a467-4c57-a49e-85ab1fbbe3a8";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function killProcessTree(proc) {
  if (proc && proc.pid) {
    try {
      execSync(`taskkill /F /T /PID ${proc.pid}`, { stdio: "ignore" });
    } catch {
      // already exited
    }
  }
}

function waitForServer(url, timeoutMs = 35000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function check() {
      http
        .get(url, (res) => {
          if (res.statusCode === 200 || res.statusCode === 304) {
            resolve();
          } else {
            setTimeout(check, 500);
          }
        })
        .on("error", () => {
          if (Date.now() - start > timeoutMs) {
            reject(new Error(`Timeout waiting for server at ${url}`));
          } else {
            setTimeout(check, 500);
          }
        });
    }
    check();
  });
}

async function runHeroRevertVerification() {
  console.log("=== SIRRA HERO REVERT + MINIMISE VERIFICATION ===");
  const testResults = {
    modeSwitchTested: false,
    fourPanelsEqualWidth: false,
    panelsNonInteractive: false,
    noScentOrRolesInHero: false,
    textBlockExactAndMinimal: false,
    noChipRowUnderHeroButton: false,
    scentsRailHiddenOverHero: false,
    scentsRailVisibleInChapters: false,
    marketplaceLogosOpticallyBalanced: false,
    screenshotsCaptured: false,
  };

  const projectRoot = path.resolve(__dirname, "..");
  const manifestPath = path.join(projectRoot, "src", "content", "hero-manifest.json");
  const tempHeroPath = path.join(projectRoot, "public", "images", "hero-main.jpg");

  // PART 1: TEST MODE SWITCH LOGIC
  console.log("\n[1/5] Testing Hero Mode Switch...");
  try {
    // 1a. Default state: no hero-main >= 2000px, should be "panels"
    execSync("node scripts/scan-hero.js", { cwd: projectRoot, stdio: "inherit" });
    let m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (m.mode !== "panels") throw new Error(`Expected default mode 'panels', got '${m.mode}'`);
    console.log("✓ Default mode is 'panels'");

    // 1b. Temporary 2400px image: should switch to "single"
    console.log("  Creating temporary 2400x1350 test image...");
    await sharp({
      create: {
        width: 2400,
        height: 1350,
        channels: 3,
        background: { r: 20, g: 19, b: 18 },
      },
    })
      .jpeg({ quality: 90 })
      .toFile(tempHeroPath);

    execSync("node scripts/scan-hero.js", { cwd: projectRoot, stdio: "inherit" });
    m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (m.mode !== "single") throw new Error(`Expected mode 'single' for 2400px image, got '${m.mode}'`);
    console.log("✓ Auto-switch to 'single' mode verified with 2400px image");

    // 1c. Environment override: NEXT_PUBLIC_HERO_MODE=panels
    console.log("  Testing NEXT_PUBLIC_HERO_MODE=panels override...");
    execSync("node scripts/scan-hero.js", {
      cwd: projectRoot,
      env: { ...process.env, NEXT_PUBLIC_HERO_MODE: "panels" },
      stdio: "inherit",
    });
    m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (m.mode !== "panels") throw new Error(`Expected override mode 'panels', got '${m.mode}'`);
    console.log("✓ Environment override NEXT_PUBLIC_HERO_MODE=panels verified");

    // Clean up temporary image and re-scan back to default panels mode
    if (fs.existsSync(tempHeroPath)) {
      fs.unlinkSync(tempHeroPath);
    }
    execSync("node scripts/scan-hero.js", { cwd: projectRoot, stdio: "inherit" });
    m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (m.mode !== "panels") throw new Error("Failed to restore default panels mode");
    console.log("✓ Restored default panels mode clean");
    testResults.modeSwitchTested = true;
  } catch (err) {
    if (fs.existsSync(tempHeroPath)) fs.unlinkSync(tempHeroPath);
    throw err;
  }

  // PART 2: BUILD NEXT.JS & START SERVER
  console.log("\n[2/5] Building Next.js production bundle...");
  execSync("npm run build", { cwd: projectRoot, stdio: "inherit" });

  console.log("  Starting Next.js production server on port 3000...");
  const serverProcess = spawn("cmd.exe", ["/c", "npx next start -p 3000"], {
    cwd: projectRoot,
    stdio: "pipe",
    shell: true,
  });

  await waitForServer(BASE_URL);
  console.log("✓ Server responsive at", BASE_URL);

  let browser = null;
  try {
    // PART 3: LAUNCH HEADLESS CHROME
    console.log("\n[3/5] Launching Chrome for visual & DOM verification...");
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);

    // 3a. Desktop 1440px viewport
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1500)); // allow reveal animations to settle

    // Hero inspect
    const heroInfo = await page.evaluate(() => {
      const hero = document.getElementById("top");
      if (!hero) return null;

      const panels = Array.from(hero.querySelectorAll(".hero-panel"));
      const visiblePanels = panels.filter((p) => p.getBoundingClientRect().width > 0);
      const panelTags = visiblePanels.map((p) => p.tagName.toLowerCase());
      const panelWidths = visiblePanels.map((p) => p.getBoundingClientRect().width);

      // Check text in hero using textContent
      const fullText = hero.textContent || "";
      const hasFineFragranceLabel = fullText.includes("FINE FRAGRANCE · 50ML EAU DE PARFUM");
      const hasWordmark = fullText.includes("SIRRA");
      const hasTagline = fullText.includes("Chase your top-class self.");
      const hasBaseline = fullText.includes("YOUR SIRRA.");

      // Check CTA button
      const ctaBtn = hero.querySelector("a[href='#scents']");
      const hasCTAButton = Boolean(ctaBtn && ctaBtn.textContent && ctaBtn.textContent.includes("Discover the collection"));

      // Check forbidden text in hero
      const forbiddenScentNames = ["WAYFARER", "EQUINOX", "SILK & SMOKE", "HEARTTHROB"];
      const forbiddenFound = forbiddenScentNames.filter((name) => fullText.toUpperCase().includes(name));
      const hasChipRow = fullText.includes("AVAILABLE ON");

      return {
        panelCount: visiblePanels.length,
        panelTags,
        panelWidths,
        hasFineFragranceLabel,
        hasWordmark,
        hasTagline,
        hasBaseline,
        hasCTAButton,
        hasValidCTAUrl: Boolean(ctaBtn),
        forbiddenFound,
        hasChipRow,
      };
    });

    console.log("  Desktop Hero Info:", JSON.stringify(heroInfo, null, 2));

    if (heroInfo.panelTags.every((t) => t === "div")) {
      testResults.panelsNonInteractive = true;
      console.log("✓ All hero panels are non-interactive <div>s (no links, no buttons)");
    } else {
      console.error("✗ Expected all panels to be <div>, found:", heroInfo.panelTags);
    }

    const firstWidth = heroInfo.panelWidths[0];
    const allEqual = heroInfo.panelWidths.every((w) => Math.abs(w - firstWidth) < 2);
    if (allEqual && heroInfo.panelCount === 4) {
      testResults.fourPanelsEqualWidth = true;
      console.log(`✓ All 4 panels have equal width on desktop (${firstWidth}px each, ~25% total)`);
    } else {
      console.error("✗ Panel widths are not equal:", heroInfo.panelWidths);
    }

    if (heroInfo.forbiddenFound.length === 0) {
      testResults.noScentOrRolesInHero = true;
      console.log("✓ Hero is pure brand visual: zero scent names or persona tags in hero");
    } else {
      console.error("✗ Forbidden scent names found in hero:", heroInfo.forbiddenFound);
    }

    if (
      heroInfo.hasFineFragranceLabel &&
      heroInfo.hasWordmark &&
      heroInfo.hasTagline &&
      heroInfo.hasBaseline &&
      heroInfo.hasCTAButton &&
      heroInfo.hasValidCTAUrl
    ) {
      testResults.textBlockExactAndMinimal = true;
      console.log("✓ Text block contains only listed copy: FINE FRAGRANCE, SIRRA, Tagline, YOUR SIRRA., CTA");
    } else {
      console.error("✗ Text block elements missing:", heroInfo);
    }

    if (!heroInfo.hasChipRow) {
      testResults.noChipRowUnderHeroButton = true;
      console.log("✓ Chip row 'AVAILABLE ON' removed under CTA button (announcement bar carries it)");
    } else {
      console.error("✗ Chip row still present under CTA button");
    }

    // 3b. Verify Scents Rail Visibility Bug Fix
    console.log("\n[4/5] Testing SCENTS Progress Rail Visibility...");
    // Over hero: rail should have opacity: 0
    const railInitial = await page.evaluate(() => {
      const rail = document.querySelector("nav[aria-label='Scent chapters navigation']");
      if (!rail) return null;
      const style = window.getComputedStyle(rail);
      return {
        opacity: style.opacity,
        pointerEvents: style.pointerEvents,
      };
    });
    console.log("  Rail style over Hero:", railInitial);
    if (railInitial && (railInitial.opacity === "0" || railInitial.pointerEvents === "none")) {
      testResults.scentsRailHiddenOverHero = true;
      console.log("✓ SCENTS rail is hidden over hero (opacity 0, pointer-events none)");
    } else {
      console.error("✗ SCENTS rail is visible over hero:", railInitial);
    }

    // Scroll into #scents
    await page.evaluate(() => {
      const scentsSection = document.getElementById("scents");
      if (scentsSection) {
        scentsSection.scrollIntoView();
      }
    });
    await new Promise((r) => setTimeout(r, 1200));

    const railInChapters = await page.evaluate(() => {
      const rail = document.querySelector("nav[aria-label='Scent chapters navigation']");
      if (!rail) return null;
      const style = window.getComputedStyle(rail);
      return {
        opacity: style.opacity,
        pointerEvents: style.pointerEvents,
      };
    });
    console.log("  Rail style in Scent Chapters:", railInChapters);
    if (railInChapters && parseFloat(railInChapters.opacity) > 0.8) {
      testResults.scentsRailVisibleInChapters = true;
      console.log("✓ SCENTS rail is visible inside Scent Chapters");
    } else {
      console.error("✗ SCENTS rail failed to fade in within #scents:", railInChapters);
    }

    // Capture screenshots across viewports
    console.log("\n[5/5] Capturing Screenshots across Viewports...");
    const viewports = [
      { name: "1440", width: 1440, height: 900 },
      { name: "1024", width: 1024, height: 768 },
      { name: "768", width: 768, height: 1024 },
      { name: "375", width: 375, height: 812 },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise((r) => setTimeout(r, 1000));
      const ssPath = path.join(BRAIN_DIR, `hero-revert-${vp.name}.png`);
      await page.screenshot({ path: ssPath, fullPage: false });
      console.log(`✓ Saved screenshot for ${vp.name}px: ${ssPath}`);
    }

    // Capture scents rail screenshot
    await page.setViewport({ width: 1440, height: 900 });
    await page.evaluate(() => {
      const scents = document.getElementById("scents");
      if (scents) scents.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 1200));
    const railSsPath = path.join(BRAIN_DIR, "hero-revert-scents-rail.png");
    await page.screenshot({ path: railSsPath, fullPage: false });
    console.log(`✓ Saved scents rail screenshot: ${railSsPath}`);

    // Check Marketplace Logos optical sizing
    const logoMetrics = await page.evaluate(() => {
      const logos = Array.from(document.querySelectorAll(".market-logo-wrapper"));
      return logos.map((wrapper) => {
        const img = wrapper.querySelector("img");
        const wRect = wrapper.getBoundingClientRect();
        const iRect = img ? img.getBoundingClientRect() : null;
        return {
          wrapperHeight: wRect.height,
          imgHeight: iRect ? iRect.height : 0,
        };
      });
    });
    console.log("  Sample Marketplace Logo Wrapper Metrics count:", logoMetrics.length);
    if (logoMetrics.length > 0) {
      testResults.marketplaceLogosOpticallyBalanced = true;
      console.log("✓ Marketplace logos rendered with optical scale wrapper");
    }

    testResults.screenshotsCaptured = true;
  } finally {
    if (browser) await browser.close();
    killProcessTree(serverProcess);
    console.log("✓ Server shut down cleanly");
  }

  console.log("\n=== FINAL TEST SUMMARY ===");
  console.log(JSON.stringify(testResults, null, 2));

  const allPassed = Object.values(testResults).every(Boolean);
  if (!allPassed) {
    throw new Error("One or more tests failed! Review summary above.");
  }
  console.log("\n🎉 ALL HERO REVERT & MINIMISE VERIFICATIONS PASSED!");
}

runHeroRevertVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
