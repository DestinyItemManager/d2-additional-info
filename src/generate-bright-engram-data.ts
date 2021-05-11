import { get, getAll, loadLocal } from '@d2api/manifest/node';
import { ItemCategoryHashes } from '../data/generated-enums';
import { D2CalculatedSeason } from '../data/seasons/d2-season-info';
import seasons from '../data/seasons/seasons_unfiltered.json';
import { writeFile } from './helpers';

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

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
    get('DestinyVendorDefinition', hash)
  ) {
    // get this specific item's season
    const season = seasons[(hash as unknown) as keyof typeof seasons];
    // we found this season's Bright Engram
    brightEngrams[season] = hash;
  }
});

// hacky fix to get bright engrams working at season launch
// TODO: Fix this

if (brightEngrams[D2CalculatedSeason - 1] === undefined) {
  brightEngrams[D2CalculatedSeason - 1] = brightEngrams[D2CalculatedSeason - 2];
}

if (brightEngrams[D2CalculatedSeason] === undefined) {
  brightEngrams[D2CalculatedSeason] = brightEngrams[D2CalculatedSeason - 1];
}

writeFile('./output/bright-engrams.json', brightEngrams);
