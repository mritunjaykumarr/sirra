/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require("puppeteer-core");
const path = require("path");
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
        try { execSync(`taskkill /F /PID ${pid}`); } catch { }
      }
    }
    await new Promise((r) => setTimeout(r, 1000));
  } catch { }

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
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--autoplay-policy=no-user-gesture-required"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 2000));

    // Check dev badge (must be 0)
    const badgeCount = await page.$$eval("#hero-youtube-dev-badge", (els) => els.length);
    console.log(`YouTube preview badge present: ${badgeCount > 0} (Expected: false)`);

    // Check video state
    const videoData = await page.evaluate(() => {
      const vid = document.querySelector("video");
      const poster = document.querySelector("img[alt='SIRRA Fine Fragrance']");
      return {
        hasVideo: Boolean(vid),
        paused: vid ? vid.paused : null,
        currentTime: vid ? vid.currentTime : null,
        src: vid ? vid.currentSrc : null,
        readyState: vid ? vid.readyState : null,
        posterOpacity: poster ? window.getComputedStyle(poster).opacity : null,
        videoOpacity: vid ? window.getComputedStyle(vid).opacity : null,
      };
    });
    console.log("Hero Video Playback State:", videoData);

    const shotPath = path.join(BRAIN_DIR, "verify-new-hero-video-playing.png");
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot to: ${shotPath}`);

  } finally {
    await browser.close();
    try { server.kill("SIGTERM"); } catch { }
  }
}

run().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});

