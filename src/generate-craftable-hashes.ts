import { getAllDefs, loadLocal } from '@d2api/manifest-node';
import { uniqAndSortArray, writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAllDefs('InventoryItem');

const craftableHashes = inventoryItems
  .filter((i) => i.crafting)
  .map((i) => i.crafting.outputItemHash);

writeFile('./output/craftable-hashes.json', uniqAndSortArray(craftableHashes));
