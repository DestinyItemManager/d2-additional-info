/**
 * Collect all the subclass super plug plugCategoryHashes.
 */
import { getAllDefs, getDef } from '@d2api/manifest-node';
import { uniqAndSortArray, writeFile } from './helpers.js';
import { infoLog, infoTable } from './log.js';

const TAG = 'SUBCLASS-PLUG';
const DEBUG = true;

const getItem = (hash: number) => getDef('InventoryItem', hash);
const getPlugSet = (hash: number) => getDef('PlugSet', hash);

const allItems = getAllDefs('InventoryItem');

const classBucketHash = 3284755031;

const superSocketCategoryHash = 457473665;

function findAllSubclassSuperPlugs() {
  const plugTracker: Record<string, number> = {};

  for (const item of allItems) {
    if (item.inventory?.bucketTypeHash === classBucketHash && item.sockets) {
      const indexes: number[] = [];

      // get all the socket indexes that have the right category hash
      for (const socketCategory of item.sockets.socketCategories) {
        if (socketCategory.socketCategoryHash === superSocketCategoryHash) {
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
            plugTracker[
              `${plugItem.plug.plugCategoryIdentifier} - ${plugItem.displayProperties.name}`
            ] = plugCategoryHash;
          }
        }
      }
    }
  }

  // Log this to make debugging easier
  if (DEBUG) {
    infoLog(TAG, 'Subclass super plugs found');
    infoTable(plugTracker);
  }
  return Array.from(new Set(Object.values(plugTracker)));
}

const subclassPlugs = uniqAndSortArray(findAllSubclassSuperPlugs());

writeFile('./output/subclass-super-plug-category-hashes.json', subclassPlugs);
