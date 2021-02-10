import { getAll, loadLocal } from '@d2api/manifest/node';
import { writeFile } from './helpers';

loadLocal();

const debug = false;

if (debug) {
  const watermarks = [
    ...new Set(
      getAll('DestinyInventoryItemDefinition')
        .map(
          (o) =>
            o.quality?.displayVersionWatermarkIcons || o.iconWatermark || o.iconWatermarkShelved
        )
        .flat()
        .filter(Boolean)
    ),
  ];

  console.log(watermarks, watermarks.length);
}

const watermarkHashesSeasons: Record<number, number> = {
  423789: 1, // Mythos Hack (non-sunset Season 1)
  4425887: 1, // The Time-Worn Spire (Sunset Season 1)
  87646118: 2, // Endless Glory
  235397500: 3, // The Mad Monk
  89332041: 4, // Cayde's Duds
  231533811: 5, // Iron Strength
  915277992: 6, // Warbrick
  1363705632: 7, // First Light
  1359616732: 8, // Gambit Emerald (Undying)
  2056256564: 8, // Lunar Halcyon Gilt (Shadowkeep)
  980059630: 9, // Vitrified Chronology
  737170669: 10, // Valkyrie Zero
  51755992: 11, // Throne of Soot
  1371145728: 12, // Amethyst Bloom (Hunt)
  1948818058: 12, // Gilded Smoke (Beyond Light)
  117960780: 13, // Peat Bog Boogie (Chosen)
};

const watermarkHashesEvents: Record<number, number> = {
  269339124: 1, // Dawning Hope (Dawning)
  1052553863: 2, // Crimson Passion (Crimson Days)
  3859483819: 3, // Malachite Gold (Solstice of Heroes)
  2233576420: 4, // Fright Night (Festival of the Lost)
  1914989540: 5, // Verdant Crown (Revelry)
  2171727442: 6, // Rivalry Blacksand (Guardian Games)
};

const watermarkToSeason = {} as Record<string, number>;
const watermarkToEvent = {} as Record<string, number>;

const inventoryItems = getAll('DestinyInventoryItemDefinition');

Object.keys(watermarkHashesSeasons).forEach(function (hash) {
  const item = inventoryItems.filter((item) => item.hash === Number(hash))[0];
  if (item.quality) {
    const uri = item.quality.displayVersionWatermarkIcons[0];
    watermarkToSeason[uri] = watermarkHashesSeasons[Number(hash)];
  }
  if (item.iconWatermark) {
    watermarkToSeason[item.iconWatermark] = watermarkHashesSeasons[Number(hash)];
    watermarkToSeason[item.iconWatermarkShelved] = watermarkHashesSeasons[Number(hash)];
  }
});

Object.keys(watermarkHashesEvents).forEach(function (hash) {
  const item = inventoryItems.filter((item) => item.hash === Number(hash))[0];
  if (item.iconWatermark) {
    watermarkToEvent[item.iconWatermark] = watermarkHashesEvents[Number(hash)];
  }
});

writeFile('./output/watermark-to-season.json', watermarkToSeason);
writeFile('./output/watermark-to-event.json', watermarkToEvent);
