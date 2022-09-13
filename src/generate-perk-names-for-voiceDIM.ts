import { getAll, loadLocal } from '@d2api/manifest-node';
import { PlugCategoryHashes } from '../data/generated-enums.js';
import { uniqAndSortArray, writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const plugs = [
  PlugCategoryHashes.Barrels,
  PlugCategoryHashes.Batteries,
  PlugCategoryHashes.Frames,
  PlugCategoryHashes.Guards,
  PlugCategoryHashes.Magazines,
  PlugCategoryHashes.MagazinesGl,
  PlugCategoryHashes.Stocks,
  PlugCategoryHashes.Tubes,
  PlugCategoryHashes.Grips,
  PlugCategoryHashes.Scopes,
  PlugCategoryHashes.Origins,
  PlugCategoryHashes.Intrinsics,
];

const allWeaponsPerkNames = inventoryItems
  .filter(
    (i) =>
      i.itemType === 19 && plugs.includes(i.plug?.plugCategoryHash ?? 0) && i.displayProperties.name
  )
  .map((i) => i.displayProperties.name);

writeFile('./output/voice-dim-valid-perks.json', uniqAndSortArray(allWeaponsPerkNames));
