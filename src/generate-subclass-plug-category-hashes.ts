/**
 * Collect all the subclass plug plugCategoryHashes. These are
 * abilities, aspects, and fragments found on subclasses with
 * pluggable sockets.
 */
import { getAllDefs, getDef, loadLocal } from '@d2api/manifest-node';
import { uniqAndSortArray, writeFile } from './helpers.js';

loadLocal();

const getItem = (hash: number) => getDef('InventoryItem', hash);
const getPlugSet = (hash: number) => getDef('PlugSet', hash);

const allItems = getAllDefs('InventoryItem');

const classBucketHash = 3284755031;

// Socket category hashes
const abilitiesSocketCategoryHash = 309722977;
const aspectsSocketCategoryHash = 2140934067;
const fragmentsSocketCategoryHash = 1313488945;
// Not currently used but if we get super choices this will be needed
const superSocketCategoryHash = 457473665;

const wantedCategoryHashes = [
  abilitiesSocketCategoryHash,
  aspectsSocketCategoryHash,
  fragmentsSocketCategoryHash,
  superSocketCategoryHash,
];

function findAllSubclassPlugs() {
  const plugTracker: Record<string, number> = {};

  for (const item of allItems) {
    if (item.inventory?.bucketTypeHash === classBucketHash && item.sockets) {
      const indexes: number[] = [];

      // get all the socket indexes that have the right category hash
      for (const socketCategory of item.sockets.socketCategories) {
        if (wantedCategoryHashes.includes(socketCategory.socketCategoryHash)) {
          for (const index of socketCategory.socketIndexes) {
            indexes.push(index);
          }
        }
      }

      for (const socketIndex of indexes) {
        const socket = item.sockets.socketEntries[socketIndex];
        const plugSet = socket.reusablePlugSetHash
          ? getPlugSet(socket.reusablePlugSetHash)
          : undefined;
        const plugItems =
          plugSet?.reusablePlugItems.map(({ plugItemHash }) => getItem(plugItemHash)) || [];
        for (const plugItem of plugItems) {
          const plugCategoryHash = plugItem?.plug?.plugCategoryHash;
          if (plugCategoryHash) {
            plugTracker[plugItem.displayProperties.name] = plugCategoryHash;
          }
        }
      }
    }
  }

  // Log this to make debugging easier
  console.group();
  console.log('Subclass plugs found');
  console.table(plugTracker);
  console.groupEnd();

  return Array.from(new Set(Object.values(plugTracker)));
}

const subclassPlugs = uniqAndSortArray(findAllSubclassPlugs());

writeFile('./output/subclass-plug-category-hashes.json', subclassPlugs);
