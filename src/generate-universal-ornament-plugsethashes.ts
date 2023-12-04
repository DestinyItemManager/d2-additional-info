import { getAllDefs, getDef } from '@d2api/manifest-node';
import { writeFile } from './helpers.js';

const plugSets = getAllDefs('PlugSet');
// 5 slots x 3 classes
const expectedNumber = 15;

const ornamentPlugSetHashes: number[] = [];
// Universal ornament PlugSets have quite a few items in them
for (const plugSet of plugSets.filter((s) => s.reusablePlugItems?.length > 100)) {
  const item = getDef('InventoryItem', plugSet.reusablePlugItems[0].plugItemHash);
  if (item?.plug?.plugCategoryIdentifier.startsWith('armor_skins')) {
    ornamentPlugSetHashes.push(plugSet.hash);
  }
}

if (ornamentPlugSetHashes.length != expectedNumber) {
  console.log(
    `We have ${ornamentPlugSetHashes.length} universalOrnament plugSetHashes when we only expected ${expectedNumber}`
  );
}

writeFile('./output/universal-ornament-plugset-hashes.json', ornamentPlugSetHashes);
