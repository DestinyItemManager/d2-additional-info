import { getDef, getAllDefs } from '@d2api/manifest-node';
import { burns, synergies } from '../data/exotic-synergies.js';
import { writeFile, sortWithoutArticles } from './helpers.js';
import { DamageType } from 'bungie-api-ts/destiny2/interfaces.js';

const debug = true;

const inventoryItems = getAllDefs('InventoryItem');
const exoticSynergy = {} as Record<number, { subclass?: number[]; damageType?: number[] }>;
const exoticSynergyDebug = {} as Record<string, { desc: string; synergy: string[] }>;
const exoticSocketTypeHash = 965959289;

const debugArc: string[] = [];
const debugSolar: string[] = [];
const debugVoid: string[] = [];
const debugStasis: string[] = [];
const debugStrand: string[] = [];
const debugNeutral: string[] = [];

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
              synergy.push(
                synergyDebugInfo(item.displayProperties.name, synergies[burn].damageType),
              );
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

        // if an exotic matches all subclass damageTypes it is a neutral exotic
        if (damageType.length === 5) {
          damageType.length = 0;
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
          if (damageType.length === 0 && subclass.length === 0) {
            debugNeutral.push(item.displayProperties.name);
          }
        }
      }
    }),
);

if (debug) {
  console.log(synergies);
  console.log(exoticSynergyDebug);
  console.log(`${debugArc.length} Arc Exotics: `, debugArc.sort(sortWithoutArticles));
  console.log(`${debugSolar.length} Solar Exotics: `, debugSolar.sort(sortWithoutArticles));
  console.log(`${debugVoid.length} Void Exotics: `, debugVoid.sort(sortWithoutArticles));
  console.log(`${debugStasis.length} Stasis Exotics: `, debugStasis.sort(sortWithoutArticles));
  console.log(`${debugStrand.length} Strand Exotics: `, debugStrand.sort(sortWithoutArticles));
  console.log(`${debugNeutral.length} Neutral Exotics: `, debugNeutral.sort(sortWithoutArticles));
}

writeFile('./output/exotic-synergy.json', exoticSynergy);

function synergyDebugInfo(name: string, damageType: number) {
  switch (damageType) {
    case DamageType.Arc:
      debugArc.push(name);
      return 'arc';
    case DamageType.Thermal:
      debugSolar.push(name);
      return 'solar';
    case DamageType.Void:
      debugVoid.push(name);
      return 'void';
    case DamageType.Stasis:
      debugStasis.push(name);
      return 'stasis';
    case DamageType.Strand:
      debugStrand.push(name);
      return 'strand';
    default:
      return '';
  }
}
