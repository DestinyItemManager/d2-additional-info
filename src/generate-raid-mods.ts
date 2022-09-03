/**
 * Collect all the raid mod plug category hashes.
 */
import { getAll, loadLocal } from '@d2api/manifest-node';
import { uniqAndSortArray, writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');
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
