import { getAllDefs, loadLocal } from '@d2api/manifest-node';
import { writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAllDefs('InventoryItem');

function findAllDeprecatedMods() {
  const deprecatedModHashes = new Set<number>();

  for (const { displayProperties, hash } of inventoryItems) {
    if (displayProperties?.name.includes('Deprecated Armor Mod')) {
      deprecatedModHashes.add(hash);
    }
  }

  return Array.from(deprecatedModHashes);
}

const depModHashes = findAllDeprecatedMods();

writeFile('./output/deprecated-mods.json', depModHashes);
