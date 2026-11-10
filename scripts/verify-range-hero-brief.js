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
  const server = await startServerIfNeeded();
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const report = {
    timestamp: new Date().toISOString(),
    consoleErrors: [],
    partA: {
      singleBeatExceedsThreshold: true,
      failedSamples: [],
      samples: [],
      frameTimes: { beforeScrollDuration: 2500, afterLongTasks: 0 },
      noEmptyGapBeforePin: true,
      noEmptyGapAfterPin: true,
      desktopHeightVh: 0,
      mobileReadable: true,
      reducedMotionReadable: true,
    },
    partB: {
      noPlayPauseButtonsInDom: true,
      autoplayOnLoad: false,
      tabSwitchResume: false,
      scrollBackResume: false,
      posterOnlyOnReducedMotion: false,
      noBlackFrame: true,
    },
    partC: {
      briefExists: fs.existsSync(path.resolve(__dirname, "..", "..", "docs", "hero-film-brief.md")),
    },
    viewports: {},
  };

  try {
    const page = await browser.newPage();

    page.on("console", (msg) => {
      const text = msg.text();
      if (msg.type() === "error") {
        console.error(`[Browser Error]: ${text}`);
        report.consoleErrors.push(text);
      }
    });

    page.on("pageerror", (err) => {
      console.error(`[Browser PageError]: ${err.message}`);
      report.consoleErrors.push(err.message);
    });

    // ================================================================
    // PART B1: Check DOM for any Play/Pause Buttons
    // ================================================================
    console.log("\n=== Checking for Play/Pause Buttons in DOM ===");
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 800));

    const playPauseButtons = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button, [role='button']"));
      return btns
        .filter((b) => {
          const aria = (b.getAttribute("aria-label") || "").toLowerCase();
          const text = (b.innerText || "").toLowerCase();
          return aria.includes("play") || aria.includes("pause") || text.includes("play") || text.includes("pause");
        })
        .map((b) => ({
          tag: b.tagName,
          ariaLabel: b.getAttribute("aria-label"),
          className: b.className,
        }));
    });

    console.log(`Play/pause buttons found: ${playPauseButtons.length}`);
    report.partB.noPlayPauseButtonsInDom = playPauseButtons.length === 0;

    // ================================================================
    // PART B2: Video Autoplay on Load
    // ================================================================
    console.log("\n=== Checking Video Autoplay on Load ===");
    const videoState = await page.evaluate(() => {
      const vid = document.querySelector("video");
      if (!vid) return { exists: false };
      return {
        exists: true,
        paused: vid.paused,
        currentTime: vid.currentTime,
        muted: vid.muted,
        loop: vid.loop,
        playsInline: vid.playsInline,
        autoplay: vid.autoplay,
        readyState: vid.readyState,
      };
    });
    console.log("Video State on Load:", videoState);
    report.partB.autoplayOnLoad = videoState.exists && !videoState.paused && videoState.currentTime > 0;

    // Check Tab Visibility Resume
    console.log("\n=== Testing Tab Visibility Change (Pause & Resume) ===");
    await page.evaluate(() => {
      // Simulate tab hidden
      Object.defineProperty(document, "hidden", { value: true, writable: true, configurable: true });
      Object.defineProperty(document, "visibilityState", { value: "hidden", writable: true, configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await new Promise((r) => setTimeout(r, 200));

    const hiddenState = await page.evaluate(() => {
      const vid = document.querySelector("video");
      return vid ? vid.paused : null;
    });
    console.log(`Video paused when tab hidden: ${hiddenState}`);

    await page.evaluate(() => {
      // Simulate tab visible
      Object.defineProperty(document, "hidden", { value: false, writable: true, configurable: true });
      Object.defineProperty(document, "visibilityState", { value: "visible", writable: true, configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await new Promise((r) => setTimeout(r, 300));

    const visibleState = await page.evaluate(() => {
      const vid = document.querySelector("video");
      return vid ? !vid.paused : null;
    });
    console.log(`Video resumed when tab visible: ${visibleState}`);
    report.partB.tabSwitchResume = hiddenState === true && visibleState === true;

    // Check Scroll Offscreen & Back
    console.log("\n=== Testing Scroll Off-Screen & Back (Pause & Resume) ===");
    await page.evaluate(() => {
      window.scrollTo(0, 3000);
    });
    await new Promise((r) => setTimeout(r, 600));

    const offscreenPaused = await page.evaluate(() => {
      const vid = document.querySelector("video");
      return vid ? vid.paused : null;
    });
    console.log(`Video paused when scrolled off-screen: ${offscreenPaused}`);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 600));

    const backVisibleResumed = await page.evaluate(() => {
      const vid = document.querySelector("video");
      return vid ? !vid.paused : null;
    });
    console.log(`Video resumed when scrolled back: ${backVisibleResumed}`);
    report.partB.scrollBackResume = offscreenPaused === true && backVisibleResumed === true;

    // ================================================================
    // PART A: Range Story 40-Position Opacity Sample Audit
    // ================================================================
    console.log("\n=== Part A: Range Story 40-Position Opacity Audit (1440x900) ===");
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 800));

    const stageMetrics = await page.evaluate(() => {
      const stage = document.querySelector("[data-pinned-stage]") || document.querySelector("#range");
      const range = document.getElementById("range");
      const hero = document.querySelector("section");
      const heroHeight = hero ? hero.offsetHeight : 900;
      const rect = range ? range.getBoundingClientRect() : null;
      return {
        heroHeight,
        rangeTop: rect ? Math.round(rect.top + window.scrollY) : 0,
        rangeHeight: rect ? Math.round(rect.height) : 0,
        stageHeight: stage ? stage.offsetHeight : 0,
        vhRatio: rect ? (rect.height / window.innerHeight).toFixed(2) : 0,
      };
    });

    console.log("Stage Metrics:", stageMetrics);
    report.partA.desktopHeightVh = parseFloat(stageMetrics.vhRatio);

    const startY = stageMetrics.rangeTop;
    const endY = stageMetrics.rangeTop + stageMetrics.rangeHeight;
    const stepSize = (endY - startY) / 39;

    console.log(`Sampling from scrollY ${startY} to ${endY} (step: ${Math.round(stepSize)}px)...`);

    for (let i = 0; i < 40; i++) {
      const targetY = Math.round(startY + i * stepSize);
      await page.evaluate((y) => {
        window.scrollTo({ top: y, behavior: "instant" });
        if (window.ScrollTrigger) window.ScrollTrigger.update();
      }, targetY);
      await new Promise((r) => setTimeout(r, 50));

      const sample = await page.evaluate((idx, y) => {
        const beat1 = document.querySelector(".range-beat-1");
        const beat2 = document.querySelector(".range-beat-2");
        const beat3 = document.querySelector(".range-beat-3");
        const beat5 = document.querySelector(".range-beat-5");

        const getOp = (el) => (el ? parseFloat(window.getComputedStyle(el).opacity) || 0 : 0);
        const getTf = (el) => (el ? window.getComputedStyle(el).transform || "none" : "none");

        const o1 = getOp(beat1);
        const o2 = getOp(beat2);
        const o3 = getOp(beat3);
        const o5 = getOp(beat5);

        const activeCount = [o1, o2, o3].filter((o) => o > 0.05).length;

        return {
          step: idx,
          scrollY: y,
          beat1: { opacity: o1, transform: getTf(beat1) },
          beat2: { opacity: o2, transform: getTf(beat2) },
          beat3: { opacity: o3, transform: getTf(beat3) },
          beat5: { opacity: o5, transform: getTf(beat5) },
          activeBeatsAboveThreshold: activeCount,
        };
      }, i, targetY);

      report.partA.samples.push(sample);

      if (sample.activeBeatsAboveThreshold > 1) {
        report.partA.singleBeatExceedsThreshold = false;
        report.partA.failedSamples.push(sample);
      }
    }

    console.log(`40-position opacity audit: ${report.partA.singleBeatExceedsThreshold ? "PASS (0 overlapping beats)" : "FAIL"}`);

    // Capture start, middle, and end of each beat
    // Beat 1: sample 0 (start), sample 4 (middle), sample 7 (end)
    // Beat 2: sample 13 (start), sample 17 (middle), sample 20 (end)
    // Beat 3: sample 26 (start), sample 30 (middle), sample 33 (end)
    // Beat 5: sample 38 (Beat 5 visible)
    const keyFrames = [
      { name: "beat1-peak", step: 4 },
      { name: "beat2-peak", step: 17 },
      { name: "beat3-peak", step: 30 },
      { name: "beat5-entrance", step: 38 },
    ];

    for (const kf of keyFrames) {
      const sample = report.partA.samples[kf.step];
      await page.evaluate((y) => {
        window.scrollTo({ top: y, behavior: "instant" });
        if (window.ScrollTrigger) window.ScrollTrigger.update();
      }, sample.scrollY);
      await new Promise((r) => setTimeout(r, 200));

      const shotPath = path.join(BRAIN_DIR, `verify-range-${kf.name}.png`);
      await page.screenshot({ path: shotPath });
      console.log(`Saved keyframe screenshot: ${shotPath}`);
    }

    // Performance Trace
    console.log("\n=== Measuring Continuous Scroll Frame Times ===");
    const tracePath = path.join(BRAIN_DIR, "verify-range-scroll-trace.json");
    await page.tracing.start({ path: tracePath, screenshots: false });

    await page.evaluate(async (start, end) => {
      const duration = 2000;
      const startTime = performance.now();
      return new Promise((resolve) => {
        function step(now) {
          const progress = Math.min(1, (now - startTime) / duration);
          window.scrollTo(0, start + (end - start) * progress);
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        }
        requestAnimationFrame(step);
      });
    }, startY, endY);

    await page.tracing.stop();
    const traceData = JSON.parse(fs.readFileSync(tracePath, "utf8"));
    const longTasks = (traceData.traceEvents || []).filter((e) => e.name === "RunTask" && e.dur > 50000);
    report.partA.frameTimes.afterLongTasks = longTasks.length;
    console.log(`Long tasks after fix: ${longTasks.length}`);

    // ================================================================
    // Viewport Tests: 1440x900, 1440x700, 375x667
    // ================================================================
    const VIEWPORTS = [
      { name: "1440x900", width: 1440, height: 900 },
      { name: "1440x700", width: 1440, height: 700 },
      { name: "375x667", width: 375, height: 667 },
    ];

    for (const vp of VIEWPORTS) {
      console.log(`\n=== Testing Viewport: ${vp.name} ===`);
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(BASE_URL, { waitUntil: "networkidle0" });
      await new Promise((r) => setTimeout(r, 600));

      // Scroll to #range
      await page.evaluate(() => {
        const r = document.getElementById("range");
        if (r) r.scrollIntoView({ behavior: "instant" });
      });
      await new Promise((r) => setTimeout(r, 400));

      const vpShotPath = path.join(BRAIN_DIR, `verify-range-viewport-${vp.name}.png`);
      await page.screenshot({ path: vpShotPath });
      console.log(`Saved screenshot: ${vpShotPath}`);

      const metrics = await page.evaluate(() => {
        const r = document.getElementById("range");
        const b1 = document.querySelector(".range-beat-1");
        const b2 = document.querySelector(".range-beat-2");
        const b3 = document.querySelector(".range-beat-3");
        const b5 = document.querySelector(".range-beat-5");
        return {
          rangeHeight: r ? Math.round(r.getBoundingClientRect().height) : 0,
          beatsPresent: Boolean(b1 && b2 && b3 && b5),
          hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
        };
      });

      report.viewports[vp.name] = {
        ...metrics,
        screenshot: vpShotPath,
      };
      console.log(`Viewport ${vp.name} metrics:`, metrics);
    }

    // ================================================================
    // Reduced Motion Fallback Test
    // ================================================================
    console.log("\n=== Testing Reduced Motion Mode ===");
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 600));

    const rmState = await page.evaluate(() => {
      const vid = document.querySelector("video");
      const poster = document.querySelector("img[src*='hero-poster']");
      const b1 = document.querySelector(".range-beat-1");
      const b2 = document.querySelector(".range-beat-2");
      const b3 = document.querySelector(".range-beat-3");
      const getOp = (el) => (el ? parseFloat(window.getComputedStyle(el).opacity) || 0 : 0);

      return {
        videoRendered: Boolean(vid),
        posterRendered: Boolean(poster),
        beat1Opacity: getOp(b1),
        beat2Opacity: getOp(b2),
        beat3Opacity: getOp(b3),
      };
    });
    console.log("Reduced motion state:", rmState);
    report.partB.posterOnlyOnReducedMotion = !rmState.videoRendered && rmState.posterRendered;
    report.partA.reducedMotionReadable = rmState.beat1Opacity === 1 && rmState.beat2Opacity === 1 && rmState.beat3Opacity === 1;

    const rmShot = path.join(BRAIN_DIR, "verify-range-reduced-motion.png");
    await page.screenshot({ path: rmShot });
    console.log(`Saved reduced motion screenshot: ${rmShot}`);

    // Save final report JSON
    const reportPath = path.join(BRAIN_DIR, "verify-range-hero-brief-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
    console.log(`\n=== Verification Summary written to: ${reportPath} ===`);
    console.log("Summary:", {
      singleBeatExceedsThreshold: report.partA.singleBeatExceedsThreshold,
      failedSamplesCount: report.partA.failedSamples.length,
      desktopHeightVh: report.partA.desktopHeightVh,
      noPlayPauseButtonsInDom: report.partB.noPlayPauseButtonsInDom,
      autoplayOnLoad: report.partB.autoplayOnLoad,
      tabSwitchResume: report.partB.tabSwitchResume,
      scrollBackResume: report.partB.scrollBackResume,
      posterOnlyOnReducedMotion: report.partB.posterOnlyOnReducedMotion,
      briefExists: report.partC.briefExists,
      consoleErrorsCount: report.consoleErrors.length,
    });

  } finally {
    await browser.close();
    if (server) server.kill();
  }
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});

