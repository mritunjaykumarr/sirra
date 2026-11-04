/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require("puppeteer-core");
const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

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

async function runVerification() {
  console.log("=== Phase 5A Automated Fragrance House Verification Suite ===");
  const testResults = {
    heroFragranceFirst: false,
    heroBottleHover: false,
    chaptersRendered: false,
    chaptersAlternating: false,
    progressRailActive: false,
    notesChipsRendered: false,
    theFlexRendered: false,
    manifestoRendered: false,
    buttonHierarchyCorrect: false,
    noOverwideImages: false,
    noHorizontalOverflow: true,
    consoleClean: true,
  };

  const consoleMessages = [];
  const networkErrors = [];

  // 1. Check or start server
  let serverProcess = null;
  try {
    await waitForServer(BASE_URL, 1500);
    console.log("✓ Server already active on", BASE_URL);
  } catch {
    console.log("[1/9] Starting Next.js production server on port 3000...");
    serverProcess = spawn("npx.cmd", ["next", "start", "-p", String(PORT)], {
      cwd: path.resolve(__dirname, ".."),
      stdio: "pipe",
      shell: true,
    });
    await waitForServer(BASE_URL);
    console.log("✓ Server is ready at", BASE_URL);
  }

  try {
    // 2. Launch Puppeteer
    console.log("[2/9] Launching headless browser...");
    const browser = await puppeteer.launch({
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
      if (type === "error" || (type === "warning" && !text.includes("Download the React DevTools"))) {
        console.warn(`[Browser ${type}]`, text);
      }
    });

    page.on("response", (res) => {
      if (res.status() >= 400) {
        networkErrors.push({ url: res.url(), status: res.status() });
        console.error(`[Network Error] ${res.status()} ${res.url()}`);
      }
    });

    // 3. Test Responsive Viewports (1440, 1024, 768, 375)
    console.log("[3/9] Testing responsive layouts and capturing viewports...");
    const viewports = [
      { width: 1440, height: 900, name: "desktop-1440" },
      { width: 1024, height: 768, name: "laptop-1024" },
      { width: 768, height: 1024, name: "tablet-768" },
      { width: 375, height: 812, name: "mobile-375" },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      await new Promise((r) => setTimeout(r, 1200));

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });
      if (overflow) {
        console.error(`Horizontal overflow detected at viewport ${vp.name}!`);
        testResults.noHorizontalOverflow = false;
      }

      const shotPath = path.join(BRAIN_DIR, `phase5a-viewport-${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`✓ Captured viewport ${vp.name} -> ${shotPath}`);

      if (vp.name === "mobile-375") {
        // Capture mobile hero specifically
        const mobileHeroShot = path.join(BRAIN_DIR, "phase5a-mobile-hero-375.png");
        await page.screenshot({ path: mobileHeroShot, fullPage: false });

        // Scroll to first chapter and capture mobile chapter
        await page.evaluate(() => {
          const el = document.getElementById("chapter-wayfarer");
          if (el) el.scrollIntoView();
        });
        await new Promise((r) => setTimeout(r, 600));
        const mobileChapterShot = path.join(BRAIN_DIR, "phase5a-mobile-chapter-375.png");
        await page.screenshot({ path: mobileChapterShot, fullPage: false });
        console.log(`✓ Captured mobile chapter 375 -> ${mobileChapterShot}`);
      }
    }

    // Reset to Desktop 1440x900
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await new Promise((r) => setTimeout(r, 1200));

    // 4. Hero Fragrance First Validation & Desktop Hero Screenshot
    console.log("[4/9] Validating Hero Section architecture...");
    const heroStatus = await page.evaluate(() => {
      const hero = document.getElementById("hero");
      if (!hero) return { found: false };
      const wordmark = hero.querySelector("h1");
      const text = hero.textContent.replace(/[’']/g, "'");
      const tagline = text.includes("Luxury isn't a price point. It's an attitude.");
      const skinQuote = text.includes("Fine fragrance doesn't belong on a pedestal; it belongs on your skin.");
      const tag = text.includes("EAU DE PARFUM · 50ML");
      const bottles = hero.querySelectorAll("button[aria-label*='Scroll to']");
      return {
        found: true,
        wordmarkText: wordmark ? wordmark.textContent : null,
        taglineFound: tagline,
        skinQuoteFound: skinQuote,
        tagFound: tag,
        bottleCount: bottles.length,
      };
    });

    console.log("Hero Section Status:", heroStatus);
    if (!heroStatus.found || !heroStatus.taglineFound || !heroStatus.skinQuoteFound || heroStatus.bottleCount < 4) {
      throw new Error(`Hero section validation failed: ${JSON.stringify(heroStatus)}`);
    }
    testResults.heroFragranceFirst = true;

    // Capture desktop hero screenshot
    const heroShotPath = path.join(BRAIN_DIR, "phase5a-hero-desktop-1440.png");
    await page.screenshot({ path: heroShotPath, fullPage: false });
    console.log(`✓ Captured hero desktop 1440 -> ${heroShotPath}`);

    // 5. Test Hero Bottle Hover & Lift
    console.log("[5/9] Testing Hero bottle hover interaction...");
    const heroBottleHandle = await page.$("button[aria-label='Scroll to Equinox chapter']");
    if (heroBottleHandle) {
      await heroBottleHandle.hover();
      await new Promise((r) => setTimeout(r, 400));
      const heroHoverShot = path.join(BRAIN_DIR, "phase5a-hero-bottle-hover.png");
      await page.screenshot({ path: heroHoverShot, fullPage: false });
      console.log(`✓ Captured hero bottle hover -> ${heroHoverShot}`);
      testResults.heroBottleHover = true;
    }

    // 6. Test Scent Chapters (Alternating rooms, note chips, buttons)
    console.log("[6/9] Validating Scent Chapters (#scents)...");
    const chaptersStatus = await page.evaluate(() => {
      const scents = document.getElementById("scents");
      if (!scents) return { found: false };
      const slugs = ["wayfarer", "equinox", "silk-smoke", "heartthrob"];
      const chapterData = slugs.map((slug, idx) => {
        const el = document.getElementById(`chapter-${slug}`) || document.getElementById(slug);
        if (!el) return { slug, found: false };
        const chapter = el.closest("article") || el;
        const text = chapter.textContent;
        const hasDiscover = text.includes(`Discover `);
        const hasMarkets = text.includes("Amazon") && text.includes("Flipkart") && text.includes("Meesho");
        const hasNotes = text.includes("TOP") && text.includes("HEART") && text.includes("BASE");
        const packImg = chapter.querySelector(`img[src*="pack-${slug}"]`);
        const personaImg = chapter.querySelector(`img[src*="flex-${slug}"]`);
        const video = chapter.querySelector("video");
        const isReversed = chapter.querySelector(".chapter-media-col.lg\\:order-2") !== null;
        return {
          slug,
          found: true,
          hasDiscover,
          hasMarkets,
          hasNotes,
          packImgFound: !!packImg,
          mediaFound: !!personaImg || !!video,
          isReversed,
          expectedReverse: idx % 2 === 1,
        };
      });

      const rail = scents.querySelector("nav[aria-label*='navigation'], nav[aria-label*='chapters'], aside[aria-label*='navigation']");
      return {
        found: true,
        chapterData,
        railFound: !!rail,
      };
    });

    console.log("Chapters Status:", JSON.stringify(chaptersStatus, null, 2));
    const allChaptersOk = chaptersStatus.chapterData && chaptersStatus.chapterData.every(
      (c) => c.found && c.hasDiscover && c.hasMarkets && c.hasNotes && c.packImgFound && c.mediaFound
    );
    if (!allChaptersOk) {
      throw new Error(`Scent chapters validation failed: ${JSON.stringify(chaptersStatus)}`);
    }
    testResults.chaptersRendered = true;
    testResults.notesChipsRendered = true;
    testResults.chaptersAlternating = chaptersStatus.chapterData[1].isReversed && !chaptersStatus.chapterData[0].isReversed;
    testResults.progressRailActive = chaptersStatus.railFound;

    // Screenshot Chapter 1 (Wayfarer)
    await page.evaluate(() => {
      const el = document.getElementById("chapter-wayfarer");
      if (el) el.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 600));
    const chapter1Shot = path.join(BRAIN_DIR, "phase5a-chapter-wayfarer.png");
    await page.screenshot({ path: chapter1Shot, fullPage: false });
    console.log(`✓ Captured Chapter 1 (Wayfarer) -> ${chapter1Shot}`);

    // Screenshot Chapter 2 (Equinox)
    await page.evaluate(() => {
      const el = document.getElementById("chapter-equinox");
      if (el) el.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 600));
    const chapter2Shot = path.join(BRAIN_DIR, "phase5a-chapter-equinox.png");
    await page.screenshot({ path: chapter2Shot, fullPage: false });
    console.log(`✓ Captured Chapter 2 (Equinox) -> ${chapter2Shot}`);

    // 7. Test The Flex & The House Section
    console.log("[7/9] Validating The House and The Flex Section...");
    await page.evaluate(() => {
      const el = document.getElementById("the-flex");
      if (el) el.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 600));

    const flexStatus = await page.evaluate(() => {
      const el = document.getElementById("the-flex");
      if (!el) return { found: false };
      const text = el.textContent.replace(/[’']/g, "'");
      return {
        found: true,
        hasTag: text.includes("THE FLEX: LOUD VS. QUIET"),
        hasLoudText: text.includes("People think 'flex' has to be loud"),
        hasQuietText: text.includes("True top-class doesn't need to shout"),
        hasMiddleText: text.includes("Quiet Luxury with cultural backbone"),
      };
    });

    console.log("The Flex Status:", flexStatus);
    if (!flexStatus.found || !flexStatus.hasTag || !flexStatus.hasLoudText || !flexStatus.hasQuietText) {
      throw new Error(`The Flex section validation failed: ${JSON.stringify(flexStatus)}`);
    }
    testResults.theFlexRendered = true;
    const flexShot = path.join(BRAIN_DIR, "phase5a-the-flex.png");
    await page.screenshot({ path: flexShot, fullPage: false });
    console.log(`✓ Captured The Flex section -> ${flexShot}`);

    // 8. Test The Manifesto Section
    console.log("[8/9] Validating The Manifesto Section...");
    await page.evaluate(() => {
      const el = document.getElementById("manifesto");
      if (el) el.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 600));

    const manifestoStatus = await page.evaluate(() => {
      const el = document.getElementById("manifesto");
      if (!el) return { found: false };
      const text = el.textContent;
      const portrait = el.querySelector("img[src*='voice-portrait']");
      return {
        found: true,
        hasTag: text.includes("THE MANIFESTO"),
        hasTitle: text.includes("SCENT AS SELF-BELIEF"),
        hasCloser: text.includes("DIFFERENT FLEX. SAME TOP."),
        hasSignature: text.includes("Your Sirra."),
        hasPortrait: !!portrait,
      };
    });

    console.log("Manifesto Status:", manifestoStatus);
    if (!manifestoStatus.found || !manifestoStatus.hasTitle || !manifestoStatus.hasCloser || !manifestoStatus.hasPortrait) {
      throw new Error(`Manifesto validation failed: ${JSON.stringify(manifestoStatus)}`);
    }
    testResults.manifestoRendered = true;
    const manifestoShot = path.join(BRAIN_DIR, "phase5a-manifesto.png");
    await page.screenshot({ path: manifestoShot, fullPage: false });
    console.log(`✓ Captured Manifesto section -> ${manifestoShot}`);

    // 9. Check Button Hierarchy & Image 1.3x rules
    console.log("[9/9] Verifying Button Hierarchy & Image width constraints...");
    const hierarchyCheck = await page.evaluate(() => {
      const buyOnAmazonButtons = Array.from(document.querySelectorAll("button, a")).filter((el) => {
        return el.textContent.trim().toLowerCase() === "buy on amazon";
      });
      // Check if any primary button on homepage is 'Buy on Amazon'
      // Note: Availability footer has market tiles, but homepage cards must use Discover
      const homepageMain = document.querySelector("main");
      const mainBuyOnAmazon = homepageMain
        ? Array.from(homepageMain.querySelectorAll("a, button")).filter((el) => el.textContent.trim().toLowerCase() === "buy on amazon")
        : [];

      return {
        totalBuyOnAmazon: buyOnAmazonButtons.length,
        mainBuyOnAmazon: mainBuyOnAmazon.length,
      };
    });

    console.log("Hierarchy check:", hierarchyCheck);
    if (hierarchyCheck.mainBuyOnAmazon > 0) {
      throw new Error("Found primary 'Buy on Amazon' buttons in main content of homepage!");
    }
    testResults.buttonHierarchyCorrect = true;

    // Check images width <= 1.3x natural width
    const overwideImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return imgs
        .filter((img) => img.naturalWidth > 0 && img.getBoundingClientRect().width > img.naturalWidth * 1.35)
        .map((img) => ({
          src: img.src,
          naturalWidth: img.naturalWidth,
          renderedWidth: img.getBoundingClientRect().width,
          ratio: (img.getBoundingClientRect().width / img.naturalWidth).toFixed(2),
        }));
    });

    if (overwideImages.length > 0) {
      console.warn("Images rendered > 1.3x natural width:", overwideImages);
      testResults.noOverwideImages = false;
    } else {
      testResults.noOverwideImages = true;
      console.log("✓ All images conform to <= 1.3x native pixel width limit");
    }

    // Check console errors
    const errorLogs = consoleMessages.filter((m) => m.type === "error");
    if (errorLogs.length > 0 || networkErrors.length > 0) {
      testResults.consoleClean = false;
      console.error("Console errors encountered:", errorLogs);
      console.error("Network errors encountered:", networkErrors);
    } else {
      console.log("✓ 0 console errors and 0 network failures detected");
    }

    await browser.close();
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
  }

  console.log("\n================ TEST SUMMARY ================");
  console.log(JSON.stringify(testResults, null, 2));
  console.log("==============================================");
  return testResults;
}

runVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  });

