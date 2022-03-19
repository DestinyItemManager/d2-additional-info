import { getAll, loadLocal } from '@d2api/manifest-node';
import { PlugCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const allTraits = inventoryItems.filter(
  (i) => i.plug?.plugCategoryHash === PlugCategoryHashes.Frames
);

const basicTraits = allTraits.filter((i) => i.inventory?.tierTypeHash === 3340296461);

const enhancedTraits = allTraits.filter((i) => i.inventory?.tierTypeHash === 2395677314);

const traitToEnhancedTraitTable: Record<number, number> = {};

basicTraits.forEach((bt) => {
  const enhancedTrait = enhancedTraits.find(
    (et) =>
      et.displayProperties.name == bt.displayProperties.name ||
      et.displayProperties.name.startsWith(bt.displayProperties.name)
  );

  if (enhancedTrait) {
    traitToEnhancedTraitTable[bt.hash] = enhancedTrait.hash;
  }
});

writeFile('./output/trait-to-enhanced-trait.json', traitToEnhancedTraitTable);
