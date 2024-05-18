import { getAllDefs, getDef } from '@d2api/manifest-node';
import seasons from 'data/seasons/seasons_unfiltered.json' with { type: 'json' };
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { getCurrentSeason, writeFile } from './helpers.js';

const inventoryItems = getAllDefs('InventoryItem');

const brightEngramExclusions = [
  'Crimson',
  'the Revelry',
  'Dawning',
  'Festival of the Lost',
  'Solstice',
];
const brightEngrams: Record<string, number> = {};
const hasTerm = (string: string, terms: string[]) => terms.some((term) => string.includes(term));

inventoryItems.forEach((inventoryItem) => {
  const { hash, itemTypeDisplayName } = inventoryItem;
  const { description, name } = inventoryItem.displayProperties;
  const categoryHashes = inventoryItem.itemCategoryHashes || [];
  if (
    // if it's an engram
    categoryHashes.includes(ItemCategoryHashes.Engrams) &&
    // and specifically a "Bright Engram"
    itemTypeDisplayName.includes('Bright Engram') &&
    // and the name & description don't include holiday terms
    !hasTerm(description, brightEngramExclusions) &&
    !hasTerm(name, brightEngramExclusions) &&
    // and there's a corresponding vendor table for this hash
    getDef('Vendor', hash)
  ) {
    // get this specific item's season
    const season = seasons[hash as unknown as keyof typeof seasons];
    // we found this season's Bright Engram
    brightEngrams[season] = hash;
  }
});

const D2CalculatedSeason = getCurrentSeason();
for (let season = 1; season <= D2CalculatedSeason; season++) {
  if (brightEngrams[season] === undefined) {
    brightEngrams[season] = brightEngrams[season - 1];
  }
}

writeFile('./output/bright-engrams.json', brightEngrams);
