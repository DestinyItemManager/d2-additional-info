import { getAllDefs, getDef, loadLocal } from '@d2api/manifest-node';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

loadLocal();

const results: NodeJS.Dict<string> = {};
for (const i of getAllDefs('InventoryItem')) {
  if (
    // if it's filled in we're done
    !results[i.inventory!.tierTypeName] &&
    // find engrams
    i.itemCategoryHashes?.includes(ItemCategoryHashes.Engrams) &&
    // whose name starts with a rarity name string
    i.displayProperties.name.startsWith(i.inventory!.tierTypeName) &&
    // engrams that correspond to a vendor, for max hash stability
    getDef('Vendor', i.hash)
  ) {
    results[i.inventory!.tierTypeName] = i.displayProperties.icon;
  }
}

writeFile('./output/engram-rarity-icons.json', results);
