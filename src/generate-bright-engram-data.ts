import { get, getAll, loadLocal } from 'destiny2-manifest/node';

import seasons from '../data/seasons/seasons_master.json';
import { writeFile } from './helpers';

loadLocal();
const inventoryItems = getAll('DestinyInventoryItemDefinition');

const brightEngramExclusions = [
  'Crimson',
  'the Revelry',
  'Dawning',
  'Festival of the Lost',
  'Solstice'
];
const brightEngrams: Record<string, number> = {};
const engramCategoryHash = 34;
const hasTerm = (string: string, terms: string[]) => terms.some((term) => string.includes(term));

inventoryItems.forEach((inventoryItem) => {
  const { hash, itemTypeDisplayName } = inventoryItem;
  const { description, name } = inventoryItem.displayProperties;
  const categoryHashes = inventoryItem.itemCategoryHashes || [];
  if (
    // if it's an engram
    categoryHashes.includes(engramCategoryHash) &&
    // and specifically a "Bright Engram"
    itemTypeDisplayName.includes('Bright Engram') &&
    // and the name & description don't include holiday terms
    !hasTerm(description, brightEngramExclusions) &&
    !hasTerm(name, brightEngramExclusions) &&
    // and there's a corresponding vendor table for this hash
    get('DestinyVendorDefinition', hash)
  ) {
    // get this specific item's season
    const season = seasons[(hash as unknown) as keyof typeof seasons];
    // we found this season's Bright Engram
    brightEngrams[season] = hash;
  }
});

writeFile('./output/bright-engrams.json', brightEngrams);
