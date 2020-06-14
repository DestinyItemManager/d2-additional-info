import { getAll, loadLocal } from 'destiny2-manifest/node';
import { writeFile, copyFile, imagesSame, downloadFile } from './helpers';

import { D2CalculatedSeason } from '../data/seasons/d2-season-info';

loadLocal();

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

const watermarkDIR = `./data/seasons/watermarks/`;
const watermarkTestDIR = `${watermarkDIR}test/`;

(async () => {
  // Download all season watermarks from Bungie
  for await (const uri of watermarks) {
    await downloadFile(
      `https://www.bungie.net${uri}`,
      `${watermarkTestDIR}${uri.substring(uri.lastIndexOf('/') + 1)}`
    );
  }

  // compare season watermarks from Bungie to previously downloaded images from Bungie
  let newSeason = null;
  for (let season = 1; season <= D2CalculatedSeason; season++) {
    let match = false;
    for await (const uri of watermarks) {
      const filenameFromBungie = uri.substring(uri.lastIndexOf('/') + 1);
      const BungieFile = `${watermarkTestDIR}${filenameFromBungie}`;
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
    const difference = watermarks.filter((x) => !existingWatermarks.includes(x));
    const uri = String(difference[0]);
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    watermarkToSeason[uri] = newSeason;
    copyFile(`${watermarkTestDIR}${filename}`, `${watermarkDIR}${newSeason}.png`);
  }

  writeFile('./output/watermark-to-season.json', watermarkToSeason);
})().catch((e) => {
  console.log(e);
  process.exit(1);
});
