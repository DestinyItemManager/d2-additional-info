import { getAll, loadLocal } from 'destiny2-manifest/node';
import { getCurrentSeason, writeFile } from './helpers';

import seasons from '../data/seasons/seasons_master.json';
import seasonsInfo from '../data/seasons/d2-season-info';

loadLocal();
const inventoryItems = getAll('DestinyInventoryItemDefinition');

const calculatedSeason = getCurrentSeason();

inventoryItems.forEach((inventoryItem) => {
  const { hash } = inventoryItem;

  // Only add items not currently in db
  if (!(seasons as Record<string, number>)[hash]) {
    (seasons as Record<string, number>)[hash] = calculatedSeason;
  }
});

writeFile('./data/seasons/seasons_master.json', seasons);

const seasonTags = Object.values(seasonsInfo)
  .filter((seasonInfo) => seasonInfo.season <= calculatedSeason)
  .map((seasonInfo) => [seasonInfo.seasonTag, seasonInfo.season] as const)
  .reduce((acc: Record<string, number>, [tag, num]) => ((acc[tag] = num), acc), {});

writeFile('./output/season-tags.json', seasonTags);
