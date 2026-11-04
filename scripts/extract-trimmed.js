const sharp = require('sharp');

async function main() {
  await sharp('public/logos/test-flipkart-full.png')
    .extract({ left: 138, top: 278, width: 924, height: 244 })
    .toFile('public/logos/test-flipkart-trimmed.png');
  console.log('Saved test-flipkart-trimmed.png');
}
main().catch(console.error);
