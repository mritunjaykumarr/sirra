/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require("puppeteer-core");
const http = require("http");
const path = require("path");
const { spawn } = require("child_process");

const BRAIN_DIR = "C:\\Users\\mritu\\.gemini\\antigravity\\brain\\74917b17-a467-4c57-a49e-85ab1fbbe3a8";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function check() {
      http
        .get(url, (res) => {
          if (res.statusCode === 200 || res.statusCode === 304) resolve();
          else setTimeout(check, 400);
        })
        .on("error", () => {
          if (Date.now() - start > timeoutMs) reject(new Error("Timeout"));
          else setTimeout(check, 400);
        });
    }
    check();
  });
}

async function diagnose() {
  console.log("=== Diagnosing Blank Space After Hero (Part A) ===");
  let serverProcess = null;
  let browser = null;

  try {
    try {
      await waitForServer(BASE_URL, 1500);
      console.log(`Server already running on port ${PORT}`);
    } catch {
      console.log(`Starting Next.js server on port ${PORT}...`);
      serverProcess = spawn("npx", ["next", "start", "-p", String(PORT)], {
        cwd: path.resolve(__dirname, ".."),
        shell: true,
      });
      await waitForServer(BASE_URL, 30000);
    }

    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    for (const vp of [
      { name: "1440x900", width: 1440, height: 900 },
      { name: "375x667", width: 375, height: 667 },
    ]) {
      console.log(`\n--------------------------------------------------`);
      console.log(`Diagnosing Viewport: ${vp.name}`);
      console.log(`--------------------------------------------------`);

      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(BASE_URL, { waitUntil: "networkidle2" });
      await new Promise((r) => setTimeout(r, 2000));

      // Get dimensions of hero, marquee, and range
      const layoutInfo = await page.evaluate(() => {
        const hero = document.querySelector("#top");
        const marquee = document.querySelector(".animate-marquee")?.closest("div");
        const range = document.querySelector("#range");

        const heroRect = hero?.getBoundingClientRect();
        const marqueeRect = marquee?.getBoundingClientRect();
        const rangeRect = range?.getBoundingClientRect();

        return {
          hero: heroRect ? { top: heroRect.top + window.scrollY, height: heroRect.height } : null,
          marquee: marqueeRect ? { top: marqueeRect.top + window.scrollY, height: marqueeRect.height } : null,
          range: rangeRect ? { top: rangeRect.top + window.scrollY, height: rangeRect.height } : null,
        };
      });

      console.log("Section positions:", JSON.stringify(layoutInfo, null, 2));

      const rangeStart = layoutInfo.range ? layoutInfo.range.top : 900;
      const rangeHeight = layoutInfo.range ? layoutInfo.range.height : 2500;
      const rangeEnd = rangeStart + rangeHeight;

      const steps = 10;
      const stepSize = (rangeEnd - (rangeStart - 200)) / steps;

      for (let i = 0; i <= steps; i++) {
        const targetScroll = Math.round((rangeStart - 200) + i * stepSize);

        await page.evaluate((y) => {
          window.scrollTo(0, y);
        }, targetScroll);

        await new Promise((r) => setTimeout(r, 600));

        const stepData = await page.evaluate((stepIdx, scrollY) => {
          const beat1 = document.querySelector(".range-beat-1");
          const beat2 = document.querySelector(".range-beat-2");
          const beat3 = document.querySelector(".range-beat-3");
          const card1 = document.querySelector(".range-card");
          const beat5 = document.querySelector("#range h2");
          const stickyTrack = document.querySelector("#range > div:nth-child(3)");
          const stickyContent = stickyTrack?.firstElementChild;

          function getElInfo(el, name) {
            if (!el) return { name, exists: false };
            const cs = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return {
              name,
              exists: true,
              opacity: cs.opacity,
              color: cs.color,
              visibility: cs.visibility,
              display: cs.display,
              transform: cs.transform,
              rect: {
                top: Math.round(rect.top),
                bottom: Math.round(rect.bottom),
                height: Math.round(rect.height),
                inViewport: rect.bottom > 0 && rect.top < window.innerHeight,
              },
            };
          }

          const stickyTrackCs = stickyTrack ? window.getComputedStyle(stickyTrack) : null;
          const stickyContentCs = stickyContent ? window.getComputedStyle(stickyContent) : null;
          const stickyContentRect = stickyContent?.getBoundingClientRect();

          // ScrollTrigger info
          const stList = [];
          if (window.ScrollTrigger && window.ScrollTrigger.getAll) {
            window.ScrollTrigger.getAll().forEach((st, idx) => {
              const trg = st.trigger ? (st.trigger.id || st.trigger.className || st.trigger.tagName) : "none";
              stList.push({
                idx,
                trigger: trg,
                start: Math.round(st.start),
                end: Math.round(st.end),
                progress: Number(st.progress.toFixed(3)),
                isActive: st.isActive,
                pin: !!st.pin,
              });
            });
          }

          return {
            stepIdx,
            scrollY,
            windowHeight: window.innerHeight,
            stickyTrack: stickyTrack ? {
              height: stickyTrackCs.height,
              top: stickyTrack.getBoundingClientRect().top,
            } : null,
            stickyContent: stickyContent ? {
              position: stickyContentCs.position,
              topStyle: stickyContentCs.top,
              rectTop: Math.round(stickyContentRect.top),
              rectHeight: Math.round(stickyContentRect.height),
            } : null,
            beat1: getElInfo(beat1, "Beat 1"),
            beat2: getElInfo(beat2, "Beat 2"),
            beat3: getElInfo(beat3, "Beat 3"),
            card1: getElInfo(card1, "Card 1"),
            beat5: getElInfo(beat5, "Beat 5"),
            scrollTriggers: stList,
          };
        }, i, targetScroll);

        const screenshotPath = path.join(BRAIN_DIR, `diag-${vp.name}-step-${i}.png`);
        await page.screenshot({ path: screenshotPath });

        console.log(`\n[${vp.name} Step ${i}/${steps}] ScrollY: ${targetScroll}px -> Saved ${path.basename(screenshotPath)}`);
        console.log(`  StickyContent: pos=${stepData.stickyContent?.position}, topStyle=${stepData.stickyContent?.topStyle}, rectTop=${stepData.stickyContent?.rectTop}px, rectH=${stepData.stickyContent?.rectHeight}px`);
        console.log(`  Beat 1: opacity=${stepData.beat1.opacity}, rectTop=${stepData.beat1.rect?.top}px, inVP=${stepData.beat1.rect?.inViewport}`);
        console.log(`  Beat 2: opacity=${stepData.beat2.opacity}, rectTop=${stepData.beat2.rect?.top}px, inVP=${stepData.beat2.rect?.inViewport}`);
        console.log(`  Beat 3: opacity=${stepData.beat3.opacity}, rectTop=${stepData.beat3.rect?.top}px, inVP=${stepData.beat3.rect?.inViewport}`);
        if (i === 0 || i === 3 || i === 6 || i === 10) {
          console.log(`  ScrollTriggers:`, JSON.stringify(stepData.scrollTriggers));
        }
      }
    }

    // Scan every section element on the page for height > 100svh and verify visible content
    const emptySectionScan = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll("main > section, main > div[id], section, div[id]"));
      const windowHeight = window.innerHeight;
      const issues = [];

      sections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        const text = sec.innerText?.trim() || "";
        const images = sec.querySelectorAll("img, video");
        const hasVisibleTextOrMedia = text.length > 0 || images.length > 0;
        const heightInSvh = rect.height / windowHeight;

        if (heightInSvh > 1.0 && !hasVisibleTextOrMedia) {
          issues.push({
            id: sec.id || sec.className || sec.tagName,
            height: rect.height,
            heightInSvh: heightInSvh.toFixed(2),
            hasText: text.length > 0,
            hasMedia: images.length > 0,
          });
        }
      });
      return { totalSectionsScanned: sections.length, issues };
    });

    console.log("\n[Empty Section Scan Results]:", JSON.stringify(emptySectionScan, null, 2));

    console.log("\n=== Diagnosis Complete ===");
  } catch (err) {
    console.error("Diagnosis error:", err);
  } finally {
    if (browser) await browser.close();
    if (serverProcess) serverProcess.kill();
  }
}

diagnose();
