import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { burns, synergies } from '../data/exotic-synergies.js';
import { writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const debug = false;

const exoticSynergy = {} as Record<number, { subclass: number[]; damageType: number[] }>;
const exoticSynergyDebug = {} as Record<string, { desc: string; synergy: string[] }>;

inventoryItems.filter(
  (item) =>
    item.equippingBlock?.uniqueLabel === 'exotic_armor' &&
    item.sockets?.socketEntries.find((socket) => {
      if (socket.socketTypeHash === 965959289) {
        const synergy = [] as string[];
        const damageType = [] as number[];
        const subclass = [] as number[];
        const intrinsicTraitDescription =
          get(
            'DestinyInventoryItemDefinition',
            socket.singleInitialItemHash
          )?.displayProperties.description.toLowerCase() ?? '';

        for (const burn of burns) {
          if (
            synergies[burn].keywords.include?.test(intrinsicTraitDescription) &&
            !synergies[burn].keywords.exclude?.test(intrinsicTraitDescription)
          ) {
            damageType.push(synergies[burn].damageType);
            for (const sooper of synergies[burn].super) {
              if (sooper.regex.test(intrinsicTraitDescription)) {
                subclass.push(sooper.hash);
              }
            }
          }
        }

        exoticSynergy[item.hash] = { damageType, subclass };
        exoticSynergyDebug[item.displayProperties.name] = {
          desc: intrinsicTraitDescription.replace(/\n/g, ' '),
          synergy,
        };
      }
    })
);

if (debug) {
  console.log(exoticSynergyDebug);
}

writeFile('./output/exotic-synergy.json', exoticSynergy);
