import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { ItemCategoryHashes, SocketCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const extendedBreakers = {} as Record<number, number>;

inventoryItems.filter(
  (item) =>
    item.equippingBlock &&
    item.breakerType === 0 &&
    item.sockets?.socketEntries.find((socket) => {
      if ([SocketCategoryHashes.IntrinsicTraits, 965959289].includes(socket.socketTypeHash)) {
        let extendedBreaker = 0;
        const intrinsicTraitDescription =
          get(
            'DestinyInventoryItemDefinition',
            socket.singleInitialItemHash
          )?.displayProperties.description.toLowerCase() ?? '';
        if (/shield-piercing|disrupt|overload|stagger/.test(intrinsicTraitDescription)) {
          switch (true) {
            case /shield-piercing/.test(intrinsicTraitDescription):
              extendedBreaker = ItemCategoryHashes.BreakerPiercing;
              break;
            case /disrupt|overload/.test(intrinsicTraitDescription):
              extendedBreaker = ItemCategoryHashes.BreakerDisruption;
              break;
            case /stagger/.test(intrinsicTraitDescription):
              extendedBreaker = ItemCategoryHashes.BreakerStagger;
          }
          extendedBreakers[item.hash] = extendedBreaker;
        }
      }
    })
);

writeFile('./output/extended-breaker.json', extendedBreakers);
