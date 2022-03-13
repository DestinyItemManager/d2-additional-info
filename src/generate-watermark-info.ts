import { getAll, loadLocal } from '@d2api/manifest-node';
import { exit } from 'process';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import allWatermarks from '../data/seasons/all-watermarks.json' assert { type: 'json' };
import seasons from '../data/seasons/seasons_unfiltered.json' assert { type: 'json' };
import watermarkToSeason from '../output/watermark-to-season.json' assert { type: 'json' };
import { diffArrays, uniqAndSortArray, writeFile } from './helpers.js';
loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const IGNORED_WATERMARKS = ['/common/destiny2_content/icons/64e07aa12c7c9956ee607ccb5b3c6718.png'];

const itemsNoMods = inventoryItems.filter(
  (item) => !item.itemCategoryHashes?.includes(ItemCategoryHashes.Mods_Mod)
);

const watermarks = uniqAndSortArray([
  ...new Set(
    itemsNoMods
      .map((item) => item.quality?.displayVersionWatermarkIcons.concat(item.iconWatermark))
      .flat()
      .filter(Boolean)
      .concat(
        itemsNoMods
          .map((item) => item.iconWatermarkShelved)
          .flat()
          .filter(Boolean)
      )
  ),
]);

const newWatermarks = diffArrays(watermarks, allWatermarks);

if (newWatermarks.length > 0) {
  for (const newWatermark of newWatermarks) {
    const item = inventoryItems.filter(
      (item) => item.iconWatermark === newWatermark || item.iconWatermarkShelved === newWatermark
    )[0];
    if (item.iconWatermark && !IGNORED_WATERMARKS.includes(item.iconWatermark)) {
      (watermarkToSeason as Record<string, number>)[item.iconWatermark] = (
        seasons as Record<string, number>
      )[item.hash];
    }
    if (item.iconWatermark && !IGNORED_WATERMARKS.includes(item.iconWatermarkShelved)) {
      (watermarkToSeason as Record<string, number>)[item.iconWatermarkShelved] = (
        seasons as Record<string, number>
      )[item.hash];
    }
  }
  writeFile('./data/seasons/all-watermarks.json', watermarks);
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
  if (item.iconWatermark && !IGNORED_WATERMARKS.includes(item.iconWatermark)) {
    watermarkToEvent[item.iconWatermark] = watermarkHashesEvents[Number(hash)];
  }
  if (item.iconWatermarkShelved && !IGNORED_WATERMARKS.includes(item.iconWatermarkShelved)) {
    watermarkToEvent[item.iconWatermarkShelved] = watermarkHashesEvents[Number(hash)];
  }
});

writeFile('./output/watermark-to-season.json', watermarkToSeason);
writeFile('./output/watermark-to-event.json', watermarkToEvent);

const unassignedWatermarks = diffArrays(
  diffArrays(
    diffArrays(allWatermarks, Object.keys(watermarkToEvent)),
    Object.keys(watermarkToSeason)
  ),
  IGNORED_WATERMARKS
);

if (unassignedWatermarks.length > 0) {
  console.log('Unassigned Watermarks');
  console.table(unassignedWatermarks);
  exit(1);
}
