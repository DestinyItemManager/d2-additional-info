import { getAll, loadLocal } from '@d2api/manifest/node';
import allWatermarks from '../data/seasons/all-watermarks.json';
import seasons from '../data/seasons/seasons_unfiltered.json';
import watermarkToSeason from '../data/seasons/watermark-to-season.json';
import { diffArrays, writeFile } from './helpers';
loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const watermarks = [
  ...new Set(
    getAll('DestinyInventoryItemDefinition')
      .map((o) => o.quality?.displayVersionWatermarkIcons || o.iconWatermark)
      .flat()
      .filter(Boolean)
  ),
];

const watermarksShelved = [
  ...new Set(
    getAll('DestinyInventoryItemDefinition')
      .map((o) => o.quality?.displayVersionWatermarkIcons || o.iconWatermarkShelved)
      .flat()
      .filter(Boolean)
  ),
];

const watermarksAndShelved = watermarks.concat(watermarksShelved);
const newWatermarks = diffArrays(watermarksAndShelved, allWatermarks);

if (newWatermarks.length > 0) {
  // if more than 2 watermarks remain, find new shaders with same watermarks and verify season.
  // this doesn't actually just look at just shaders yet... probably not necessary
  for (const newWatermark of newWatermarks) {
    const item = inventoryItems.filter(
      (item) => item.iconWatermark === newWatermark || item.iconWatermarkShelved === newWatermark
    )[0];
    if (item.iconWatermark) {
      (watermarkToSeason as Record<string, number>)[item.iconWatermark] = (seasons as Record<
        string,
        number
      >)[item.hash];
    }
    if (item.iconWatermarkShelved) {
      (watermarkToSeason as Record<string, number>)[item.iconWatermarkShelved] = (seasons as Record<
        string,
        number
      >)[item.hash];
    }
  }
  writeFile('./data/seasons/all-watermarks.json', watermarksAndShelved);
}

const watermarkHashesEvents: Record<number, number> = {
  269339124: 1, // Dawning Hope (Dawning)
  1052553863: 2, // Crimson Passion (Crimson Days)
  3859483819: 3, // Malachite Gold (Solstice of Heroes)
  2233576420: 4, // Fright Night (Festival of the Lost)
  1914989540: 5, // Verdant Crown (Revelry)
  2171727442: 6, // Rivalry Blacksand (Guardian Games)
};

const watermarkToEvent = {} as Record<string, number>;

Object.keys(watermarkHashesEvents).forEach(function (hash) {
  const item = inventoryItems.filter((item) => item.hash === Number(hash))[0];
  if (item.iconWatermark) {
    watermarkToEvent[item.iconWatermark] = watermarkHashesEvents[Number(hash)];
  }
});

writeFile('./data/seasons/watermark-to-season.json', watermarkToSeason);
writeFile('./output/watermark-to-season.json', watermarkToSeason);
writeFile('./output/watermark-to-event.json', watermarkToEvent);
