/**
 * Collect all the raid mod plug category hashes.
 */
import { getAllDefs } from '@d2api/manifest-node';
import { uniqAndSortArray, writeFile } from './helpers.js';

const inventoryItems = getAllDefs('InventoryItem');
const lastWishRaidModPlugCategoryIdentifier = 'enhancements.season_outlaw';
const raidModPlugCategoryIdentifier = 'enhancements.raid_';

function findAllRaidPlugCategoryHashes() {
  const raidModPlugCategoryHashes = new Set<number>();

  for (const { plug } of inventoryItems) {
    if (
      plug &&
      (plug.plugCategoryIdentifier.startsWith(raidModPlugCategoryIdentifier) ||
        plug.plugCategoryIdentifier === lastWishRaidModPlugCategoryIdentifier)
    ) {
      raidModPlugCategoryHashes.add(plug.plugCategoryHash);
    }
  }

  return Array.from(raidModPlugCategoryHashes);
}

const raidModPlugCategoryHashes = uniqAndSortArray(findAllRaidPlugCategoryHashes());

writeFile('./output/raid-mod-plug-category-hashes.json', raidModPlugCategoryHashes);
