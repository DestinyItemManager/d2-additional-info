import { getAll, loadLocal } from 'destiny2-manifest/node';
import { writeFile, copyFile, imagesSame, downloadFile, uriToFileName } from './helpers';

import { D2CalculatedSeason } from '../data/seasons/d2-season-info';

loadLocal();

const usePNGCompare = process.env.PNGCompare === 'true' ? true : false;

const watermarks = [
  ...new Set(
    getAll('DestinyInventoryItemDefinition')
      .map((o) => o.quality?.displayVersionWatermarkIcons)
      .flat()
      .filter((o) => o !== undefined && o !== '')
  ),
];
const watermarkToSeason = {} as Record<string, number>;
const existingWatermarks = [] as string[];

if (usePNGCompare) {
  console.log(`Generating watermark to season via PNG comparison.`);
  const watermarkDIR = `./data/seasons/watermarks/`;
  const watermarkTestDIR = `${watermarkDIR}test/`;

  (async () => {
    // Download all season watermarks from Bungie
    for await (const uri of watermarks) {
      await downloadFile(
        `https://www.bungie.net${uri}`,
        `${watermarkTestDIR}${uriToFileName(uri)}`
      );
    }

    // compare season watermarks from Bungie to previously downloaded images from Bungie
    let newSeason = null;
    for (let season = 1; season <= D2CalculatedSeason; season++) {
      let match = false;
      for await (const uri of watermarks) {
        const BungieFile = `${watermarkTestDIR}${uriToFileName(uri)}`;
        const D2AIFile = `${watermarkDIR}${season}.png`;
        if (await imagesSame(D2AIFile, BungieFile)) {
          existingWatermarks.push(uri); // used to detect new season overlay via filter later
          watermarkToSeason[uri] = season;
          match = true;
          continue;
        }
      }
      if (!match) {
        // New Season overlay detected!
        newSeason = season;
      }
    }

    if (newSeason) {
      // New Season overlay was detected, add to JSON object and make a copy of the file
      const diff = watermarks.filter((uri) => !existingWatermarks.includes(uri));
      const uri = diff.length === 1 && diff.toString();
      if (uri) {
        watermarkToSeason[uri] = newSeason;
        copyFile(`${watermarkTestDIR}${uriToFileName(uri)}`, `${watermarkDIR}${newSeason}.png`);
      } else {
        console.log(
          `More than 1 new watermark needs to be verified. Manual intervention required!`
        );
        console.table(diff);
      }
    }

    writeFile('./output/watermark-to-season.json', watermarkToSeason);
  })().catch((e) => {
    console.log(e);
    process.exit(1);
  });
} else {
  console.log(`Generating watermark to season via DestinyInventoryItemDefinition.`);
  const inventoryItems = getAll('DestinyInventoryItemDefinition');

  const hashes: number[] = [
    193869522, // 1 - Lucky Pants
    4203034886, // 2 - Zephyr
    222565136, // 3 - Solstice Vest (Resplendent)
    3829285960, // 4 - Horror Story
    66875353, // 5 - Avalanche
    156518114, // 6 - Inaugural Revelry Greaves
    3084686800, // 7 - Solstice Vest (Resplendent)
    528834068, // 8 - BrayTech Werewolf
    489480785, // 9 - High-Minded Complex
    79417130, // 10 - Simulator Grips
    539497618, // 11 - Wildwood Strides
  ];

  for (const hash in hashes) {
    watermarkToSeason[
      inventoryItems.filter(
        (item) => item.hash === hashes[hash]
      )[0].quality.displayVersionWatermarkIcons[0]
    ] = Number(hash) + 1;
  }

  writeFile('./output/watermark-to-season.json', watermarkToSeason);
}
