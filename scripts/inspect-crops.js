const sharp = require('sharp');

async function main() {
  const metaBar = await sharp('public/logos/current-announcement-bar.png').metadata();
  console.log('Bar meta:', metaBar);

  // Announcement bar chips are in the center
  await sharp('public/logos/current-announcement-bar.png')
    .extract({
      left: Math.round(metaBar.width * 0.35),
      top: 0,
      width: Math.round(metaBar.width * 0.3),
      height: metaBar.height
    })
    .toFile('public/logos/inspect-bar-chips.png');

  console.log('inspect-bar-chips.png created');
}

main().catch(console.error);
