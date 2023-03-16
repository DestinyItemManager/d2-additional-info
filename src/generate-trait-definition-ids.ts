import { getAllDefs, loadLocal } from '@d2api/manifest-node';
import { writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAllDefs('InventoryItem');

const traitIdMap: Record<number, string> = {};

for (const item of inventoryItems) {
  if (!item.traitIds || !item.traitIds) {
    continue;
  }

  if (item.traitIds.length !== item.traitHashes.length) {
    continue;
  }

  for (let index = 0; index < item.traitHashes.length; index++) {
    const traitHash = item.traitHashes[index];
    const traitId = item.traitIds[index];

    // To be extra super duper safe we could verify that traitHash is the
    // correct fnv-1 32 of the traitId before adding it
    traitIdMap[traitHash] = traitId;
  }
}

writeFile('./output/trait-definition-ids.json', traitIdMap);
