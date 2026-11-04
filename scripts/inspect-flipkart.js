const fs = require('fs');
const sharp = require('sharp');

async function main() {
  const svg = fs.readFileSync('public/logos/flipkart.svg', 'utf8');
  console.log('SVG first 500 chars:\n', svg.slice(0, 500));
  
  // Render flipkart.svg directly at 1200x800 to a PNG to see what it looks like
  await sharp('public/logos/flipkart.svg')
    .png()
    .toFile('public/logos/test-flipkart-full.png');

  const meta = await sharp('public/logos/test-flipkart-full.png').metadata();
  console.log('test-flipkart-full meta:', meta);

  // Also trim it
  const trimmed = await sharp('public/logos/test-flipkart-full.png')
    .trim()
    .toBuffer({ resolveWithObject: true });
  console.log('Trim info:', trimmed.info);
}

main().catch(console.error);
