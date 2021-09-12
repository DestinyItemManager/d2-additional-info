import { get, getAll, loadLocal } from '@d2api/manifest/node';
import { ItemCategoryHashes } from '../data/generated-enums';
import { writeFile } from './helpers';

loadLocal();

const results: NodeJS.Dict<number> = {};
for (const i of getAll('DestinyInventoryItemDefinition')) {
  if (
    // if it's filled in we're done
    !results[i.inventory!.tierTypeName] &&
    // find engrams
    i.itemCategoryHashes?.includes(ItemCategoryHashes.Engrams) &&
    // whose name starts with a rarity name string
    i.displayProperties.name.startsWith(i.inventory!.tierTypeName) &&
    // engrams that correspond to a vendor, for max hash stability
    get('DestinyVendorDefinition', i.hash)
  ) {
    results[i.inventory!.tierTypeName] = i.hash;
  }
}

writeFile('./output/engram-examples.json', results);
