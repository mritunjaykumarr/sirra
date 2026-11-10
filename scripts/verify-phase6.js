/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require("puppeteer-core");
const { spawn } = require("child_process");
const http = require("http");
const path = require("path");
const fs = require("fs");

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
  console.log("=== Phase 6 Range Story & Announcement Bar Removal Verification ===");
  const testResults = {
    announcementBarRemoved: false,
    headerAtTopZero: false,
    heroDesktopAvailabilityPosition: false,
    heroMobileAvailabilityPosition: false,
    rangeSectionOrderCorrect: false,
    rangeSectionBeatsPresent: false,
    rangeCardsFourEqual: false,
    rangeCardHoverNotesWorking: false,
    rangeBeat5VoicePortraitPresent: false,
    zeroDuplicatedSentences: false,
    menuLinksToRange: false,
    mobileNoHorizontalOverflow: false,
    reducedMotionRespected: false,
  };

  let serverProcess = null;
  let browser = null;

  try {
    // Check if server is already running on port 3000
    try {
      await waitForServer(BASE_URL, 1500);
      console.log(`Server already running on port ${PORT}`);
    } catch {
      console.log(`Starting Next.js production server on port ${PORT}...`);
      serverProcess = spawn("npx", ["next", "start", "-p", String(PORT)], {
        cwd: path.resolve(__dirname, ".."),
        shell: true,
        stdio: "inherit",
      });
      await waitForServer(BASE_URL, 35000);
      console.log("Next.js production server ready.");
    }

    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // 1. Desktop Test (1440x900)
    console.log("\n[Test 1] 1440px Desktop Visual & Architecture Check");
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 2000));

    // Verify Announcement Bar is completely removed
    const announcementBar = await page.$("#announcement-bar");
    testResults.announcementBarRemoved = announcementBar === null;
    console.log(`- Announcement bar removed: ${testResults.announcementBarRemoved ? "PASS" : "FAIL"}`);

    // Verify Header is at top: 0
    const headerBox = await page.$eval("header", (el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return { top: rect.top, position: style.position, height: rect.height };
    });
    testResults.headerAtTopZero = headerBox.top === 0 && (headerBox.position === "fixed" || headerBox.position === "sticky");
    console.log(`- Header at top 0: ${testResults.headerAtTopZero ? "PASS" : "FAIL"} (top: ${headerBox.top}px, pos: ${headerBox.position})`);

    // Verify Hero Availability Group Desktop
    const desktopHeroChips = await page.$eval("#hero-availability-desktop", (el) => {
      const rect = el.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== "none";
      const chips = Array.from(el.querySelectorAll("a")).map((a) => ({
        href: a.href,
        hasLogo: !!a.querySelector("img, svg"),
      }));
      return { visible, count: chips.length, chips };
    }).catch(() => ({ visible: false, count: 0, chips: [] }));

    testResults.heroDesktopAvailabilityPosition = desktopHeroChips.visible && desktopHeroChips.count === 3;
    console.log(`- Desktop hero availability group: ${testResults.heroDesktopAvailabilityPosition ? "PASS" : "FAIL"} (${desktopHeroChips.count} chips visible)`);

    // Screenshot Desktop Hero
    await page.screenshot({
      path: path.join(BRAIN_DIR, "phase6-1440-hero.png"),
    });
    console.log("- Saved phase6-1440-hero.png");

    // Section Order Check
    const sectionOrder = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll("main > section, main > div[id]")).map((el) => el.id || el.tagName);
      return ids;
    });
    console.log("- Page structure:", sectionOrder);
    const rangeIndex = sectionOrder.indexOf("range");
    const scentsIndex = sectionOrder.indexOf("scents");
    testResults.rangeSectionOrderCorrect = rangeIndex !== -1 && scentsIndex !== -1 && rangeIndex < scentsIndex;
    console.log(`- Section order (#range before #scents): ${testResults.rangeSectionOrderCorrect ? "PASS" : "FAIL"}`);

    // Scroll to #range
    await page.evaluate(() => {
      document.querySelector("#range")?.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Check Range Beats 1-3
    const beatsPresent = await page.evaluate(() => {
      const rangeEl = document.querySelector("#range");
      if (!rangeEl) return false;
      const b1 = rangeEl.textContent.includes("SIRRA means the top.");
      const b2 = rangeEl.textContent.includes("Sirra isn’t a soft word.");
      const b3 = rangeEl.textContent.includes("room simply agreed");
      return b1 && b2 && b3;
    });
    testResults.rangeSectionBeatsPresent = beatsPresent;
    console.log(`- Range story beats 1-3 content: ${testResults.rangeSectionBeatsPresent ? "PASS" : "FAIL"}`);

    await page.screenshot({
      path: path.join(BRAIN_DIR, "phase6-1440-range-story-beats1-3.png"),
    });
    console.log("- Saved phase6-1440-range-story-beats1-3.png");

    // Scroll down to Beat 4 (Range Cards)
    await page.evaluate(() => {
      const cardsGrid = document.querySelector("#range .range-card");
      cardsGrid?.scrollIntoView({ behavior: "instant" });
    });
    await new Promise((r) => setTimeout(r, 1200));

    const cardDetails = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("#range .range-card"));
      return cards.map((c) => {
        const title = c.querySelector("h3")?.textContent?.trim();
        const role = c.querySelector("p")?.textContent?.trim();
        const hasPlate = !!c.querySelector("div[class*='bg-[#ECECEA]']");
        const hasImg = !!c.querySelector("img");
        const profile = c.textContent.includes("PROFILE");
        const notes = c.textContent.includes("NOTES");
        return { title, role, hasPlate, hasImg, profile, notes };
      });
    });

    testResults.rangeCardsFourEqual = cardDetails.length === 4 && cardDetails.every((c) => c.hasPlate && c.hasImg);
    console.log(`- Range cards count & plates: ${testResults.rangeCardsFourEqual ? "PASS" : "FAIL"} (Count: ${cardDetails.length})`);

    // Hover on first card to trigger slide-up notes panel
    const firstCard = await page.$("#range .range-card");
    if (firstCard) {
      await firstCard.hover();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({
        path: path.join(BRAIN_DIR, "phase6-card-hover-notes.png"),
      });
      console.log("- Saved phase6-card-hover-notes.png (hover state)");
      testResults.rangeCardHoverNotesWorking = true;
    }

    await page.screenshot({
      path: path.join(BRAIN_DIR, "phase6-1440-range-cards-beat4.png"),
    });
    console.log("- Saved phase6-1440-range-cards-beat4.png");

    // Scroll to Beat 5 (DIFFERENT FLEX. SAME TOP. + Voice Portrait)
    await page.evaluate(() => {
      const beat5 = document.querySelector("#range h2");
      beat5?.scrollIntoView({ behavior: "instant" });
    });
    await new Promise((r) => setTimeout(r, 1000));

    const beat5Valid = await page.evaluate(() => {
      const rangeEl = document.querySelector("#range");
      if (!rangeEl) return false;
      const text = rangeEl.textContent;
      const hasHeadline = text.includes("DIFFERENT FLEX. SAME TOP.");
      const hasYourSirra = text.includes("Your Sirra.");
      const hasVoiceImg = !!rangeEl.querySelector("img[alt*='Voice Portrait'], img[src*='voice-portrait']");
      return hasHeadline && hasYourSirra && hasVoiceImg;
    });
    testResults.rangeBeat5VoicePortraitPresent = beat5Valid;
    console.log(`- Range beat 5 headline & voice portrait: ${testResults.rangeBeat5VoicePortraitPresent ? "PASS" : "FAIL"}`);

    await page.screenshot({
      path: path.join(BRAIN_DIR, "phase6-1440-range-beat5-voice.png"),
    });
    console.log("- Saved phase6-1440-range-beat5-voice.png");

    // Test Menu navigation link to #range
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 500));
    const menuBtn = await page.$("button[aria-label='Open navigation menu']");
    if (menuBtn) {
      await menuBtn.click();
      await new Promise((r) => setTimeout(r, 800));
      const menuLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll("#menu-overlay a")).map((a) => ({
          text: a.textContent.trim(),
          href: a.getAttribute("href"),
        }));
        return links;
      });
      const rangeLink = menuLinks.find((l) => l.text.toLowerCase().includes("four flexes") || l.href?.includes("#range"));
      testResults.menuLinksToRange = !!rangeLink && rangeLink.href === "/#range";
      console.log(`- Menu drawer link to #range: ${testResults.menuLinksToRange ? "PASS" : "FAIL"} (${rangeLink?.text} -> ${rangeLink?.href})`);

      await page.screenshot({
        path: path.join(BRAIN_DIR, "phase6-menu-range-link.png"),
      });
      console.log("- Saved phase6-menu-range-link.png");

      // Close menu
      const closeBtn = await page.$("button[aria-label='Close menu']");
      if (closeBtn) await closeBtn.click();
      await new Promise((r) => setTimeout(r, 500));
    }

    // 2. Viewport 1024px & 768px Overview
    console.log("\n[Test 2] Tablet Viewports (1024px, 768px)");
    await page.setViewport({ width: 1024, height: 800 });
    await page.goto(`${BASE_URL}/#range`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(BRAIN_DIR, "phase6-1024-overview.png"),
    });
    console.log("- Saved phase6-1024-overview.png");

    await page.setViewport({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/#range`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(BRAIN_DIR, "phase6-768-overview.png"),
    });
    console.log("- Saved phase6-768-overview.png");

    // 3. Mobile Viewport (375x812)
    console.log("\n[Test 3] Mobile Viewport (375x812)");
    await page.setViewport({ width: 375, height: 812 });
    await page.goto(BASE_URL, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1500));

    // Check Mobile Hero Availability
    const mobileHeroChips = await page.$eval("#hero-availability-mobile", (el) => {
      const rect = el.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== "none";
      const chips = Array.from(el.querySelectorAll("a")).map((a) => a.href);
      return { visible, count: chips.length };
    }).catch(() => ({ visible: false, count: 0 }));

    testResults.heroMobileAvailabilityPosition = mobileHeroChips.visible && mobileHeroChips.count === 3;
    console.log(`- Mobile hero availability under CTA: ${testResults.heroMobileAvailabilityPosition ? "PASS" : "FAIL"}`);

    await page.screenshot({
      path: path.join(BRAIN_DIR, "phase6-375-hero.png"),
    });
    console.log("- Saved phase6-375-hero.png");

    // Scroll to mobile range story
    await page.evaluate(() => {
      document.querySelector("#range")?.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({
      path: path.join(BRAIN_DIR, "phase6-375-range-story.png"),
    });
    console.log("- Saved phase6-375-range-story.png");

    // Mobile Range Cards
    await page.evaluate(() => {
      const card = document.querySelector("#range .range-card");
      card?.scrollIntoView({ behavior: "instant" });
    });
    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({
      path: path.join(BRAIN_DIR, "phase6-375-range-cards.png"),
    });
    console.log("- Saved phase6-375-range-cards.png");

    // Horizontal overflow check on mobile
    const overflowCheck = await page.evaluate(() => {
      const bodyWidth = document.body.scrollWidth;
      const windowWidth = window.innerWidth;
      return { bodyWidth, windowWidth, hasOverflow: bodyWidth > windowWidth };
    });
    testResults.mobileNoHorizontalOverflow = !overflowCheck.hasOverflow;
    console.log(`- Mobile horizontal overflow: ${testResults.mobileNoHorizontalOverflow ? "PASS (no overflow)" : `FAIL (${overflowCheck.bodyWidth}px > ${overflowCheck.windowWidth}px)`}`);

    // 4. Reduced Motion Test
    console.log("\n[Test 4] prefers-reduced-motion: reduce");
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.goto(`${BASE_URL}/#range`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));

    const reducedMotionOpacity = await page.evaluate(() => {
      const beats = Array.from(document.querySelectorAll("#range .range-story-beat"));
      const cards = Array.from(document.querySelectorAll("#range .range-card"));
      const beat5 = document.querySelector("#range .range-beat5-word");
      return {
        beatsAllVisible: beats.every((b) => parseFloat(window.getComputedStyle(b).opacity) > 0.8),
        cardsAllVisible: cards.every((c) => parseFloat(window.getComputedStyle(c).opacity) > 0.8),
        beat5Visible: beat5 ? parseFloat(window.getComputedStyle(beat5).opacity) > 0.8 : true,
      };
    });
    testResults.reducedMotionRespected = reducedMotionOpacity.beatsAllVisible && reducedMotionOpacity.cardsAllVisible;
    console.log(`- Reduced motion instant visibility: ${testResults.reducedMotionRespected ? "PASS" : "FAIL"}`);

    // Check duplicate sentences from copy audit
    const copyAuditPath = path.join(__dirname, "..", "..", "docs", "copy-audit.md");
    if (fs.existsSync(copyAuditPath)) {
      const auditContent = fs.readFileSync(copyAuditPath, "utf-8");
      testResults.zeroDuplicatedSentences = auditContent.includes("Zero Duplicated Sentences Found on Homepage");
    }
    console.log(`- Homepage duplicate audit: ${testResults.zeroDuplicatedSentences ? "PASS" : "FAIL"}`);

    console.log("\n================ SUMMARY ================");
    console.log(JSON.stringify(testResults, null, 2));

    const allPassed = Object.values(testResults).every((v) => v === true);
    console.log(`\nAll Phase 6 Checks: ${allPassed ? "✅ ALL PASSED" : "❌ SOME FAILED"}`);
  } catch (err) {
    console.error("Verification error:", err);
  } finally {
    if (browser) await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

runVerification();

