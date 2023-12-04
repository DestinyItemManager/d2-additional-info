import { getAllDefs, getDef } from '@d2api/manifest-node';
import { DestinyClass, DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2/interfaces.js';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

const THE_FORBIDDEN_BUCKET = 2422292810;

const focusingItemToOutputItem: { [focusingItemHash: number]: number } = {};

const possibleOutputItemsByName: { [name: string]: DestinyInventoryItemDefinition[] } = {};
for (const item of getAllDefs('InventoryItem')) {
  if (
    item.displayProperties?.name &&
    item.collectibleHash &&
    item.inventory?.bucketTypeHash !== THE_FORBIDDEN_BUCKET &&
    (item.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) ||
      item.itemCategoryHashes?.includes(ItemCategoryHashes.Armor))
  ) {
    (possibleOutputItemsByName[item.displayProperties.name] ??= []).push(item);
  }
}

for (const vendor of getAllDefs('Vendor')) {
  if (
    !vendor.itemList ||
    !(
      vendor.displayProperties?.name.includes('Decoding') ||
      vendor.displayProperties?.name.includes('Legacy Gear')
    )
  ) {
    continue;
  }
  let watermarkItemsMatched = 0;
  let fallbackitemsMatched = 0;
  let itemsNotMatched = 0;
  let exampleDef = undefined;
  for (const item of vendor.itemList) {
    if (!item) {
      continue;
    }
    const def = getDef('InventoryItem', item.itemHash);
    if (
      !def ||
      def.inventory?.bucketTypeHash !== THE_FORBIDDEN_BUCKET ||
      def.collectibleHash ||
      !def.displayProperties.name
    ) {
      continue;
    }
    exampleDef ||= def;
    const candidates = possibleOutputItemsByName[def.displayProperties.name].filter(
      (c) =>
        c.itemTypeDisplayName === def.itemTypeDisplayName &&
        (def.classType === DestinyClass.Unknown || c.classType === def.classType)
    );
    if (candidates?.length) {
      let best =
        candidates.length > 1
          ? candidates.findIndex((candidate) => candidate.iconWatermark === def.iconWatermark)
          : 0;
      if (best === -1) {
        best = 0;
        fallbackitemsMatched++;
      } else {
        watermarkItemsMatched++;
      }
      focusingItemToOutputItem[item.itemHash] = candidates[best].hash;
    } else {
      itemsNotMatched++;
    }
  }

  if (watermarkItemsMatched > 0 || fallbackitemsMatched > 0 || itemsNotMatched > 0) {
    console.log(
      `focusing item outputs: vendor ${vendor.displayProperties.name} (${vendor.hash}) - ${watermarkItemsMatched} exact matches, ${fallbackitemsMatched} fallbacks, ${itemsNotMatched} failures - example item ${exampleDef?.displayProperties?.name}`
    );
  }
}

writeFile('./output/focusing-item-outputs.json', focusingItemToOutputItem);
