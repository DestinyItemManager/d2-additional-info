import { getDef, getAllDefs, loadLocal } from '@d2api/manifest-node';
import { burns, synergies } from '../data/exotic-synergies.js';
import { writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAllDefs('InventoryItem');

const debug = true;

const exoticSynergy = {} as Record<number, { subclass?: number[]; damageType?: number[] }>;
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
          getDef(
            'InventoryItem',
            socket.singleInitialItemHash,
          )?.displayProperties.description.toLowerCase() ?? '';

        for (const burn of burns) {
          if (
            synergies[burn].keywords.include?.test(intrinsicTraitDescription) &&
            !synergies[burn].keywords.exclude?.test(intrinsicTraitDescription)
          ) {
            damageType.push(synergies[burn].damageType);
            switch (synergies[burn].damageType) {
              case 2:
                synergy.push('arc');
                break;
              case 3:
                synergy.push('solar');
                break;
              case 4:
                synergy.push('void');
                break;
              case 6:
                synergy.push('stasis');
                break;
              case 7:
                synergy.push('strand');
                break;
            }
            for (const sooper of synergies[burn].super) {
              if (sooper.regex.test(intrinsicTraitDescription)) {
                subclass.push(sooper.hash);
                synergy.push(sooper.name);
              }
            }
          }
        }

        if (damageType.length > 0) {
          if (!exoticSynergy[item.hash]) {
            exoticSynergy[item.hash] = {};
          }
          exoticSynergy[item.hash].damageType = damageType;
        }
        if (subclass.length > 0) {
          if (!exoticSynergy[item.hash]) {
            exoticSynergy[item.hash] = {};
          }
          exoticSynergy[item.hash].subclass = subclass;
        }
        exoticSynergyDebug[item.displayProperties.name] = {
          desc: intrinsicTraitDescription.replace(/\n/g, ' '),
          synergy,
        };
      }
    }),
);

if (debug) {
  console.log(synergies);
  console.log(exoticSynergyDebug);
}

writeFile('./output/exotic-synergy.json', exoticSynergy);
