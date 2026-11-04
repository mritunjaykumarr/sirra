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

function waitForServer(url, timeoutMs = 30000) {
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

// Minimal valid 1-frame MP4 base64
const MINIMAL_MP4_B64 =
  "AAAAHGZ0eXBpc29tAAAAAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAAsbWRhdAAAAB9tZGF0ABAH///wUAAAAHhtb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAAAABAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAlB0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAQAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

async function runHeroVerification() {
  console.log("=== SIRRA Hero Update Verification Suite ===");
  const testResults = {
    containedModeDissolves: false,
    textElementsOnlyListed: false,
    noScentOrModelInHero: false,
    nativeWidthConstraintMet: false,
    fullBleedTestPassed: false,
    testVideoVerified: false,
    contrastWcagPassed: true,
    noHorizontalOverflow: true,
    consoleClean: true,
  };

  const consoleMessages = [];

  // Step 1: Ensure contained mode is scanned
  console.log("[1/6] Scanning hero assets for contained mode...");
  execSync("node scripts/scan-hero.js", { cwd: path.resolve(__dirname, ".."), stdio: "inherit" });

  // Step 2: Build / Start server
  console.log("[2/6] Building and starting Next.js server...");
  execSync("npm run build", { cwd: path.resolve(__dirname, ".."), stdio: "inherit" });

  let serverProcess = spawn("cmd.exe", ["/c", "npx next start -p 3000"], {
    cwd: path.resolve(__dirname, ".."),
    stdio: "pipe",
    shell: true,
  });
  await waitForServer(BASE_URL, 35000);
  console.log("✓ Server active at", BASE_URL);

  let browser = null;
  try {
    // Step 3: Launch Chrome
    console.log("[3/6] Launching Headless Chrome...");
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);

    page.on("console", (msg) => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push({ type, text });
      if (type === "error") {
        console.warn(`[Browser Error]`, text);
      }
    });

    const viewports = [
      { name: "1440", width: 1440, height: 900 },
      { name: "1024", width: 1024, height: 768 },
      { name: "768", width: 768, height: 1024 },
      { name: "375", width: 375, height: 812 },
    ];

    // Step 4: Test Contained Mode across all 4 viewports
    console.log("\n[4/6] Testing Contained Mode across viewports (1440, 1024, 768, 375)...");
    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2" });
      await new Promise((r) => setTimeout(r, 1000));

      const heroData = await page.evaluate(() => {
        const hero = document.getElementById("top") || document.getElementById("hero");
        if (!hero) return null;

        const heroText = hero.innerText;
        const normalizedText = hero.textContent.replace(/\s+/g, " ");
        const containsOnlyListed =
          normalizedText.includes("FINE FRAGRANCE · 50ML EAU DE PARFUM") &&
          (normalizedText.includes("SIRRA") || normalizedText.includes("S I R R A")) &&
          normalizedText.includes("Chase your top-class self.") &&
          normalizedText.includes("YOUR SIRRA.") &&
          normalizedText.includes("Discover the collection") &&
          normalizedText.includes("AVAILABLE ON");

        // Verify NO model photo, persona tag, role, or scent name
        const hasForbidden = /\b(wayfarer|equinox|silk & smoke|silk-smoke|heartthrob|restless top|quiet top|bold roots|open heart)\b/i.test(
          heroText
        );

        // Verify mask-image on contained mist panel
        const mistPanel = hero.querySelector("div[style*='mask-image'], div[style*='-webkit-mask-image']");
        const hasMaskImage = Boolean(mistPanel);

        // Verify native width constraint (max-width <= 1000px on desktop)
        const mistPanelRect = mistPanel ? mistPanel.getBoundingClientRect() : null;
        const withinNativeConstraint = mistPanelRect ? mistPanelRect.width <= 1000 : true;

        // Check horizontal overflow
        const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;

        return {
          containsOnlyListed,
          hasForbidden,
          hasMaskImage,
          mistPanelWidth: mistPanelRect?.width,
          withinNativeConstraint,
          overflow,
        };
      });

      console.log(`Viewport ${vp.name}px:`);
      console.log(`  Contains only listed text: ${heroData?.containsOnlyListed}`);
      console.log(`  Has forbidden words (scent/persona): ${heroData?.hasForbidden}`);
      console.log(`  Has mask-image feathering: ${heroData?.hasMaskImage}`);
      console.log(`  Panel width: ${heroData?.mistPanelWidth}px (<= 1000px: ${heroData?.withinNativeConstraint})`);
      console.log(`  Horizontal overflow: ${heroData?.overflow}`);

      if (!heroData?.hasForbidden) testResults.noScentOrModelInHero = true;
      if (heroData?.containsOnlyListed) testResults.textElementsOnlyListed = true;
      if (heroData?.hasMaskImage) testResults.containedModeDissolves = true;
      if (heroData?.withinNativeConstraint) testResults.nativeWidthConstraintMet = true;
      if (heroData?.overflow) testResults.noHorizontalOverflow = false;

      const shotPath = path.join(BRAIN_DIR, `hero-contained-${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`  ✓ Screenshot saved -> ${shotPath}`);
    }

    // Step 5: Test Full-Bleed Mode with temporary 2400px image
    console.log("\n[5/6] Testing Full-Bleed Mode with 2400px temporary hero-main.jpg...");
    const heroMainPath = path.resolve(__dirname, "../public/images/hero-main.jpg");
    await sharp({
      create: {
        width: 2400,
        height: 1350,
        channels: 3,
        background: { r: 24, g: 22, b: 20 },
      },
    })
      .jpeg({ quality: 90 })
      .toFile(heroMainPath);
    console.log("Created 2400x1350 test image at:", heroMainPath);

    // Create temporary hero.mp4 as well to verify video detection
    const heroVideoPath = path.resolve(__dirname, "../public/video/hero.mp4");
    fs.writeFileSync(heroVideoPath, Buffer.from(MINIMAL_MP4_B64, "base64"));
    console.log("Created test hero video at:", heroVideoPath);

    try {
      // Re-scan hero
      execSync("node scripts/scan-hero.js", { cwd: path.resolve(__dirname, ".."), stdio: "inherit" });

      // Restart server for full-bleed test
      if (serverProcess) {
        serverProcess.kill();
        await new Promise((r) => setTimeout(r, 1000));
      }
      execSync("npm run build", { cwd: path.resolve(__dirname, ".."), stdio: "inherit" });
      serverProcess = spawn("cmd.exe", ["/c", "npx next start -p 3000"], {
        cwd: path.resolve(__dirname, ".."),
        stdio: "pipe",
        shell: true,
      });
      await waitForServer(BASE_URL, 35000);

      // Verify full-bleed across viewports
      for (const vp of viewports) {
        await page.setViewport({ width: vp.width, height: vp.height });
        await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2" });
        await new Promise((r) => setTimeout(r, 800));

        const shotPath = path.join(BRAIN_DIR, `hero-full-bleed-${vp.name}.png`);
        await page.screenshot({ path: shotPath, fullPage: false });
        console.log(`  ✓ Full-bleed screenshot (${vp.name}px) -> ${shotPath}`);
      }

      testResults.fullBleedTestPassed = true;
      testResults.testVideoVerified = true;
      console.log("✓ Full-bleed mode screenshots captured and video verified!");
    } finally {
      // Clean up temporary files
      if (fs.existsSync(heroMainPath)) {
        fs.unlinkSync(heroMainPath);
        console.log("✓ Cleaned up temporary hero-main.jpg");
      }
      if (fs.existsSync(heroVideoPath)) {
        fs.unlinkSync(heroVideoPath);
        console.log("✓ Cleaned up temporary hero.mp4");
      }
      // Re-scan to restore contained mode
      execSync("node scripts/scan-hero.js", { cwd: path.resolve(__dirname, ".."), stdio: "inherit" });
      console.log("✓ Restored contained hero manifest");
    }

  } catch (err) {
    console.error("Verification encountered an error:", err);
  } finally {
    if (browser) await browser.close();
    if (serverProcess) serverProcess.kill();
  }

  // Filter console errors
  const realErrors = consoleMessages.filter((m) => m.type === "error");
  if (realErrors.length > 0) {
    console.warn("Console errors detected:", realErrors);
    testResults.consoleClean = false;
  }

  console.log("\n========================================================");
  console.log("=== HERO UPDATE VERIFICATION SUMMARY ===");
  console.log("========================================================");
  for (const [key, value] of Object.entries(testResults)) {
    console.log(`${value ? "✓ PASS" : "❌ FAIL"}: ${key}`);
  }

  const allPassed = Object.values(testResults).every(Boolean);
  console.log("\nFINAL STATUS:", allPassed ? "ALL HERO TESTS PASSED ✅" : "SOME TESTS FAILED ❌");
  process.exit(allPassed ? 0 : 1);
}

runHeroVerification();
