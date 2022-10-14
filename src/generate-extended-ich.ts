import { getAll, loadLocal } from '@d2api/manifest-node';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const ffGrenadeLaunchers = inventoryItems.filter(
  (item) =>
    item.itemCategoryHashes?.includes(ItemCategoryHashes.GrenadeLaunchers) &&
    !item.itemCategoryHashes.includes(ItemCategoryHashes.PowerWeapon) &&
    !item.itemCategoryHashes.includes(ItemCategoryHashes.Dummies)
);

const slugShotguns = inventoryItems.filter(
  (item) =>
    item.itemCategoryHashes?.includes(ItemCategoryHashes.Shotgun) &&
    !item.itemCategoryHashes.includes(ItemCategoryHashes.Dummies) &&
    item.sockets?.socketEntries[0].singleInitialItemHash === 918679156 // Slug Precision Frame
);

const festivalMasks = inventoryItems.filter((item) =>
  item.itemTypeDisplayName?.includes('Festival Mask')
);

const extendedICH: Record<number, number> = {};

ffGrenadeLaunchers.forEach((gl) => {
  extendedICH[gl.hash] = -ItemCategoryHashes.GrenadeLaunchers;
});

slugShotguns.forEach((ssg) => {
  extendedICH[ssg.hash] = -ItemCategoryHashes.Shotgun;
});

festivalMasks.forEach((fm) => {
  extendedICH[fm.hash] = ItemCategoryHashes.Mask;
});

writeFile('./output/extended-ich.json', extendedICH);
