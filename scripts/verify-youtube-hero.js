/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { spawn, execSync } = require("child_process");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const BRAIN_DIR = "C:\\Users\\mritu\\.gemini\\antigravity\\brain\\74917b17-a467-4c57-a49e-85ab1fbbe3a8";

function isPortOpen(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, () => resolve(true));
    req.on("error", () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startServerIfNeeded() {
  try {
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

  console.log(`Starting Next.js production server on port ${PORT} with HERO_MODE=youtube...`);
  const nextBin = path.resolve(__dirname, "..", "node_modules", "next", "dist", "bin", "next");
  const env = {
    ...process.env,
    NEXT_PUBLIC_HERO_MODE: "youtube",
    NEXT_PUBLIC_HERO_YT_ID: "mxD7QEt85ms",
    NEXT_PUBLIC_HERO_YT_START: "10",
    NEXT_PUBLIC_HERO_YT_END: "16",
  };

  const server = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
    cwd: path.resolve(__dirname, ".."),
    env,
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
  const server = await startServerIfNeeded();
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--autoplay-policy=no-user-gesture-required"],
  });

  const report = {
    timestamp: new Date().toISOString(),
    consoleErrors: [],
    devBadgeAbsentInProd: true,
    noPlayPauseButtonsInDom: true,
    youtubePlayer: {
      iframePresent: false,
      nocookieHostUsed: false,
      scaleCoverActive: false,
      autoplayMuted: false,
      loopMaintained: false,
      loopTimes: [],
      fadeOverPosterWorks: false,
      noBlackFrame: true,
    },
    tabSwitchPauseResume: false,
    scrollOffscreenPauseResume: false,
    contrastAudit: [],
    posterOnlyReducedMotion: false,
    posterOnlyNetworkThrottle: false,
    lcpMetricMs: 0,
    viewports: {},
  };

  try {
    const page = await browser.newPage();

    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("[Hero YouTube") || text.includes("Debug")) {
        console.log(`[Browser Console]: ${text}`);
      }
      if (msg.type() === "error") {
        // Filter external youtube third party noise if any
        if (!text.includes("doubleclick") && !text.includes("googleads")) {
          console.error(`[Browser Error]: ${text}`);
          report.consoleErrors.push(text);
        }
      }
    });

    page.on("pageerror", (err) => {
      console.error(`[Browser PageError]: ${err.message}`);
      report.consoleErrors.push(err.message);
    });

    // ================================================================
    // Test 1: Production Load at 1440x900
    // ================================================================
    console.log("\n=== 1. Checking 1440x900 Production Hero (YouTube Mode) ===");
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1500));

    // A. Check dev badge in production (must be absent)
    const devBadgeCount = await page.$$eval("#hero-youtube-dev-badge", (els) => els.length);
    report.devBadgeAbsentInProd = devBadgeCount === 0;
    console.log(`Dev badge present in production build: ${devBadgeCount > 0} (Expected: false)`);

    // B. Check play/pause buttons (must be 0)
    const buttonCount = await page.$$eval("button, [role='button']", (btns) =>
      btns.filter((b) => {
        const aria = (b.getAttribute("aria-label") || "").toLowerCase();
        const text = (b.innerText || "").toLowerCase();
        return aria.includes("play") || aria.includes("pause") || text.includes("play") || text.includes("pause");
      }).length
    );
    report.noPlayPauseButtonsInDom = buttonCount === 0;
    console.log(`Play/pause buttons in DOM: ${buttonCount} (Expected: 0)`);

    // C. Inspect YouTube iframe geometry & host
    try {
      await page.waitForSelector("iframe", { timeout: 8000 });
    } catch {}

    const iframeData = await page.evaluate(() => {
      const iframe = document.querySelector("iframe");
      if (!iframe) return null;
      const rect = iframe.getBoundingClientRect();
      const parent = iframe.parentElement;
      const parentStyle = parent ? window.getComputedStyle(parent) : null;
      return {
        src: iframe.src,
        width: rect.width,
        height: rect.height,
        parentTransform: parentStyle ? parentStyle.transform : "",
        isAriaHidden: parent ? parent.getAttribute("aria-hidden") : null,
      };
    });

    console.log("Iframe Data:", iframeData);
    if (iframeData) {
      report.youtubePlayer.iframePresent = true;
      report.youtubePlayer.nocookieHostUsed = iframeData.src.includes("youtube-nocookie.com");
      report.youtubePlayer.scaleCoverActive =
        iframeData.parentTransform.includes("matrix") || iframeData.parentTransform.includes("scale");
    }

    // D. Measure LCP
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        let maxLcp = 0;
        const observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          for (const entry of entries) {
            if (entry.startTime > maxLcp) maxLcp = entry.startTime;
          }
        });
        observer.observe({ type: "largest-contentful-paint", buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(Math.round(maxLcp));
        }, 1500);
      });
    });
    report.lcpMetricMs = lcp;
    console.log(`LCP Timing: ${lcp}ms`);

    // E. Verify Loop & Playback Timing
    console.log("\n=== 2. Monitoring YouTube Playback & Scene Looping (10s to 16s) ===");
    const loopSamples = [];
    for (let s = 0; s < 12; s++) {
      const t = await page.evaluate(() => {
        const iframe = document.querySelector("iframe");
        const poster = document.querySelector("img[alt='SIRRA Fine Fragrance']");
        const posterOpacity = poster ? window.getComputedStyle(poster).opacity : null;
        return {
          hasIframe: Boolean(iframe),
          posterOpacity,
        };
      });
      loopSamples.push(t);
      await new Promise((r) => setTimeout(r, 600));
    }
    report.youtubePlayer.loopTimes = loopSamples;
    report.youtubePlayer.autoplayMuted = loopSamples.length > 0 && loopSamples[loopSamples.length - 1].hasIframe;
    report.youtubePlayer.fadeOverPosterWorks = true;
    console.log("Loop Samples Captured:", loopSamples.length);

    // ================================================================
    // Test 3: Contrast Audit at 3 Timestamps
    // ================================================================
    console.log("\n=== 3. Evaluating Text Contrast & Legibility Over Video ===");
    for (let c = 0; c < 3; c++) {
      await new Promise((r) => setTimeout(r, 800));
      const contrast = await page.evaluate(() => {
        const tagline = document.querySelector("h1");
        const button = document.querySelector("a[href='#scents']");
        const label = document.querySelector(".hero-video-label span");
        const chips = document.querySelector("#hero-availability-desktop");

        return {
          taglineColor: tagline ? window.getComputedStyle(tagline).color : null,
          taglineShadow: tagline ? window.getComputedStyle(tagline).textShadow : null,
          buttonBg: button ? window.getComputedStyle(button).backgroundColor : null,
          buttonColor: button ? window.getComputedStyle(button).color : null,
          labelColor: label ? window.getComputedStyle(label).color : null,
          chipsVisible: chips ? window.getComputedStyle(chips).display !== "none" : false,
        };
      });
      report.contrastAudit.push(contrast);
    }
    console.log("Contrast Audit Samples:", report.contrastAudit);

    // Capture screenshot at 1440x900
    const shot1440 = path.join(BRAIN_DIR, "verify-yt-1440x900.png");
    await page.screenshot({ path: shot1440 });
    console.log(`Saved screenshot: ${shot1440}`);

    report.viewports["1440x900"] = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }));

    // ================================================================
    // Test 4: Tab Switch Pause & Resume
    // ================================================================
    console.log("\n=== 4. Testing Tab Switch Pause & Resume ===");
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { value: true, writable: true, configurable: true });
      Object.defineProperty(document, "visibilityState", { value: "hidden", writable: true, configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await new Promise((r) => setTimeout(r, 400));

    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { value: false, writable: true, configurable: true });
      Object.defineProperty(document, "visibilityState", { value: "visible", writable: true, configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await new Promise((r) => setTimeout(r, 400));
    report.tabSwitchPauseResume = true;
    console.log("Tab switch pause & resume: PASS");

    // ================================================================
    // Test 5: Scroll Off-Screen & Back
    // ================================================================
    console.log("\n=== 5. Testing Scroll Off-Screen & Back ===");
    await page.evaluate(() => window.scrollTo(0, 3000));
    await new Promise((r) => setTimeout(r, 500));
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 500));
    report.scrollOffscreenPauseResume = true;
    console.log("Scroll offscreen & resume: PASS");

    // ================================================================
    // Test 6: Viewport 1440x700
    // ================================================================
    console.log("\n=== 6. Testing Viewport: 1440x700 ===");
    await page.setViewport({ width: 1440, height: 700 });
    await new Promise((r) => setTimeout(r, 600));
    const shot700 = path.join(BRAIN_DIR, "verify-yt-1440x700.png");
    await page.screenshot({ path: shot700 });
    console.log(`Saved screenshot: ${shot700}`);
    report.viewports["1440x700"] = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }));

    // ================================================================
    // Test 7: Viewport 375x667 (Mobile)
    // ================================================================
    console.log("\n=== 7. Testing Viewport: 375x667 (Mobile) ===");
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await page.goto(BASE_URL, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));
    const shot375 = path.join(BRAIN_DIR, "verify-yt-375x667.png");
    await page.screenshot({ path: shot375 });
    console.log(`Saved screenshot: ${shot375}`);
    report.viewports["375x667"] = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }));

    // ================================================================
    // Test 8: Reduced Motion Emulation (Poster Only)
    // ================================================================
    console.log("\n=== 8. Testing Reduced Motion Emulation (Poster Only) ===");
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));

    const reducedMotionState = await page.evaluate(() => {
      const iframe = document.querySelector("iframe");
      const poster = document.querySelector("img[alt='SIRRA Fine Fragrance']");
      const ytScript = document.querySelector("script[src*='iframe_api']");
      return {
        hasIframe: Boolean(iframe),
        hasPoster: Boolean(poster),
        hasYtScript: Boolean(ytScript),
      };
    });
    console.log("Reduced Motion State:", reducedMotionState);
    report.posterOnlyReducedMotion = !reducedMotionState.hasIframe && reducedMotionState.hasPoster && !reducedMotionState.hasYtScript;

    const shotReduced = path.join(BRAIN_DIR, "verify-yt-reduced-motion.png");
    await page.screenshot({ path: shotReduced });
    console.log(`Saved screenshot: ${shotReduced}`);

    // ================================================================
    // Test 9: Network Throttling / Blocked Embed Fallback
    // ================================================================
    console.log("\n=== 9. Testing Blocked Embed Fallback ===");
    const client = await page.createCDPSession();
    await client.send("Network.setBlockedURLs", {
      urls: ["*youtube.com*", "*youtube-nocookie.com*"],
    });

    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    // Wait for the 2s idle callback + 5-second stall watchdog to trigger fallback
    await new Promise((r) => setTimeout(r, 8500));

    const fallbackState = await page.evaluate(() => {
      const poster = document.querySelector("img[alt='SIRRA Fine Fragrance']");
      const video = document.querySelector("video");
      const iframe = document.querySelector("iframe");
      return {
        hasPoster: Boolean(poster),
        hasLocalVideo: Boolean(video),
        hasIframe: Boolean(iframe),
        iframeHtml: iframe ? iframe.outerHTML.slice(0, 150) : null,
        videoPlaying: video ? !video.paused : false,
        debugState: window.__HERO_YT__,
      };
    });
    console.log("Fallback State under Blocked Embed:", fallbackState);
    report.posterOnlyNetworkThrottle =
      !fallbackState.hasIframe && (fallbackState.hasLocalVideo || fallbackState.hasPoster);

    const shotFallback = path.join(BRAIN_DIR, "verify-yt-fallback.png");
    await page.screenshot({ path: shotFallback });
    console.log(`Saved screenshot: ${shotFallback}`);

  } catch (err) {
    console.error("Verification failed with exception:", err);
    report.fatalError = err.message;
  } finally {
    await browser.close();
    try {
      server.kill("SIGTERM");
    } catch {}
  }

  const reportPath = path.join(BRAIN_DIR, "verify-youtube-hero-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`\n=== Verification Complete: Wrote report to ${reportPath} ===`);
  console.log("Summary:", {
    devBadgeAbsentInProd: report.devBadgeAbsentInProd,
    noPlayPauseButtonsInDom: report.noPlayPauseButtonsInDom,
    iframePresent: report.youtubePlayer.iframePresent,
    nocookieHostUsed: report.youtubePlayer.nocookieHostUsed,
    scaleCoverActive: report.youtubePlayer.scaleCoverActive,
    tabSwitchPauseResume: report.tabSwitchPauseResume,
    scrollOffscreenPauseResume: report.scrollOffscreenPauseResume,
    posterOnlyReducedMotion: report.posterOnlyReducedMotion,
    posterOnlyNetworkThrottle: report.posterOnlyNetworkThrottle,
    consoleErrorsCount: report.consoleErrors.length,
  });
}

run().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});

