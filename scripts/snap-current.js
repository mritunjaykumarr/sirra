const puppeteer = require('puppeteer-core');
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // 1. Capture announcement bar
  const bar = await page.$('#announcement-bar');
  if (bar) {
    await bar.screenshot({ path: 'public/logos/current-announcement-bar.png' });
    console.log('Saved current-announcement-bar.png');
  }

  // 2. Capture ScentChapters available on row
  await page.evaluate(() => {
    window.scrollTo(0, 1200);
  });
  await new Promise(r => setTimeout(r, 1000));
  
  const scentSection = await page.$('#scents');
  if (scentSection) {
    await scentSection.screenshot({ path: 'public/logos/current-scents-section.png' });
    console.log('Saved current-scents-section.png');
  }

  await browser.close();
}

main().catch(console.error);
