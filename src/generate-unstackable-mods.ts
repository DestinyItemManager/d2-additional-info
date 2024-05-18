import { getAllDefs, getDef } from '@d2api/manifest-node';
import { writeFile } from './helpers.js';

const inventoryItems = getAllDefs('InventoryItem');

function findAllUnstackableMods() {
  const unstackableModHashes = new Set<number>();

  for (const { tooltipNotifications, hash, displayProperties, perks } of inventoryItems) {
    if (
      tooltipNotifications &&
      (tooltipNotifications[0]?.displayString.includes('no benefit') ||
        displayProperties.description.includes('will not improve') ||
        (perks[0]?.perkHash &&
          getDef('SandboxPerk', perks[0].perkHash)?.displayProperties.description.includes(
            'does not stack',
          ))) &&
      !displayProperties.name.includes('Deprecated Armor Mod')
    ) {
      unstackableModHashes.add(hash);
    }
  }

  return Array.from(unstackableModHashes);
}

const unstackModHashes = findAllUnstackableMods();

writeFile('./output/unstackable-mods.json', unstackModHashes);
