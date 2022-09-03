import { getAll, loadLocal } from '@d2api/manifest-node';
import { uniqAndSortArray, writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const craftableHashes = uniqAndSortArray(
  inventoryItems.filter((i) => i.crafting).map((i) => i.crafting.outputItemHash)
);

writeFile('./output/craftable-hashes.json', craftableHashes);
