/**
 * Generates an invertible base trait -> enhanced trait mapping.
 */
import { getAllDefs, getDef } from '@d2api/manifest-node';
import { DestinyInventoryItemDefinition, TierType } from 'bungie-api-ts/destiny2';
import { writeFile } from './helpers.js';

const traitToEnhancedTraitTable: Record<number, number> = {};

const matchTraits = (plugs: DestinyInventoryItemDefinition[]) => {
  const traits = plugs.filter((p) => p.displayProperties.name);
  const basicTraits = traits.filter((p) => p?.inventory?.tierType === TierType.Basic);
  const enhancedTraits = traits.filter((p) => p?.inventory?.tierType === TierType.Common);

  basicTraits.forEach((bt) => {
    const enhancedTrait = enhancedTraits.find(
      (et) =>
        et.displayProperties.name == bt.displayProperties.name ||
        (et.displayProperties.name == `${bt.displayProperties.name} Enhanced` &&
          bt.perks.every((ep) => !et.perks?.every((bp) => bp.perkHash === ep.perkHash))),
    );

    if (enhancedTrait) {
      traitToEnhancedTraitTable[bt.hash] = enhancedTrait.hash;
    }
  });
};

const inventoryItems = getAllDefs('InventoryItem');

// Prefer corresponding traits that come directly from the recipes, as they're certainly correct
const craftingRecipes = inventoryItems.filter((i) => i.crafting);
for (const recipe of craftingRecipes) {
  for (const socket of recipe.sockets!.socketEntries) {
    if (socket.reusablePlugSetHash) {
      const plugSet = getDef('PlugSet', socket.reusablePlugSetHash);
      if (plugSet) {
        const plugs: DestinyInventoryItemDefinition[] = plugSet.reusablePlugItems
          .map((i) => getDef('InventoryItem', i.plugItemHash))
          .filter((p) => p)
          .map((p) => p!);
        matchTraits(plugs);
      }
    }
  }
}

const allTraits = inventoryItems.filter((i) => i.plug?.plugCategoryHash !== undefined);
matchTraits(allTraits);

writeFile('./output/trait-to-enhanced-trait.json', traitToEnhancedTraitTable);
