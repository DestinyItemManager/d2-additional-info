import { getAllDefs, loadLocal } from '@d2api/manifest-node';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';
loadLocal();

const inventoryItems = getAllDefs('InventoryItem');

const mods: number[] = [];

const patterns = [/Dual Siphon/, /Siphon Combo/];

for (const item of inventoryItems) {
  if (
    item.displayProperties?.name &&
    item.plug &&
    item.plug.energyCost &&
    item.itemCategoryHashes?.includes(ItemCategoryHashes.ArmorMods) &&
    patterns.some((pat) => item.displayProperties.name.match(pat))
  ) {
    mods.push(item.hash);
  }
}

writeFile('./output/seasonal-armor-mods.json', mods);
