import { getAllDefs, loadLocal } from '@d2api/manifest-node';
import { PlugCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

/**
 * Some mods come with descriptions that don't accurately represent the effect that the mod does,
 * and this is a list of all mods who's descriptions don't match their effects
 *
 * ex. Harmonic Siphon it comes with 5 hidden descriptions for each of its 5 states being
 * Multi kills with solar weapons creates orbs of power and that changes in game depending on the selected subclass,
 * but there is no accurate way to represent the effect the mod will really have with what is provided in game
 */

loadLocal();

const inventoryItems = getAllDefs('InventoryItem');
const noteableModStrings = ['Harmonic'];

const specialMods: {
  [key: string]: number[];
} = {};

noteableModStrings.forEach((identifier) => {
  const mods: number[] = inventoryItems
    .filter(
      (item) =>
        (item.plug?.plugCategoryHash == PlugCategoryHashes.EnhancementsV2Head ||
          item.plug?.plugCategoryHash == PlugCategoryHashes.EnhancementsV2Arms ||
          item.plug?.plugCategoryHash == PlugCategoryHashes.EnhancementsV2Chest ||
          item.plug?.plugCategoryHash == PlugCategoryHashes.EnhancementsV2Legs ||
          item.plug?.plugCategoryHash == PlugCategoryHashes.EnhancementsV2ClassItem) &&
        item.displayProperties.name.trim().includes(identifier)
    )
    .map((item) => item.hash);
  specialMods[identifier] = mods;
});

writeFile('./output/mods-with-bad-descriptions.json', specialMods);
