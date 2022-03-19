import { getAll, loadLocal } from '@d2api/manifest-node';
import { writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const traits = inventoryItems.filter(
  (i) => i.plug?.plugCategoryHash === 7906839 && i.inventory?.tierTypeHash === 3340296461
);

const traitToEnhancedTraitTable: Record<number, number> = {};

traits.forEach((t) => {
  const enhancedTrait = traits.find(
    (et) =>
      et.inventory?.tierTypeHash === 2395677314 &&
      et.displayProperties.name.startsWith(t.displayProperties.name)
  );

  if (enhancedTrait) {
    traitToEnhancedTraitTable[t.hash] = enhancedTrait.hash;
  }
});

writeFile('./output/trait-to-enhanced-trait.json', traitToEnhancedTraitTable);
