import { getAllDefs, loadLocal } from '@d2api/manifest-node';
import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2';
import { PlugCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';
loadLocal();

const inventoryItems = getAllDefs('InventoryItem');

const normalToReducedMod: { [normalModHash: number]: number } = {};

const modsMap: {
  [pch: number]: { [displayName: string]: DestinyInventoryItemDefinition[] };
} = {
  [PlugCategoryHashes.EnhancementsV2General]: {},
  [PlugCategoryHashes.EnhancementsV2Head]: {},
  [PlugCategoryHashes.EnhancementsV2Arms]: {},
  [PlugCategoryHashes.EnhancementsV2Chest]: {},
  [PlugCategoryHashes.EnhancementsV2Legs]: {},
  [PlugCategoryHashes.EnhancementsV2ClassItem]: {},
};

for (const item of inventoryItems) {
  if (
    item.displayProperties?.name &&
    item.plug &&
    item.plug.plugCategoryHash in modsMap &&
    item.plug.energyCost
  ) {
    (modsMap[item.plug.plugCategoryHash][item.displayProperties.name] ??= []).push(item);
  }
}

for (const slot of Object.values(modsMap)) {
  for (const [displayName, mods] of Object.entries(slot)) {
    if (mods.length > 2 && displayName !== 'Deprecated Armor Mod') {
      console.warn(
        'mod-cost-reductions',
        `this is getting out of hand, ${mods.length} copies of ${displayName}?`
      );
    } else if (mods.length === 2) {
      const [reducedMod, normalMod] = mods.sort(
        (modA, modB) => modA.plug!.energyCost!.energyCost - modB.plug!.energyCost!.energyCost
      );
      normalToReducedMod[normalMod.hash] = reducedMod.hash;
    }
  }
}

const outString = `export const normalToReducedMod: { [normalModHash: number]: number } = ${JSON.stringify(
  normalToReducedMod,
  null,
  2
)};\n\n
export const reducedToNormalMod: { [reducedModHash: number]: number } = Object.fromEntries(Object.entries(normalToReducedMod).map(([normal, reduced]) => [reduced, parseInt(normal, 10)]));
`;

writeFile('./output/reduced-cost-mod-mappings.ts', outString);
