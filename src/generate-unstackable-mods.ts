import { getAllDefs, loadLocal } from '@d2api/manifest-node';
import { writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAllDefs('InventoryItem');

function findAllUnstackableMods() {
  const unstackableModHashes = new Set<number>();

  for (const { tooltipNotifications, hash, displayProperties } of inventoryItems) {
    if (
      tooltipNotifications &&
      (tooltipNotifications[0]?.displayString.includes('no benefit') ||
        displayProperties.description.includes('will not improve')) &&
      !displayProperties.name.includes('Deprecated Armor Mod')
    ) {
      unstackableModHashes.add(hash);
    }
  }

  return Array.from(unstackableModHashes);
}

const unstackModHashes = findAllUnstackableMods();

writeFile('./output/unstackable-mods.json', unstackModHashes);
