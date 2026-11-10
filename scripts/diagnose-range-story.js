/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const { spawn, execSync } = require("child_process");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const BRAIN_DIR = "C:\\Users\\mritu\\.gemini\\antigravity\\brain\\74917b17-a467-4c57-a49e-85ab1fbbe3a8";

function isPortOpen(port) {
  const http = require("http");
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

async function main() {
  const server = await startServerIfNeeded();

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 800));

    // Get section coordinates
    const sectionInfo = await page.evaluate(() => {
      const el = document.getElementById("range");
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const hero = document.querySelector("section");
      const heroHeight = hero ? hero.getBoundingClientRect().height : 900;
      return {
        top: Math.round(rect.top + window.scrollY),
        height: Math.round(rect.height),
        heroHeight,
      };
    });

    console.log("Section Info:", sectionInfo);
    if (!sectionInfo) throw new Error("#range element not found");

    // 1. DOM Span Count
    const spanCount = await page.evaluate(() => {
      const range = document.getElementById("range");
      if (!range) return 0;
      return range.querySelectorAll("span").length;
    });
    console.log(`DOM spans in #range: ${spanCount}`);

    // 2. 40 Evenly Spaced Samples Through #range
    const startY = sectionInfo.top;
    const endY = sectionInfo.top + sectionInfo.height;
    const stepSize = (endY - startY) / 39;

    const samples = [];
    console.log("\n--- Sampling 40 Scroll Positions in #range ---");
    for (let i = 0; i < 40; i++) {
      const currentScrollY = Math.round(startY + i * stepSize);
      await page.evaluate((y) => {
        window.scrollTo({ top: y, behavior: "instant" });
        if (window.ScrollTrigger) window.ScrollTrigger.update();
      }, currentScrollY);
      await new Promise((r) => setTimeout(r, 60));

      const sample = await page.evaluate((idx, y) => {
        const beat1 = document.querySelector(".range-beat-1");
        const beat2 = document.querySelector(".range-beat-2");
        const beat3 = document.querySelector(".range-beat-3");
        const beat5 = document.querySelector(".range-beat-5");

        const getStyle = (el) => {
          if (!el) return { opacity: 0, transform: "none" };
          const comp = window.getComputedStyle(el);
          return {
            opacity: parseFloat(comp.opacity) || 0,
            transform: comp.transform || "none",
          };
        };

        const b1 = getStyle(beat1);
        const b2 = getStyle(beat2);
        const b3 = getStyle(beat3);
        const b5 = getStyle(beat5);

        const visibleBeats = [b1, b2, b3].filter((b) => b.opacity > 0.05).length;

        return {
          index: idx,
          scrollY: y,
          beat1: b1,
          beat2: b2,
          beat3: b3,
          beat5: b5,
          visibleBeatsCount: visibleBeats,
        };
      }, i, currentScrollY);

      samples.push(sample);
      console.log(
        `Sample ${i.toString().padStart(2, "0")} (scrollY ${currentScrollY}px): ` +
        `B1 opacity=${sample.beat1.opacity.toFixed(2)}, ` +
        `B2 opacity=${sample.beat2.opacity.toFixed(2)}, ` +
        `B3 opacity=${sample.beat3.opacity.toFixed(2)} | ` +
        `Beats > 0.05: ${sample.visibleBeatsCount}`
      );
    }

    // 3. Performance Trace of Continuous Scroll
    console.log("\n--- Running Continuous Scroll Performance Trace ---");
    const tracePath = path.join(BRAIN_DIR, "diag-range-scroll-trace.json");
    await page.tracing.start({ path: tracePath, screenshots: false });

    // Smooth scroll from start to end over 2.5 seconds
    await page.evaluate(async (start, end) => {
      const duration = 2500;
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
    console.log(`Trace saved to: ${tracePath}`);

    // Analyze Trace for Long Tasks and Frame Times
    const traceData = JSON.parse(fs.readFileSync(tracePath, "utf8"));
    const events = traceData.traceEvents || [];
    const longTasks = events.filter((e) => e.name === "RunTask" && e.dur > 50000); // > 50ms
    console.log(`Long tasks detected (>50ms): ${longTasks.length}`);

    // Write Diagnosis Report
    const diagReport = {
      timestamp: new Date().toISOString(),
      viewport: "1440x900",
      sectionHeight: sectionInfo.height,
      spanCount,
      samples,
      longTasksCount: longTasks.length,
      ghostingPositions: samples.filter((s) => s.visibleBeatsCount > 1).length,
    };

    const outPath = path.join(BRAIN_DIR, "diag-range-story-report.json");
    fs.writeFileSync(outPath, JSON.stringify(diagReport, null, 2), "utf8");
    console.log(`\nDiagnosis complete. Report saved to: ${outPath}`);
    console.log(`Samples where multiple beats ghosting (> 0.05 opacity): ${diagReport.ghostingPositions} / 40`);

  } finally {
    await browser.close();
    if (server) server.kill();
  }
}

main().catch(console.error);
