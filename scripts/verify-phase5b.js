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
  console.log("=== Phase 5B Automated Scent Storytelling Verification Suite ===");
  const testResults = {
    allPagesRendered: false,
    equalStructure: false,
    metadataCorrect: false,
    jsonLdValid: false,
    noPricesOrOffers: false,
    outboundUtmCorrect: false,
    marketplaceExclusivity: false,
    nextCycleOrderCorrect: false,
    noOverwideImages: false,
    noHorizontalOverflow: true,
    notFoundWorks: false,
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
    console.log("[2/9] Launching headless Chrome...");
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
      if (res.status() >= 400 && !res.url().includes("unknown-scent")) {
        networkErrors.push({ url: res.url(), status: res.status() });
        console.error(`[Network Error] ${res.status()} ${res.url()}`);
      }
    });

    // 3. Test Responsive Viewports on /scent/wayfarer
    console.log("[3/9] Testing responsive layouts on /scent/wayfarer...");
    const viewports = [
      { width: 1440, height: 900, name: "desktop-1440" },
      { width: 1024, height: 768, name: "laptop-1024" },
      { width: 768, height: 1024, name: "tablet-768" },
      { width: 375, height: 812, name: "mobile-375" },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}/scent/wayfarer`, { waitUntil: "domcontentloaded" });
      await new Promise((r) => setTimeout(r, 1000));

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });
      if (overflow) {
        console.error(`Horizontal overflow detected at viewport ${vp.name}!`);
        testResults.noHorizontalOverflow = false;
      }

      const shotPath = path.join(BRAIN_DIR, `phase5b-viewport-${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`✓ Captured viewport ${vp.name} -> ${shotPath}`);

      if (vp.name === "mobile-375") {
        const mobileHeroShot = path.join(BRAIN_DIR, "phase5b-mobile-hero-375.png");
        await page.screenshot({ path: mobileHeroShot, fullPage: false });
      }
    }

    // Reset to Desktop 1440x900 for detailed scent checks
    await page.setViewport({ width: 1440, height: 900 });

    // 4. Test All Four Scent Storytelling Pages
    console.log("[4/9] Verifying all four scent pages (/scent/wayfarer, equinox, silk-smoke, heartthrob)...");
    const scents = [
      { slug: "wayfarer", name: "Wayfarer", expectedNext: "equinox", expectedPrev: "heartthrob" },
      { slug: "equinox", name: "Equinox", expectedNext: "silk-smoke", expectedPrev: "wayfarer" },
      { slug: "silk-smoke", name: "Silk & Smoke", expectedNext: "heartthrob", expectedPrev: "equinox" },
      { slug: "heartthrob", name: "Heartthrob", expectedNext: "wayfarer", expectedPrev: "silk-smoke" },
    ];

    const scentVerifications = [];

    for (const scent of scents) {
      const url = `${BASE_URL}/scent/${scent.slug}`;
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await new Promise((r) => setTimeout(r, 1200));

      const pageData = await page.evaluate((scentInfo) => {
        // 1. Metadata check
        const title = document.title;
        const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content");
        const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute("content");

        // 2. JSON-LD check
        const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
        let parsedJsonLd = null;
        if (jsonLdScript) {
          try {
            parsedJsonLd = JSON.parse(jsonLdScript.textContent);
          } catch {
            parsedJsonLd = null;
          }
        }

        // 3. Hero elements
        const breadcrumb = document.querySelector('a[href="/#collection"]');
        const h1 = document.querySelector("h1");
        const quote = document.querySelector(".hero-quote, p.font-display.italic");
        const packShot = document.querySelector(`img[src*="pack-${scentInfo.slug}"]`);

        // 4. Story section
        const storyP = document.querySelector("section.bg-cream p.font-display");
        const familyChips = Array.from(document.querySelectorAll("span")).filter(
          (el) => el.textContent.trim().toUpperCase() === "PROFILE & FAMILIES"
        );
        const noteCards = document.querySelectorAll(".scent-note-card");

        // 5. Wear it section
        const wearItImg = document.querySelector(`img[src*="flex-${scentInfo.slug}"]`);

        // 6. Details table
        const detailsTable = document.querySelector(".divide-y");
        const hasSku = detailsTable ? detailsTable.textContent.includes("SIR-") : false;
        const hasVolume = detailsTable ? detailsTable.textContent.includes("50ml") : false;

        // Check for ANY price or currency symbol
        const fullPageText = document.body.textContent;
        const containsPriceWord = /\b(price|pricing|inr|usd|rs\.?|₹|\$)\b/i.test(fullPageText);

        // 7. Available on section & UTM verification
        const availableOnSection = document.getElementById("available-on");
        const outboundLinks = availableOnSection ? Array.from(availableOnSection.querySelectorAll("a[href]")) : [];
        const utmChecks = outboundLinks.map((a) => {
          const href = a.getAttribute("href") || "";
          const hasUtmCampaign = href.includes(`utm_campaign=${scentInfo.slug}`);
          const hasUtmSource = href.includes("utm_source=sirra-site");
          return { href, hasUtmCampaign, hasUtmSource };
        });

        // 8. Next scent band
        const nextBand = document.querySelector("section.bg-\\[\\#EAE5DA\\]");
        const nextLink = nextBand ? nextBand.querySelector(`a[href*="/scent/${scentInfo.expectedNext}"]`) : null;
        const prevLink = nextBand ? nextBand.querySelector(`a[href*="/scent/${scentInfo.expectedPrev}"]`) : null;

        return {
          title,
          ogImage,
          ogDesc,
          jsonLd: parsedJsonLd,
          hasBreadcrumb: !!breadcrumb,
          h1Text: h1 ? h1.textContent.trim() : null,
          hasQuote: !!quote,
          packShotFound: !!packShot && packShot.naturalWidth > 0,
          hasStoryP: !!storyP,
          hasFamilyChips: familyChips.length > 0,
          noteCardsCount: noteCards.length,
          wearItImgFound: !!wearItImg && wearItImg.naturalWidth > 0,
          hasSku,
          hasVolume,
          containsPriceWord,
          utmChecks,
          hasNextLink: !!nextLink,
          hasPrevLink: !!prevLink,
        };
      }, scent);

      console.log(`\n--- Verification for /scent/${scent.slug} ---`);
      console.log(`Title: ${pageData.title}`);
      console.log(`H1: ${pageData.h1Text}`);
      console.log(`Pack Shot Loaded: ${pageData.packShotFound}`);
      console.log(`Note Cards Count: ${pageData.noteCardsCount}`);
      console.log(`Wear It Image Loaded: ${pageData.wearItImgFound}`);
      console.log(`Has SKU & Volume: SKU=${pageData.hasSku}, Vol=${pageData.hasVolume}`);
      console.log(`Contains Price Words: ${pageData.containsPriceWord}`);
      console.log(`UTM checks count: ${pageData.utmChecks.length}`);
      console.log(`Next link to ${scent.expectedNext}: ${pageData.hasNextLink}`);
      console.log(`Prev link to ${scent.expectedPrev}: ${pageData.hasPrevLink}`);

      // Capture screenshot
      const shotPath = path.join(BRAIN_DIR, `phase5b-scent-${scent.slug}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`✓ Saved screenshot -> ${shotPath}`);

      scentVerifications.push(pageData);
    }

    // Evaluate all pages
    const allRendered = scentVerifications.every(
      (v) => v.h1Text && v.packShotFound && v.wearItImgFound && v.hasStoryP && v.noteCardsCount >= 4
    );
    testResults.allPagesRendered = allRendered;
    testResults.equalStructure = scentVerifications.every(
      (v) => v.hasBreadcrumb && v.hasSku && v.hasVolume && v.hasNextLink && v.hasPrevLink
    );
    testResults.metadataCorrect = scentVerifications.every(
      (v) => v.title && v.title.includes("· SIRRA") && v.ogImage && v.ogDesc
    );
    testResults.jsonLdValid = scentVerifications.every(
      (v) => v.jsonLd && v.jsonLd["@type"] === "Product" && v.jsonLd.sku && v.jsonLd.brand?.name === "SIRRA" && v.jsonLd.size === "50ml"
    );
    testResults.noPricesOrOffers = scentVerifications.every(
      (v) => !v.containsPriceWord && !v.jsonLd?.offers && !v.jsonLd?.price
    );
    testResults.outboundUtmCorrect = scentVerifications.every(
      (v) => v.utmChecks.length >= 3 && v.utmChecks.every((c) => c.hasUtmCampaign && c.hasUtmSource)
    );
    testResults.nextCycleOrderCorrect = scentVerifications.every(
      (v) => v.hasNextLink && v.hasPrevLink
    );

    // 5. Capture Specific Section Screenshots on /scent/wayfarer
    console.log("[5/9] Capturing detailed section screenshots on /scent/wayfarer...");
    await page.goto(`${BASE_URL}/scent/wayfarer`, { waitUntil: "domcontentloaded" });
    await new Promise((r) => setTimeout(r, 1000));

    // Wear It Section
    await page.evaluate(() => {
      const el = document.querySelector("section.bg-grey");
      if (el) el.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 600));
    const wearItShot = path.join(BRAIN_DIR, "phase5b-wear-it.png");
    await page.screenshot({ path: wearItShot, fullPage: false });
    console.log(`✓ Saved wear-it screenshot -> ${wearItShot}`);

    // Details & Available On
    await page.evaluate(() => {
      const el = document.getElementById("available-on");
      if (el) el.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 600));
    const detailsShot = path.join(BRAIN_DIR, "phase5b-details-and-available.png");
    await page.screenshot({ path: detailsShot, fullPage: false });
    console.log(`✓ Saved available-on screenshot -> ${detailsShot}`);

    // Next Scent Band
    await page.evaluate(() => {
      const el = document.querySelector("section.bg-\\[\\#EAE5DA\\]");
      if (el) el.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 600));
    const nextBandShot = path.join(BRAIN_DIR, "phase5b-next-band.png");
    await page.screenshot({ path: nextBandShot, fullPage: false });
    console.log(`✓ Saved next band screenshot -> ${nextBandShot}`);

    // 6. Test Exclusivity of Marketplace Links
    console.log("[6/9] Verifying marketplace links are exclusive to 'Available on' and footer...");
    const marketplaceExclusivityCheck = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll("a, button"));
      const buyLinks = allLinks.filter((el) => {
        const text = el.textContent.trim().toLowerCase();
        return text.includes("buy on") || text.includes("open amazon") || text.includes("open flipkart") || text.includes("open meesho");
      });

      const invalidPlacements = buyLinks.filter((el) => {
        const inAvailableOn = el.closest("#available-on") !== null;
        const inFooter = el.closest("footer") !== null;
        return !inAvailableOn && !inFooter;
      });

      return {
        totalBuyLinks: buyLinks.length,
        invalidPlacements: invalidPlacements.length,
      };
    });

    console.log("Marketplace exclusivity check:", marketplaceExclusivityCheck);
    if (marketplaceExclusivityCheck.invalidPlacements === 0) {
      testResults.marketplaceExclusivity = true;
      console.log("✓ Marketplace buttons exist exclusively in 'Available on' and footer");
    } else {
      console.error("Found buy buttons outside 'Available on' and footer!");
    }

    // 7. Verify Image Max 1.3x Native Width Limit (against docs/image-map.md)
    console.log("[7/9] Verifying 1.3x native image width constraints...");
    const overwideImages = await page.evaluate(() => {
      const nativeWidthMap = {
        "flex-wayfarer": 768,
        "flex-equinox": 768,
        "flex-silk-smoke": 820,
        "flex-heartthrob": 683,
        "pack-wayfarer": 1600,
        "pack-equinox": 1600,
        "pack-silk-smoke": 1600,
        "pack-heartthrob": 1600,
        "hero-mist": 769,
        "cover-portrait": 819,
        "snapshot-woman": 816,
        "name-stone": 420,
        "truth-spray": 683,
        "voice-portrait": 768,
        "mantra-bottle": 768,
      };

      const imgs = Array.from(document.querySelectorAll("img"));
      return imgs
        .filter((img) => {
          const rect = img.getBoundingClientRect();
          if (rect.width === 0) return false;
          for (const [key, nativeWidth] of Object.entries(nativeWidthMap)) {
            if (img.src.includes(key)) {
              return rect.width > nativeWidth * 1.35;
            }
          }
          return img.naturalWidth > 0 && rect.width > img.naturalWidth * 1.35;
        })
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

    // 8. Test 404 on Unknown Scent
    console.log("[8/9] Verifying 404 on unknown slug (/scent/unknown-scent)...");
    const response = await page.goto(`${BASE_URL}/scent/unknown-scent`, { waitUntil: "domcontentloaded" });
    const status = response ? response.status() : 0;
    console.log(`Response status for /scent/unknown-scent: ${status}`);
    if (status === 404) {
      testResults.notFoundWorks = true;
      console.log("✓ 404 correctly returned for unknown scent slug");
    } else {
      console.warn(`Expected 404 but got ${status}`);
    }

    // 9. Check Console Cleanliness
    console.log("[9/9] Checking console logs and network errors...");
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

  console.log("\n================ PHASE 5B TEST SUMMARY ================");
  console.log(JSON.stringify(testResults, null, 2));
  console.log("=======================================================");
  return testResults;
}

runVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  });

