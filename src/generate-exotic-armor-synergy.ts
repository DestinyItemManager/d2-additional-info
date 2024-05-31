import { getDef, getAllDefs } from '@d2api/manifest-node';
import { burns, synergies } from '../data/exotic-synergies.js';
import { writeFile } from './helpers.js';
import { DamageType } from 'bungie-api-ts/destiny2/interfaces.js';

const debug = false;

const inventoryItems = getAllDefs('InventoryItem');
const exoticSynergy = {} as Record<number, { subclass?: number[]; damageType?: number[] }>;
const exoticSynergyDebug = {} as Record<string, { desc: string; synergy: string[] }>;
const exoticSocketTypeHash = 965959289;

inventoryItems.filter(
  (item) =>
    item.equippingBlock?.uniqueLabel === 'exotic_armor' &&
    item.sockets?.socketEntries.find((socket) => {
      if (socket.socketTypeHash === exoticSocketTypeHash) {
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
            if (debug) {
              synergy.push(synergyDebugInfo(synergies[burn].damageType));
            }
            for (const sooper of synergies[burn].super) {
              if (sooper.regex.test(intrinsicTraitDescription)) {
                subclass.push(sooper.hash);
                if (debug) {
                  synergy.push(sooper.name);
                }
              }
            }
            subclass.sort();
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

        if (debug) {
          exoticSynergyDebug[item.displayProperties.name] = {
            desc: intrinsicTraitDescription.replace(/\n/g, ' '),
            synergy,
          };
        }
      }
    }),
);

if (debug) {
  console.log(synergies);
  console.log(exoticSynergyDebug);
}

writeFile('./output/exotic-synergy.json', exoticSynergy);

function synergyDebugInfo(damageType: number) {
  switch (damageType) {
    case DamageType.Arc:
      return 'arc';
    case DamageType.Thermal:
      return 'solar';
    case DamageType.Void:
      return 'void';
    case DamageType.Stasis:
      return 'stasis';
    case DamageType.Strand:
      return 'strand';
    default:
      return '';
  }
}
