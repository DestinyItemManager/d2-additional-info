import { getAllDefs, getInventoryItemDef } from '@d2api/manifest-node';
import { writeFile } from './helpers.js';

// this finds additional items that deserve their own place in the "list of items" that DIM collections represents.
// for instance, there's 2 very unique versions of each last wish weapon, but only one collections entry

const output: NodeJS.Dict<number> = {};

// crafting output items are *extremely* valid as items,
// no other heuristics should be needed to identify them from among dummies/dupes
const craftableInventoryItemHashes = getAllDefs('InventoryItem')
  .map((i) => getInventoryItemDef(i.crafting?.outputItemHash)!)
  .filter(Boolean);
const allCollectibles = getAllDefs('Collectible');

for (const item of craftableInventoryItemHashes) {
  if (allCollectibles.find((c) => c.itemHash === item.hash)) continue;
  const targetCollectible = allCollectibles.find(
    (c) => c.displayProperties.name === item.displayProperties.name,
  );
  if (targetCollectible) output[targetCollectible.hash] = item.hash;
}

writeFile('./output/unreferenced-collections-items.json', output);
