import { getAllDefs, getInventoryItemDef, loadLocal } from '@d2api/manifest-node';
import { writeFile } from './helpers.js';

const output: NodeJS.Dict<number> = {};

loadLocal();

const craftableInventoryItemHashes = getAllDefs('InventoryItem')
  .map((i) => getInventoryItemDef(i.crafting?.outputItemHash)!)
  .filter(Boolean);
const allCollectibles = getAllDefs('Collectible');

for (const item of craftableInventoryItemHashes) {
  if (allCollectibles.find((c) => c.itemHash === item.hash)) continue;
  const targetCollectible = allCollectibles.find(
    (c) => c.displayProperties.name === item.displayProperties.name
  );
  if (targetCollectible) output[targetCollectible.hash] = item.hash;
}

writeFile('./output/unreferenced-collections-items.json', output);
