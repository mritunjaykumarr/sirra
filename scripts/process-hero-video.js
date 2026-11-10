/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const FFMPEG_PATH = "C:\\Users\\mritu\\.gemini\\antigravity\\brain\\74917b17-a467-4c57-a49e-85ab1fbbe3a8\\scratch\\node_modules\\ffmpeg-static\\ffmpeg.exe";
const projectRoot = path.resolve(__dirname, "..");
const sourcePath = path.resolve(projectRoot, "..", "assets-source", "video", "hero-source.mp4");
const outDir = path.resolve(projectRoot, "public", "video");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log("=== SIRRA Hero Video Processing (Part B2) ===");
console.log("Source:", sourcePath);
console.log("Output Directory:", outDir);

if (!fs.existsSync(sourcePath)) {
  console.error("Source video not found at:", sourcePath);
  process.exit(1);
}

// 1. Desktop Seamless Loop (hero.mp4)
const desktopMp4 = path.join(outDir, "hero.mp4");
if (!fs.existsSync(desktopMp4) || fs.statSync(desktopMp4).size < 100000) {
  console.log("\n[1/5] Generating seamless 1080p desktop hero.mp4...");
  const cmdDesktopMp4 = `"${FFMPEG_PATH}" -y -i "${sourcePath}" -filter_complex "[0:v]split[v1][v2]; [v1]trim=1:12.96,setpts=PTS-STARTPTS[main]; [v2]trim=0:1,setpts=PTS-STARTPTS[head]; [main][head]xfade=transition=fade:duration=1:offset=10.96,format=yuv420p[outv]" -map "[outv]" -c:v libx264 -profile:v high -crf 24 -preset slow -an -movflags +faststart "${desktopMp4}"`;
  execSync(cmdDesktopMp4, { stdio: "inherit" });
} else {
  console.log("\n[1/5] hero.mp4 already exists:", (fs.statSync(desktopMp4).size / (1024*1024)).toFixed(2), "MB");
}

// 2. Desktop WebM (hero.webm)
const desktopWebm = path.join(outDir, "hero.webm");
console.log("\n[2/5] Generating desktop hero.webm (VP9)...");
const cmdDesktopWebm = `"${FFMPEG_PATH}" -y -i "${desktopMp4}" -c:v libvpx-vp9 -b:v 0 -crf 30 -row-mt 1 -threads 8 -speed 4 -an "${desktopWebm}"`;
execSync(cmdDesktopWebm, { stdio: "inherit" });

// 3. Mobile Portrait 1080x1350 (hero-mobile.mp4)
// Scale to 2400x1350 then center crop 1080x1350
const mobileMp4 = path.join(outDir, "hero-mobile.mp4");
console.log("\n[3/5] Generating mobile portrait 1080x1350 hero-mobile.mp4...");
const cmdMobileMp4 = `"${FFMPEG_PATH}" -y -i "${desktopMp4}" -vf "scale=2400:1350,crop=1080:1350:(in_w-1080)/2:0,format=yuv420p" -c:v libx264 -profile:v high -crf 25 -preset medium -an -movflags +faststart "${mobileMp4}"`;
execSync(cmdMobileMp4, { stdio: "inherit" });

// 4. Mobile Portrait WebM (hero-mobile.webm)
const mobileWebm = path.join(outDir, "hero-mobile.webm");
console.log("\n[4/5] Generating mobile portrait hero-mobile.webm (VP9)...");
const cmdMobileWebm = `"${FFMPEG_PATH}" -y -i "${mobileMp4}" -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 -threads 8 -speed 4 -an "${mobileWebm}"`;
execSync(cmdMobileWebm, { stdio: "inherit" });

// 5. Representative Poster Frame (hero-poster.jpg) - 2400px wide, quality 85
const posterJpg = path.join(outDir, "hero-poster.jpg");
console.log("\n[5/5] Extracting 2400px representative frame hero-poster.jpg...");
const cmdPoster = `"${FFMPEG_PATH}" -y -ss 00:00:03 -i "${desktopMp4}" -vframes 1 -vf "scale=2400:-1" -q:v 3 "${posterJpg}"`;
execSync(cmdPoster, { stdio: "inherit" });

// Summary Report
console.log("\n================ GENERATED ASSETS REPORT ================");
const files = [
  { name: "hero.mp4", path: desktopMp4, maxMb: 8 },
  { name: "hero.webm", path: desktopWebm, maxMb: 8 },
  { name: "hero-mobile.mp4", path: mobileMp4, maxMb: 6 },
  { name: "hero-mobile.webm", path: mobileWebm, maxMb: 6 },
  { name: "hero-poster.jpg", path: posterJpg, maxMb: 1 },
];

files.forEach((f) => {
  const stat = fs.statSync(f.path);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
  const passed = stat.size < f.maxMb * 1024 * 1024;
  console.log(`- ${f.name}: ${sizeMb} MB (Limit: <${f.maxMb} MB) -> ${passed ? "PASS" : "OVER LIMIT"}`);
});
console.log("=========================================================\n");
