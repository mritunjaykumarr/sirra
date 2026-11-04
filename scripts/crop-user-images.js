const sharp = require('sharp');

async function main() {
  const img1 = 'C:/Users/mritu/.gemini/antigravity/brain/74917b17-a467-4c57-a49e-85ab1fbbe3a8/.user_uploaded/media_1793805656318_3036fc51.jpg';
  const img2 = 'C:/Users/mritu/.gemini/antigravity/brain/74917b17-a467-4c57-a49e-85ab1fbbe3a8/.user_uploaded/media_1793805713536_3812bf5a.jpg';

  const meta1 = await sharp(img1).metadata();
  console.log('img1 meta:', meta1);
  const meta2 = await sharp(img2).metadata();
  console.log('img2 meta:', meta2);

  // Crop announcement bar from img1 (top ~60px, center around 30% to 70% width)
  await sharp(img1)
    .extract({ left: Math.round(meta1.width * 0.3), top: 0, width: Math.round(meta1.width * 0.4), height: Math.min(100, meta1.height) })
    .toFile('public/logos/crop-announcement-bar.png');

  // Crop chips from img2 (around bottom right of the card)
  await sharp(img2)
    .extract({ left: Math.round(meta2.width * 0.65), top: Math.round(meta2.height * 0.7), width: Math.round(meta2.width * 0.35), height: Math.round(meta2.height * 0.25) })
    .toFile('public/logos/crop-chips-img2.png');

  console.log('Crops generated!');
}

main().catch(console.error);
