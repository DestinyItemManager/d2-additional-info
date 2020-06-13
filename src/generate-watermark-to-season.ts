import { getAll, loadLocal } from 'destiny2-manifest/node';
import { writeFile, copyFile } from './helpers';
import fetch from 'cross-fetch';
import Jimp from 'jimp';

import { writeFile as writeFileFS } from 'fs';
import fse from 'fs-extra';
import { promisify } from 'util';
import { D2CalculatedSeason } from '../data/seasons/d2-season-info';

const writeFilePromise = promisify(writeFileFS);

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

(async () => {
  watermarks.forEach((uri) => {
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    downloadFile(`https://www.bungie.net${uri}`, `./data/seasons/watermarks/test/${filename}`);
  });

  let newSeason;
  for (let seasonX = 1; seasonX <= D2CalculatedSeason; seasonX++) {
    let match = false;
    for (let season = 1; season <= D2CalculatedSeason; season++) {
      const testFileName = watermarks[season - 1].substring(
        watermarks[season - 1].lastIndexOf('/') + 1
      );
      const testFile = `./data/seasons/watermarks/test/${testFileName}`;
      const goodFile = `./data/seasons/watermarks/${seasonX}.png`;
      const same = fse.existsSync(goodFile) && (await imagesSame(testFile, goodFile));
      if (same) {
        existingWatermarks.push(watermarks[season - 1]);
        watermarkToSeason[watermarks[season - 1]] = seasonX;
        match = true;
        continue;
      }
    }
    if (!match) {
      // New Season overlay detected!
      newSeason = seasonX;
    }
  }

  if (newSeason) {
    const difference = watermarks.filter((x) => !existingWatermarks.includes(x));
    const uri = String(difference[0]);
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    watermarkToSeason[uri] = newSeason;
    copyFile(
      `./data/seasons/watermarks/test/${filename}`,
      `./data/seasons/watermarks/${newSeason}.png`
    );
  }

  writeFile('./output/watermark-to-season.json', watermarkToSeason);
})().catch((e) => {
  console.log(e);
  process.exit(1);
});

async function imagesSame(filename1: string, filename2: string) {
  const file1 = await Jimp.read(filename1);
  const file2 = await Jimp.read(filename2);
  return Jimp.diff(file1, file2).percent === 0 ? true : false;
}

function downloadFile(url: string, outputPath: string) {
  return fetch(url)
    .then((x) => x.arrayBuffer())
    .then((x) => writeFilePromise(outputPath, Buffer.from(x)));
}
