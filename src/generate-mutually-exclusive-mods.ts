import { getAllDefs, loadLocal } from '@d2api/manifest-node';
import { PlugCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';
loadLocal();

const failureMessage = 'Similar mod already applied';

const inventoryItems = getAllDefs('InventoryItem');

const exclusiveMods: {
  [modHash: number]: string;
} = {};

for (const item of inventoryItems) {
  if (
    item.displayProperties?.name &&
    item.plug?.plugCategoryHash &&
    !item.displayProperties.name.includes('Deprecated') &&
    item.plug.insertionRules?.some((rule) => rule.failureMessage.includes(failureMessage))
  ) {
    if (
      item.plug.plugCategoryHash === PlugCategoryHashes.EnhancementsV2ClassItem &&
      item.displayProperties.name.includes('Finish')
    ) {
      exclusiveMods[item.hash] = 'finisher';
    } else if (
      item.plug.plugCategoryHash === PlugCategoryHashes.EnhancementsV2Arms &&
      item.displayProperties.name.includes('Fastball')
    ) {
      exclusiveMods[item.hash] = 'fastball';
    } else {
      exclusiveMods[item.hash] = 'unknown-' + item.plug.plugCategoryIdentifier;
    }
  }
}

writeFile('./output/mutually-exclusive-mods.json', exclusiveMods);
