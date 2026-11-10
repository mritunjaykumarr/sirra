/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const FFMPEG_PATH = "C:\\Users\\mritu\\.gemini\\antigravity\\brain\\74917b17-a467-4c57-a49e-85ab1fbbe3a8\\scratch\\node_modules\\ffmpeg-static\\ffmpeg.exe";
const projectRoot = path.resolve(__dirname, "..");
const videoDir = path.resolve(projectRoot, "public", "video");
const sourceVideo = path.join(videoDir, "videoplayback.mp4");

console.log("=== Encoding Hero Video Suite from videoplayback.mp4 ===");
console.log("Source:", sourceVideo);

if (!fs.existsSync(sourceVideo)) {
  console.error("Error: videoplayback.mp4 not found in", videoDir);
  process.exit(1);
}

// 1. Desktop MP4
const desktopMp4 = path.join(videoDir, "hero.mp4");
console.log("\n[1/5] Encoding desktop hero.mp4 (H.264, +faststart, muted)...");
const cmdDesktop = `"${FFMPEG_PATH}" -y -i "${sourceVideo}" -c:v libx264 -profile:v high -crf 22 -preset slow -an -movflags +faststart "${desktopMp4}"`;
execSync(cmdDesktop, { stdio: "inherit" });

// 2. Desktop WebM
const desktopWebm = path.join(videoDir, "hero.webm");
console.log("\n[2/5] Encoding desktop hero.webm (VP9)...");
const cmdWebm = `"${FFMPEG_PATH}" -y -i "${desktopMp4}" -c:v libvpx-vp9 -b:v 0 -crf 30 -row-mt 1 -threads 8 -speed 4 -an "${desktopWebm}"`;
execSync(cmdWebm, { stdio: "inherit" });

// 3. Mobile MP4 (Portrait Crop / Optimization)
const mobileMp4 = path.join(videoDir, "hero-mobile.mp4");
console.log("\n[3/5] Encoding mobile portrait hero-mobile.mp4...");
const cmdMobile = `"${FFMPEG_PATH}" -y -i "${desktopMp4}" -vf "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920:flags=lanczos,format=yuv420p" -c:v libx264 -profile:v high -crf 24 -preset medium -an -movflags +faststart "${mobileMp4}"`;
execSync(cmdMobile, { stdio: "inherit" });

// 4. Mobile WebM
const mobileWebm = path.join(videoDir, "hero-mobile.webm");
console.log("\n[4/5] Encoding mobile portrait hero-mobile.webm (VP9)...");
const cmdMobileWebm = `"${FFMPEG_PATH}" -y -i "${mobileMp4}" -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 -threads 8 -speed 4 -an "${mobileWebm}"`;
execSync(cmdMobileWebm, { stdio: "inherit" });

// 5. Representative Poster Frame at 1s
const posterJpg = path.join(videoDir, "hero-poster.jpg");
console.log("\n[5/5] Extracting 2400px poster frame hero-poster.jpg at 1s...");
const cmdPoster = `"${FFMPEG_PATH}" -y -ss 00:00:01 -i "${desktopMp4}" -vframes 1 -vf "scale=2400:-1" -q:v 3 "${posterJpg}"`;
execSync(cmdPoster, { stdio: "inherit" });

console.log("\n=== Complete! Video suite generated successfully. ===");
console.log("Desktop MP4:", (fs.statSync(desktopMp4).size / (1024 * 1024)).toFixed(2), "MB");
console.log("Desktop WebM:", (fs.statSync(desktopWebm).size / (1024 * 1024)).toFixed(2), "MB");
console.log("Mobile MP4:", (fs.statSync(mobileMp4).size / (1024 * 1024)).toFixed(2), "MB");
console.log("Mobile WebM:", (fs.statSync(mobileWebm).size / (1024 * 1024)).toFixed(2), "MB");
console.log("Poster JPG:", (fs.statSync(posterJpg).size / 1024).toFixed(2), "KB");

