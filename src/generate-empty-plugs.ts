/**
 * Collect plug item hashes corresponding to a meaningful empty plug
 * so we can pick a correct empty plug where singleInitialItemHash is
 * insufficient.
 */
import { getAll, loadLocal } from '@d2api/manifest-node';
import { writeFile } from './helpers.js';

loadLocal();

const emptySocketRegex = /^(Default .*|.* Socket)$/;

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const emptyPlugs = inventoryItems
  .filter((i) => i.plug)
  .filter((i) => emptySocketRegex.test(i.displayProperties.name));

emptyPlugs.sort(
  (a, b) =>
    a.displayProperties.name.localeCompare(b.displayProperties.name) ||
    a.plug!.plugCategoryIdentifier.localeCompare(b.plug!.plugCategoryIdentifier)
);

const commentedEntries = emptyPlugs.map((i) => {
  const comment = `${i.displayProperties.name} (${
    i.itemTypeDisplayName ? `${i.itemTypeDisplayName}, ` : ''
  }${i.plug!.plugCategoryIdentifier})`;
  return `${i.hash}, // ${comment}`;
});

const output = `export const emptyPlugHashes: Set<number> = new Set([\n${commentedEntries
  .map((entry) => `    ${entry}\n`)
  .join('')}]);`;

writeFile('./output/empty-plug-hashes.ts', output);
