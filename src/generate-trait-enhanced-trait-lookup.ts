/**
 * Generates an invertible base trait -> enhanced trait mapping.
 */
import { getAllDefs, getDef } from '@d2api/manifest-node';
import { DestinyInventoryItemDefinition, TierType } from 'bungie-api-ts/destiny2';
import { writeFile } from './helpers.js';
import { warnLog } from './log.js';

const TAG = 'ENHANCED-TRAIT';
const DEBUG = false;

const traitToEnhancedTraitTable: Record<number, number> = {};

// Also retain which enhanced perks correspond to which base perks because DIM
// requires the mapping to be invertible and we should correctly prioritize mappings
const enhancedTraitToTraitTable: Record<number, number> = {};

const matchTraits = (plugs: DestinyInventoryItemDefinition[]) => {
  const traits = plugs.filter((p) => p.displayProperties.name);
  const basicTraits = traits.filter((p) => p?.inventory?.tierType === TierType.Basic);
  const enhancedTraits = traits.filter((p) => p?.inventory?.tierType === TierType.Common);

  basicTraits.forEach((bt) => {
    const enhancedTrait = enhancedTraits.find(
      (et) =>
        et.displayProperties.name == bt.displayProperties.name ||
        et.displayProperties.name == `${bt.displayProperties.name} Enhanced`,
    );

    if (enhancedTrait) {
      const existingBase = enhancedTraitToTraitTable[enhancedTrait.hash];
      if (existingBase) {
        if (existingBase !== bt.hash && DEBUG) {
          warnLog(
            TAG,
            `ignoring base ${bt.displayProperties.name} (${bt.hash}) -> enhanced ${enhancedTrait.displayProperties.name} (${enhancedTrait.hash}) because other mapping (${existingBase}) was previously found`,
          );
        }
      } else {
        traitToEnhancedTraitTable[bt.hash] = enhancedTrait.hash;
        enhancedTraitToTraitTable[enhancedTrait.hash] = bt.hash;
      }
    }
  });
};

// Look at every plugset and find traits and enhanced trait pairs that are within them.
const plugSets = getAllDefs('PlugSet');
for (const plugSet of plugSets) {
  const plugs: DestinyInventoryItemDefinition[] = plugSet.reusablePlugItems
    ?.map((i) => getDef('InventoryItem', i.plugItemHash))
    .filter((p) => p)
    .map((p) => p!);
  if (plugs?.length) {
    matchTraits(plugs);
  }
}

// Some traits are only found directly on items' sockets, so look at all items
// and find traits and enhanced trait pairs that are within them.
const inventoryItems = getAllDefs('InventoryItem');
for (const item of inventoryItems) {
  for (const socket of item.sockets?.socketEntries || []) {
    const plugs: DestinyInventoryItemDefinition[] = socket.reusablePlugItems
      .map((i) => getDef('InventoryItem', i.plugItemHash))
      .filter((p) => p)
      .map((p) => p!);
    if (plugs.length) {
      matchTraits(plugs);
    }
  }
}

writeFile('./output/trait-to-enhanced-trait.json', traitToEnhancedTraitTable);
