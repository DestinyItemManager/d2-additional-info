import { getAll, loadLocal } from '@d2api/manifest-node';
import { D2CalculatedSeason, D2SeasonInfo } from '../data/seasons/d2-season-info.js';
import seasons from '../data/seasons/seasons_unfiltered.json' assert { type: 'json' };
import { copyFile, writeFile } from './helpers.js';

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

writeFile('./data/seasons/seasons_unfiltered.json', seasons);

const seasonTags = Object.values(D2SeasonInfo)
  .filter((seasonInfo) => seasonInfo.season > 0 && seasonInfo.seasonTag)
  .map((seasonInfo) => [seasonInfo.seasonTag, seasonInfo.season] as const)
  .reduce((acc: Record<string, number>, [tag, num]) => ((acc[tag] = num), acc), {});

writeFile('./output/season-tags.json', seasonTags);

const lightCapToSeason = Object.values(D2SeasonInfo)
  .filter((seasonInfo) => {
    const isRealSeason = seasonInfo.season > 0 && seasonInfo.season <= D2CalculatedSeason;
    // remove already used max light levels from powerCaps
    if (isRealSeason) {
      powerCaps.delete(seasonInfo.pinnacleCap);
    }
    return isRealSeason;
  })
  .reduce(
    (acc: Record<string, number>, seasonInfo) =>
      Object.assign(acc, { [seasonInfo.pinnacleCap]: seasonInfo.season }),
    {}
  );
// what's left in powerCaps is max light levels that don't apply to any season yet
// we left off at D2CalculatedSeason so we'll start adding dummy seasons at D2CalculatedSeason+1
[...powerCaps].forEach((p, i) => (lightCapToSeason[p] = D2CalculatedSeason + 1 + i));
writeFile('./output/lightcap-to-season.json', lightCapToSeason);
copyFile('./data/seasons/d2-season-info.ts', './output/d2-season-info.ts');
