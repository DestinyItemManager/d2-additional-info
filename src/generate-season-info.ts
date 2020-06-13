import { getAll, loadLocal } from 'destiny2-manifest/node';
import { writeFile, copyFile } from './helpers';

import seasons from '../data/seasons/seasons_master.json';
import { D2SeasonInfo, D2CalculatedSeason } from '../data/seasons/d2-season-info';

loadLocal();
const inventoryItems = getAll('DestinyInventoryItemDefinition');
const powerCaps = new Set(
  getAll('DestinyPowerCapDefinition')
    .map((p) => p.powerCap)
    .filter((p) => p > 1000 && p < 50000)
    .sort((a, b) => a - b)
);

inventoryItems.forEach((inventoryItem) => {
  const { hash } = inventoryItem;

  // Only add items not currently in db
  if (!(seasons as Record<string, number>)[hash]) {
    (seasons as Record<string, number>)[hash] = D2CalculatedSeason;
  }
});

writeFile('./data/seasons/seasons_master.json', seasons);

const seasonTags = Object.values(D2SeasonInfo)
  .filter((seasonInfo) => seasonInfo.season > 0 && seasonInfo.season <= D2CalculatedSeason)
  .map((seasonInfo) => [seasonInfo.seasonTag, seasonInfo.season] as const)
  .reduce((acc: Record<string, number>, [tag, num]) => ((acc[tag] = num), acc), {});

writeFile('./output/season-tags.json', seasonTags);

const lightCapToSeason = Object.values(D2SeasonInfo)
  .filter((seasonInfo) => {
    const isRealSeason = seasonInfo.season > 0 && seasonInfo.season <= D2CalculatedSeason;
    // remove already used max light levels from powerCaps
    if (isRealSeason) powerCaps.delete(seasonInfo.maxPower);
    return isRealSeason;
  })
  .reduce(
    (acc: Record<string, number>, seasonInfo) =>
      Object.assign(acc, { [seasonInfo.maxPower]: seasonInfo.season }),
    {}
  );
// what's left in powerCaps is max light levels that don't apply to any season yet
// we left off at D2CalculatedSeason so we'll start adding dummy seasons at D2CalculatedSeason+1
[...powerCaps].forEach((p, i) => (lightCapToSeason[p] = D2CalculatedSeason + 1 + i));
writeFile('./output/lightcap-to-season.json', lightCapToSeason);

const seasonToIconOverlay = {
  1: inventoryItems.filter((item) => item.hash === 193869522)[0].quality // Lucky Pants
    .displayVersionWatermarkIcons[0],
  2: inventoryItems.filter((item) => item.hash === 4203034886)[0].quality // Zephyr
    .displayVersionWatermarkIcons[0],
  3: inventoryItems.filter((item) => item.hash === 222565136)[0].quality // Solstice Vest (Resplendent)
    .displayVersionWatermarkIcons[0],
  4: inventoryItems.filter((item) => item.hash === 3829285960)[0].quality // Horror Story
    .displayVersionWatermarkIcons[0],
  5: inventoryItems.filter((item) => item.hash === 66875353)[0].quality // Avalanche
    .displayVersionWatermarkIcons[0],
  6: inventoryItems.filter((item) => item.hash === 156518114)[0].quality // Inaugural Revelry Greaves
    .displayVersionWatermarkIcons[0],
  7: inventoryItems.filter((item) => item.hash === 3084686800)[0].quality // Solstice Vest (Resplendent)
    .displayVersionWatermarkIcons[0],
  8: inventoryItems.filter((item) => item.hash === 528834068)[0].quality // BrayTech Werewolf
    .displayVersionWatermarkIcons[0],
  9: inventoryItems.filter((item) => item.hash === 489480785)[0].quality // High-Minded Complex
    .displayVersionWatermarkIcons[0],
  10: inventoryItems.filter((item) => item.hash === 79417130)[0].quality // Simulator Grips
    .displayVersionWatermarkIcons[0],
  11: inventoryItems.filter((item) => item.hash === 539497618)[0].quality // Wildwood Strides
    .displayVersionWatermarkIcons[0],
};

writeFile('./output/season-to-iconoverlay.json', seasonToIconOverlay);

copyFile('./data/seasons/d2-season-info.ts', './output/d2-season-info.ts');
