import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { writeFile } from './helpers.js';

const plugSets = getAll('DestinyPlugSetDefinition');
// 5 slots x 3 classes
const expectedNumber = 15;

loadLocal();

const ornamentPlugSetHashes: number[] = [];
// Universal ornament PlugSets have quite a few items in them
for (const plugSet of plugSets.filter((s) => s.reusablePlugItems?.length > 100)) {
  const item = get('DestinyInventoryItemDefinition', plugSet.reusablePlugItems[0].plugItemHash);
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
