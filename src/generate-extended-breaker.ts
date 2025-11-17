import { getAllDefs, getDef } from '@d2api/manifest-node';
import { TierType } from 'bungie-api-ts/destiny2/interfaces.js';
import { BreakerTypeHashes, SocketCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

const inventoryItems = getAllDefs('InventoryItem');

const extendedBreakers: Record<number, number> = {};
const exoticSocketTypeHash = 965959289;

inventoryItems.filter(
  (item) =>
    item.equippingBlock &&
    item.breakerType === 0 &&
    item.sockets?.socketEntries.find((socket) => {
      if (
        [SocketCategoryHashes.IntrinsicTraits, exoticSocketTypeHash].includes(
          socket.socketTypeHash,
        ) ||
        (item.inventory?.tierType === TierType.Exotic &&
          getDef('SocketType', socket.socketTypeHash)?.socketCategoryHash ===
            SocketCategoryHashes.WeaponPerks_Reusable)
      ) {
        let extendedBreaker = 0;
        const intrinsicTraitDescription =
          getDef(
            'InventoryItem',
            socket.singleInitialItemHash,
          )?.displayProperties.description.toLowerCase() ?? '';
        if (
          /shield-piercing|disrupt|overload|stagger|unstoppable/.test(intrinsicTraitDescription)
        ) {
          switch (true) {
            case /shield-piercing/.test(intrinsicTraitDescription):
              extendedBreaker = BreakerTypeHashes.ShieldPiercing;
              break;
            case /disrupt|overload/.test(intrinsicTraitDescription):
              extendedBreaker = BreakerTypeHashes.Disruption;
              break;
            case /stagger|unstoppable/.test(intrinsicTraitDescription):
              extendedBreaker = BreakerTypeHashes.Stagger;
          }
          extendedBreakers[item.hash] = extendedBreaker;
        }
      }
    }),
);

writeFile('./output/extended-breaker.json', extendedBreakers);
