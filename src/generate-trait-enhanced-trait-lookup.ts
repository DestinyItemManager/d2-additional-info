/**
 * Generates an invertible base trait -> enhanced trait mapping.
 */
import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { DestinyInventoryItemDefinition, TierType } from 'bungie-api-ts/destiny2';
import { PlugCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

loadLocal();

const traitToEnhancedTraitTable: Record<number, number> = {};

// Also retain which enhanced perks correspond to which base perks because DIM
// requires the mapping to be invertible and we should correctly prioritize mappings
const enhancedTraitToTraitTable: Record<number, number> = {};

const matchTraits = (plugs: DestinyInventoryItemDefinition[]) => {
  const traits = plugs.filter((p) => p.displayProperties.name);
  const basicTraits = traits.filter((p) => p?.inventory?.tierType === TierType.Basic);
  const enhancedTraits = traits
    .filter((p) => p?.inventory?.tierType === TierType.Common)
    .map((x) => x!);

  basicTraits.forEach((bt) => {
    const enhancedTrait = enhancedTraits.find(
      (et) =>
        et.displayProperties.name == bt.displayProperties.name ||
        et.displayProperties.name.startsWith(bt.displayProperties.name)
    );

    if (enhancedTrait) {
      const existingBase = enhancedTraitToTraitTable[enhancedTrait.hash];
      if (existingBase) {
        if (existingBase !== bt.hash) {
          console.log(
            `ignoring base ${bt.displayProperties.name} (${bt.hash}) -> enhanced ${enhancedTrait.displayProperties.name} (${enhancedTrait.hash}) because other mapping (${existingBase}) was previously found`
          );
        }
      } else {
        traitToEnhancedTraitTable[bt.hash] = enhancedTrait.hash;
        enhancedTraitToTraitTable[enhancedTrait.hash] = bt.hash;
      }
    }
  });
};

const inventoryItems = getAll('DestinyInventoryItemDefinition');

// Prefer corresponding traits that come directly from the recipes, as they're certainly correct
const craftingRecipes = inventoryItems.filter((i) => i.crafting);
for (const recipe of craftingRecipes) {
  for (const socket of recipe.sockets!.socketEntries) {
    if (socket.reusablePlugSetHash) {
      const plugSet = get('DestinyPlugSetDefinition', socket.reusablePlugSetHash);
      if (plugSet) {
        const plugs = plugSet.reusablePlugItems
          .map((i) => get('DestinyInventoryItemDefinition', i.plugItemHash))
          .filter((p) => p)
          .map((p) => p!);
        matchTraits(plugs);
      }
    }
  }
}

// Then, match them over all existing traits because Bungie created
// enhanced versions for most random traits, even if they don't appear
// on patterns yet
const allTraits = inventoryItems.filter(
  (i) => i.plug?.plugCategoryHash === PlugCategoryHashes.Frames
);
matchTraits(allTraits);

writeFile('./output/trait-to-enhanced-trait.json', traitToEnhancedTraitTable);
