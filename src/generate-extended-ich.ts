import { getAllDefs } from '@d2api/manifest-node';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

const inventoryItems = getAllDefs('InventoryItem');

const festivalMasks = inventoryItems.filter((item) =>
  item.itemTypeDisplayName?.includes('Festival Mask'),
);

const extendedICH: Record<number, number> = {};

festivalMasks.forEach((fm) => {
  extendedICH[fm.hash] = ItemCategoryHashes.Mask;
});

writeFile('./output/extended-ich.json', extendedICH);
