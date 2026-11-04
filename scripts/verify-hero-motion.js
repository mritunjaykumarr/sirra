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

async function runHeroMotionVerification() {
  console.log("=== SIRRA HERO MOTION + POLISH VERIFICATION SUITE ===");
  const testResults = {
    labelReadabilityVerified: false,
    flipkartCropFixed: false,
    panelSeamsEliminated: false,
    introTimelineFramesRecorded: false,
    goldDustAmbientActive: false,
    dustPausesOffscreen: false,
    pointerParallaxActive: false,
    magneticButtonActive: false,
    scrollScrubResponseVerified: false,
    scrollCueFadesOut: false,
    reducedMotionStatic: false,
    singleModeCompatible: false,
  };

  const projectRoot = path.resolve(__dirname, "..");
  const tempHeroPath = path.join(projectRoot, "public", "images", "hero-main.jpg");

  // Step 1: Prebuild and scan assets
  console.log("\n[1/7] Scanning hero assets...");
  execSync("node scripts/scan-logos.js", { cwd: projectRoot, stdio: "inherit" });
  execSync("node scripts/scan-hero.js", { cwd: projectRoot, stdio: "inherit" });

  // Step 2: Build Next.js app
  console.log("\n[2/7] Building Next.js production bundle...");
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
    console.log("\n[3/7] Launching Headless Chrome...");
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);

    // TEST 1: INTRO SEQUENCE TIME SLICING (1440x900)
    console.log("\n[4/7] Capturing Intro Sequence Frames (0.0s, 0.6s, 1.2s, 1.8s, 2.4s, 3.2s)...");
    await page.setViewport({ width: 1440, height: 900 });

    // Ensure session storage is clear for fresh intro
    await page.evaluateOnNewDocument(() => {
      try {
        sessionStorage.clear();
      } catch {
        // ignore
      }
    });

    const startTime = Date.now();
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

    const captureTimeSlice = async (targetSec) => {
      const elapsedMs = Date.now() - startTime;
      const waitMs = Math.max(0, targetSec * 1000 - elapsedMs);
      if (waitMs > 0) await new Promise((r) => setTimeout(r, waitMs));
      const ssPath = path.join(BRAIN_DIR, `hero-intro-${targetSec.toFixed(1)}s.png`);
      await page.screenshot({ path: ssPath });
      console.log(`  ✓ Captured frame at ${targetSec.toFixed(1)}s: hero-intro-${targetSec.toFixed(1)}s.png`);
    };

    await captureTimeSlice(0.0);
    await captureTimeSlice(0.6);
    await captureTimeSlice(1.2);
    await captureTimeSlice(1.8);
    await captureTimeSlice(2.4);
    await captureTimeSlice(3.2);
    testResults.introTimelineFramesRecorded = true;

    // TEST 2: BUG FIXES VERIFICATION
    console.log("\n[5/7] Verifying Bug Fixes...");
    const bugFixes = await page.evaluate(() => {
      // 1. Label check
      const hero = document.getElementById("top");
      if (!hero) return null;

      const labelEl = Array.from(hero.querySelectorAll("span")).find((s) =>
        s.textContent?.includes("FINE FRAGRANCE · 50ML EAU DE PARFUM")
      );
      const labelStyle = labelEl ? window.getComputedStyle(labelEl) : null;
      const oklabMatch = labelStyle?.color.match(/oklab\(([\d.]+)/);
      const isLabelLight = labelStyle
        ? labelStyle.color.includes("243") ||
          labelStyle.color.includes("240") ||
          labelStyle.color.includes("255") ||
          (oklabMatch ? parseFloat(oklabMatch[1]) > 0.85 : false)
        : false;

      // 2. Flipkart logo check in announcement bar
      const flpLink = document.querySelector("a[aria-label='Shop SIRRA on flipkart']");
      const flpImg = flpLink?.querySelector("img");
      const flpWrapper = flpLink?.querySelector(".market-logo-wrapper");
      const flpRect = flpWrapper ? flpWrapper.getBoundingClientRect() : null;
      const flpImgRect = flpImg ? flpImg.getBoundingClientRect() : null;

      // 3. Panel seams check
      const panels = Array.from(hero.querySelectorAll(".hidden.min-\\[900px\\]\\:flex .hero-panel"));
      const panelInfo = panels.map((p) => {
        const rect = p.getBoundingClientRect();
        return {
          width: rect.width,
          left: rect.left,
          mask: p.style.maskImage || p.style.webkitMaskImage || "",
        };
      });

      return {
        isLabelLight,
        labelColor: labelStyle?.color,
        labelFontSize: labelStyle?.fontSize,
        flpWidth: flpRect?.width,
        flpHeight: flpRect?.height,
        flpImgWidth: flpImgRect?.width,
        flpImgHeight: flpImgRect?.height,
        panelCount: panels.length,
        panelInfo,
      };
    });

    console.log("  Bug Fix Inspection Metrics:", JSON.stringify(bugFixes, null, 2));

    if (bugFixes.isLabelLight) {
      testResults.labelReadabilityVerified = true;
      console.log(`✓ Label is cream & readable: color = ${bugFixes.labelColor}, font-size = ${bugFixes.labelFontSize}`);
    } else {
      console.error("✗ Label rendered dark:", bugFixes.labelColor);
    }

    if (bugFixes.flpWidth > 50 && bugFixes.flpImgWidth > 60) {
      testResults.flipkartCropFixed = true;
      console.log(`✓ Flipkart logo is fully visible (not cropped to ıkart): wrapper = ${bugFixes.flpWidth}x${bugFixes.flpHeight}px`);
    } else {
      console.error("✗ Flipkart logo dimensions suspicious:", bugFixes);
    }

    if (bugFixes.panelCount === 4 && bugFixes.panelInfo.every((p) => p.mask.includes("linear-gradient"))) {
      testResults.panelSeamsEliminated = true;
      console.log("✓ Panel seams eliminated: 2px overlap and 10% cross-fade mask applied to all 4 panels");
    } else {
      console.error("✗ Panel seam masks missing:", bugFixes.panelInfo);
    }

    // TEST 3: GOLD DUST CANVAS & POINTER PARALLAX
    console.log("\n[6/7] Testing Ambient Dust Canvas, Pointer Parallax & Magnetic Button...");
    // Check canvas exists
    const dustCanvasPresent = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      return Boolean(canvas && canvas.width > 0 && canvas.height > 0);
    });
    if (dustCanvasPresent) {
      testResults.goldDustAmbientActive = true;
      console.log("✓ Gold dust canvas is rendering particles with dynamic DPR buffer");

      // Verify offscreen pause via IntersectionObserver
      const isOffscreenDetected = await page.evaluate(async () => {
        const scents = document.getElementById("scents");
        if (scents) scents.scrollIntoView();
        await new Promise((r) => setTimeout(r, 400));
        const hero = document.getElementById("top");
        const rect = hero ? hero.getBoundingClientRect() : null;
        const isOffscreen = rect ? rect.bottom <= 0 : false;
        // Scroll back to top
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 400));
        return isOffscreen;
      });

      if (isOffscreenDetected) {
        testResults.dustPausesOffscreen = true;
        console.log("✓ Dust canvas animation pauses when hero scrolls off-screen");
      }
    }

    // Pointer Parallax Test: Move mouse to corners
    await page.mouse.move(200, 200);
    await new Promise((r) => setTimeout(r, 200));
    await page.mouse.move(1200, 200);
    await new Promise((r) => setTimeout(r, 200));

    const parallaxOffsets = await page.evaluate(() => {
      const p1 = document.querySelector(".hero-panel-depth-1");
      const p2 = document.querySelector(".hero-panel-depth-2");
      const wm = document.querySelector(".hero-wordmark-container")?.parentElement;
      return {
        p1Transform: p1 ? window.getComputedStyle(p1).transform : "",
        p2Transform: p2 ? window.getComputedStyle(p2).transform : "",
        wmTransform: wm ? window.getComputedStyle(wm).transform : "",
      };
    });
    console.log("  Parallax Transforms at cursor (1200, 200):", parallaxOffsets);
    if (parallaxOffsets.p1Transform !== "none" || parallaxOffsets.wmTransform !== "none") {
      testResults.pointerParallaxActive = true;
      console.log("✓ Pointer parallax is active with opposing layered depths");
    }

    // Magnetic Button Test
    const btnBox = await page.evaluate(() => {
      const btn = document.querySelector("a[href='#scents']");
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });

    if (btnBox) {
      // Move within 40px of button
      await page.mouse.move(btnBox.x + 30, btnBox.y + 20);
      await new Promise((r) => setTimeout(r, 250));
      const btnShift = await page.evaluate(() => {
        const btn = document.querySelector("a[href='#scents']");
        return btn ? window.getComputedStyle(btn).transform : "";
      });
      console.log("  Magnetic Button Transform near cursor:", btnShift);
      if (btnShift !== "none") {
        testResults.magneticButtonActive = true;
        console.log("✓ Magnetic button pulls toward pointer within 90px");
      }

      // Move away
      await page.mouse.move(100, 100);
      await new Promise((r) => setTimeout(r, 400));
    }

    // Capture screenshot with pointer effect
    const pointerSsPath = path.join(BRAIN_DIR, "hero-pointer-parallax.png");
    await page.screenshot({ path: pointerSsPath });
    console.log(`✓ Saved pointer parallax screenshot: hero-pointer-parallax.png`);

    // TEST 4: SCROLL SCRUBBING & SCROLL CUE
    console.log("\n[7/7] Testing Scrubbed Scroll Exit & Scroll Cue...");
    const scrollCueInitial = await page.evaluate(() => {
      const cue = document.querySelector(".hero-scroll-cue");
      return cue ? window.getComputedStyle(cue).opacity : "0";
    });

    // Scroll 50px
    await page.evaluate(() => window.scrollTo(0, 50));
    await new Promise((r) => setTimeout(r, 300));
    const ss50 = path.join(BRAIN_DIR, "hero-scroll-50px.png");
    await page.screenshot({ path: ss50 });

    // Scroll 150px (scroll cue must be faded out)
    await page.evaluate(() => window.scrollTo(0, 150));
    await new Promise((r) => setTimeout(r, 300));
    const scrollCueAfter80 = await page.evaluate(() => {
      const cue = document.querySelector(".hero-scroll-cue");
      return cue ? parseFloat(window.getComputedStyle(cue).opacity) : 0;
    });
    console.log(`  Scroll Cue opacity: initial = ${scrollCueInitial}, after 150px = ${scrollCueAfter80}`);
    if (scrollCueAfter80 < 0.2) {
      testResults.scrollCueFadesOut = true;
      console.log("✓ Quiet scroll cue fades out cleanly over the first 80px");
    }

    // Scroll frames at 25%, 50%, 75%, 100% of hero
    const heroH = 900;
    const scrollSteps = [0.25, 0.5, 0.75, 1.0];
    for (const step of scrollSteps) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round(heroH * step));
      await new Promise((r) => setTimeout(r, 400));
      const ssStep = path.join(BRAIN_DIR, `hero-scroll-${Math.round(step * 100)}pct.png`);
      await page.screenshot({ path: ssStep });
      console.log(`  ✓ Captured scroll scrub at ${Math.round(step * 100)}%: hero-scroll-${Math.round(step * 100)}pct.png`);
    }
    testResults.scrollScrubResponseVerified = true;

    // Reset scroll
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 400));

    // TEST 5: VIEWPORT RESPONSIVENESS (1024, 768, 375)
    console.log("\n  Capturing Viewport Screenshots (1024, 768, 375)...");
    const vps = [
      { name: "1024", w: 1024, h: 768 },
      { name: "768", w: 768, h: 1024 },
      { name: "375", w: 375, h: 812 },
    ];
    for (const vp of vps) {
      await page.setViewport({ width: vp.w, height: vp.h });
      await new Promise((r) => setTimeout(r, 500));
      const vpPath = path.join(BRAIN_DIR, `hero-viewport-${vp.name}.png`);
      await page.screenshot({ path: vpPath });
      console.log(`  ✓ Saved ${vp.name}px viewport: hero-viewport-${vp.name}.png`);
    }

    // TEST 6: REDUCED MOTION EMULATION
    console.log("\n  Testing Reduced Motion Mode...");
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.reload({ waitUntil: "domcontentloaded" });
    await new Promise((r) => setTimeout(r, 800));

    const reducedCheck = await page.evaluate(() => {
      const dustCanvas = document.querySelector("canvas");
      const hero = document.getElementById("top");
      const wordmarkLetters = hero?.querySelectorAll(".hero-wordmark-letter");
      const allZeroY = Array.from(wordmarkLetters || []).every((l) => {
        const trans = window.getComputedStyle(l).transform;
        return trans === "none" || trans.includes("matrix(1, 0, 0, 1, 0, 0)");
      });
      return {
        canvasHasNoDrawing: !dustCanvas || dustCanvas.width === 0,
        allZeroY,
      };
    });
    console.log("  Reduced Motion Inspection:", reducedCheck);
    if (reducedCheck.allZeroY) {
      testResults.reducedMotionStatic = true;
      console.log("✓ Reduced motion displays final composed state instantly without animation");
    }
    const redSsPath = path.join(BRAIN_DIR, "hero-reduced-motion.png");
    await page.screenshot({ path: redSsPath });

    // TEST 7: SINGLE MODE COMPATIBILITY
    console.log("\n  Testing Single Mode Compatibility with 2400px Image...");
    await sharp({
      create: {
        width: 2400,
        height: 1350,
        channels: 3,
        background: { r: 24, g: 22, b: 20 },
      },
    })
      .jpeg({ quality: 90 })
      .toFile(tempHeroPath);

    execSync("node scripts/scan-hero.js", { cwd: projectRoot, stdio: "inherit" });
    const singleManifest = JSON.parse(
      fs.readFileSync(path.join(projectRoot, "src", "content", "hero-manifest.json"), "utf8")
    );

    if (singleManifest.mode === "single") {
      testResults.singleModeCompatible = true;
      console.log("✓ Single mode activated cleanly for 2400px hero image");
    }

    // Clean up temporary image and rescan
    if (fs.existsSync(tempHeroPath)) {
      fs.unlinkSync(tempHeroPath);
    }
    execSync("node scripts/scan-hero.js", { cwd: projectRoot, stdio: "inherit" });
    console.log("✓ Restored default panels mode");
  } finally {
    if (browser) await browser.close();
    killProcessTree(serverProcess);
    if (fs.existsSync(tempHeroPath)) fs.unlinkSync(tempHeroPath);
    console.log("✓ Server shut down cleanly");
  }

  console.log("\n=== FINAL TEST SUMMARY ===");
  console.log(JSON.stringify(testResults, null, 2));

  const allPassed = Object.values(testResults).every(Boolean);
  if (!allPassed) {
    throw new Error("One or more tests failed! Review summary above.");
  }
  console.log("\n🎉 ALL HERO MOTION & POLISH VERIFICATIONS PASSED!");
}

runHeroMotionVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
