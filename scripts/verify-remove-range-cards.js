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
  // Always ensure port is clean for fresh test
  try {
    const { execSync } = require("child_process");
    const out = execSync(`netstat -ano | findstr :${PORT}`).toString();
    const lines = out.split("\n").filter((l) => l.includes("LISTENING"));
    for (const l of lines) {
      const parts = l.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        try { execSync(`taskkill /F /PID ${pid}`); } catch {}
      }
    }
    await new Promise((r) => setTimeout(r, 1000));
  } catch {}

  console.log(`Starting Next.js production server on port ${PORT}...`);
  const nextBin = path.resolve(__dirname, "..", "node_modules", "next", "dist", "bin", "next");
  const server = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
  });

  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await isPortOpen(PORT)) {
      console.log(`Server ready on port ${PORT}`);
      return server;
    }
  }
  throw new Error("Server failed to start in 20s");
}


async function run() {
  console.log("=== Starting Remove Range Cards Verification ===");
  const server = await startServerIfNeeded();

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const report = {
    consoleErrors: [],
    viewports: {},
    beat4RemovedFromRange: false,
    beat5FollowsBeat3: false,
    scentsIntroIntact: false,
    menuLinkFourFlexesScents: false,
    hashRangeRedirectsToScents: false,
  };

  const VIEWPORTS = [
    { name: "1440x900", width: 1440, height: 900 },
    { name: "1440x700", width: 1440, height: 700 },
    { name: "1024x768", width: 1024, height: 768 },
    { name: "768x1024", width: 768, height: 1024 },
    { name: "375x667", width: 375, height: 667 },
  ];

  try {
    const page = await browser.newPage();

    page.on("console", (msg) => {
      console.log(`[Browser ${msg.type()}]: ${msg.text()}`);
      if (msg.type() === "error") {
        const text = msg.text();
        report.consoleErrors.push(text);
      }
    });

    page.on("pageerror", (err) => {
      console.error(`[Browser PageError]: ${err.message}`);
      report.consoleErrors.push(err.message);
    });

    // 1. Initial Load & Component Structure Check
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await page.waitForSelector("#range", { timeout: 10000 });
    await page.waitForSelector("#scents", { timeout: 10000 });

    // Structure checks
    const structureCheck = await page.evaluate(() => {
      const range = document.getElementById("range");
      if (!range) return { exists: false };

      const clean = (s) => (s || "").toLowerCase().replace(/[’'“”"]/g, "").replace(/\s+/g, " ").trim();
      const rangeText = clean(range.textContent);

      // Beat 4 checks in #range
      const hasBeat4Tag = rangeText.includes("one idea") && rangeText.includes("four flexes");
      const hasBeat4Intro = rangeText.includes("every sirra scent is a different route");
      const packShotsInRange = range.querySelectorAll("img[src*='pack-']").length;
      const rangeCards = range.querySelectorAll("[data-range-card]");

      // Beat 1, 2, 3, 5 checks
      const hasBeat1 = rangeText.includes("sirra means the top");
      const hasBeat2 = rangeText.includes("sirra isnt a soft word") && rangeText.includes("means the peak");
      const hasBeat3 = rangeText.includes("room simply agreed");
      const hasBeat5 = rangeText.includes("different flex") && rangeText.includes("same top");
      const hasYourSirra = rangeText.includes("your sirra");

      // Check #scents intro
      const scents = document.getElementById("scents");
      const scentsText = scents ? clean(scents.textContent) : "";
      const scentsHasHeading = scentsText.includes("one idea") && scentsText.includes("four flexes");
      const scentsHasIntro = scentsText.includes("every sirra scent is a different route to the same place");

      return {
        exists: true,
        beat4TagFound: hasBeat4Tag,
        beat4IntroFound: hasBeat4Intro,
        packShotsInRange,
        rangeCardsCount: rangeCards.length,
        hasBeat1,
        hasBeat2,
        hasBeat3,
        hasBeat5,
        hasYourSirra,
        scentsHasHeading,
        scentsHasIntro,
      };
    });

    report.beat4RemovedFromRange = !structureCheck.beat4TagFound && !structureCheck.beat4IntroFound && structureCheck.packShotsInRange === 0 && structureCheck.rangeCardsCount === 0;
    report.beat5FollowsBeat3 = structureCheck.hasBeat1 && structureCheck.hasBeat2 && structureCheck.hasBeat3 && structureCheck.hasBeat5 && structureCheck.hasYourSirra;
    report.scentsIntroIntact = structureCheck.scentsHasHeading && structureCheck.scentsHasIntro;

    console.log(`\n--- Structural Verifications ---`);
    console.log(`Structure detail:`, JSON.stringify(structureCheck));
    console.log(`Beat 4 completely removed from #range: ${report.beat4RemovedFromRange ? "PASS" : "FAIL"}`);
    console.log(`Beat 1, 2, 3 and 5 intact in #range: ${report.beat5FollowsBeat3 ? "PASS" : "FAIL"}`);
    console.log(`#scents has sole "ONE IDEA · FOUR FLEXES" intro: ${report.scentsIntroIntact ? "PASS" : "FAIL"}`);

    // 2. Viewport Checks & Screenshots
    for (const vp of VIEWPORTS) {
      console.log(`\n--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(BASE_URL, { waitUntil: "networkidle0" });
      await new Promise((r) => setTimeout(r, 600));

      // Scroll to #range
      await page.evaluate(() => {
        const el = document.getElementById("range");
        if (el) el.scrollIntoView({ behavior: "instant" });
      });
      await new Promise((r) => setTimeout(r, 500));

      const rangeMetrics = await page.evaluate(() => {
        const el = document.getElementById("range");
        const scents = document.getElementById("scents");
        const rect = el ? el.getBoundingClientRect() : null;
        const scentsRect = scents ? scents.getBoundingClientRect() : null;
        return {
          rangeHeight: rect ? Math.round(rect.height) : 0,
          rangeTop: rect ? Math.round(rect.top) : 0,
          scentsTop: scentsRect ? Math.round(scentsRect.top) : 0,
        };
      });

      // Scroll so Beat 5 is visible right before #scents
      await page.evaluate(() => {
        const beat5 = document.querySelector(".range-beat-5") || document.querySelector("h2:has-text('DIFFERENT FLEX')");
        if (beat5) beat5.scrollIntoView({ behavior: "instant", block: "center" });
      });
      await new Promise((r) => setTimeout(r, 600));

      const screenshotPath = path.join(BRAIN_DIR, `verify-range-cards-removed-${vp.name}.png`);
      await page.screenshot({ path: screenshotPath });
      console.log(`Saved screenshot: ${screenshotPath}`);

      report.viewports[vp.name] = {
        rangeHeight: rangeMetrics.rangeHeight,
        screenshot: screenshotPath,
      };
      console.log(`Viewport ${vp.name}: Range height = ${rangeMetrics.rangeHeight}px`);
    }

    // 3. Test Menu Overlay "Four flexes" Link
    console.log(`\n--- Testing Menu Drawer "Four flexes" Navigation ---`);
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 600));

    // Open menu
    const menuOpened = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find((b) => b.innerText.includes("MENU") || b.getAttribute("aria-label")?.includes("menu"));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log(`Menu opened: ${menuOpened}`);
    await new Promise((r) => setTimeout(r, 800));

    // Inspect "Four flexes" link
    const fourFlexesHref = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a, button"));
      const link = links.find((l) => l.innerText.includes("Four flexes") || l.innerText.includes("FOUR FLEXES"));
      return link ? link.getAttribute("href") : null;
    });

    console.log(`Menu 'Four flexes' href attribute: ${fourFlexesHref}`);
    report.menuLinkFourFlexesScents = fourFlexesHref === "/#scents" || fourFlexesHref === "#scents";

    // Wait for the drawer link to be visible and click it
    await page.waitForSelector("a[href='/#scents']", { visible: true, timeout: 5000 });
    const clickedLink = await page.evaluate(() => {
      const link = document.querySelector("a[href='/#scents']");
      if (link) {
        link.click();
        return true;
      }
      return false;
    });
    console.log(`Called link.click() on 'Four flexes' link: ${clickedLink}`);
    // Wait for smooth scroll animation to finish
    let prevY = -1;
    let sameCount = 0;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 200));
      const currY = await page.evaluate(() => Math.round(window.scrollY));
      console.log(`Scroll check ${i}: scrollY = ${currY}px`);
      if (currY === prevY && currY > 500) {
        sameCount++;
        if (sameCount >= 4) {
          console.log(`Scroll animation settled at scrollY: ${currY}px`);
          break;
        }
      } else {
        sameCount = 0;
      }
      prevY = currY;
    }
    await new Promise((r) => setTimeout(r, 400));

    // Check where we landed
    const landedScentsOffset = await page.evaluate(() => {
      const scents = document.getElementById("scents");
      if (!scents) return null;
      const rect = scents.getBoundingClientRect();
      return Math.round(rect.top);
    });

    console.log(`Landed at #scents rect.top: ${landedScentsOffset}px (expected around 70px)`);
    const menuNavPassed = landedScentsOffset !== null && Math.abs(landedScentsOffset - 70) <= 25;
    console.log(`Menu click navigation to #scents with offset: ${menuNavPassed ? "PASS" : "FAIL"}`);

    // 4. Test URL Hash Redirect: /#range -> #scents
    console.log(`\n--- Testing /#range Hash Redirect to #scents ---`);
    await page.goto(`${BASE_URL}/#range`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1500));

    const hashRedirectOffset = await page.evaluate(() => {
      const scents = document.getElementById("scents");
      if (!scents) return null;
      const rect = scents.getBoundingClientRect();
      return Math.round(rect.top);
    });

    console.log(`Hash /#range redirect landed at #scents rect.top: ${hashRedirectOffset}px`);
    report.hashRangeRedirectsToScents = hashRedirectOffset !== null && Math.abs(hashRedirectOffset - 70) <= 30;
    console.log(`Hash redirect to #scents: ${report.hashRangeRedirectsToScents ? "PASS" : "FAIL"}`);

    // Take screenshot of #scents landing
    const scentsScreenshot = path.join(BRAIN_DIR, "verify-scents-landing.png");
    await page.screenshot({ path: scentsScreenshot });
    console.log(`Saved screenshot: ${scentsScreenshot}`);

    // Write final summary data
    const dataReportPath = path.join(BRAIN_DIR, "verify-remove-range-cards-report.json");
    fs.writeFileSync(dataReportPath, JSON.stringify(report, null, 2), "utf8");
    console.log(`Wrote verification JSON to: ${dataReportPath}`);

    console.log("\n=== SUMMARY RESULTS ===");
    console.log(`Console Errors: ${report.consoleErrors.length}`);
    console.log(`Beat 4 Removed from #range: ${report.beat4RemovedFromRange}`);
    console.log(`Beat 5 follows Beat 3: ${report.beat5FollowsBeat3}`);
    console.log(`#scents intro intact: ${report.scentsIntroIntact}`);
    console.log(`Menu link points to #scents: ${report.menuLinkFourFlexesScents}`);
    console.log(`Hash /#range redirect to #scents: ${report.hashRangeRedirectsToScents}`);
  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    await browser.close();
    if (server) {
      server.kill();
    }
  }
}

run();
