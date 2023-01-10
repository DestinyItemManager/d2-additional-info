import { getAll, loadLocal } from '@d2api/manifest-node';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

loadLocal();
const loModRules: Record<
  number,
  { max: number; excludes: number[]; requires: number[]; optionalRequires: number[] }
> = {};

const allArmorMods = getAll('DestinyInventoryItemDefinition').filter((i) =>
  i.itemCategoryHashes?.includes(ItemCategoryHashes.ArmorMods)
);

// only 1 of these mods may be equipped at a time
const finisherMods = allArmorMods
  .filter((i) => i.displayProperties.name.includes('Finisher'))
  .map((i) => i.hash);

finisherMods.forEach((hash) => {
  loModRules[hash] = {
    max: 1,
    excludes: finisherMods.filter((h) => h !== hash),
    requires: [],
    optionalRequires: [],
  };
});

// max of 1 should be equipped
const powerfulFriends = allArmorMods
  .filter((i) => i.displayProperties.name.includes('Powerful Friends'))
  .map((i) => i.hash);

const cwlMods = allArmorMods.filter((i) =>
  i.itemTypeDisplayName.includes('Charged with Light Mod')
);

powerfulFriends.forEach((hash) => {
  loModRules[hash] = {
    max: 1,
    excludes: [],
    requires: [],
    optionalRequires: [],
  };
});

writeFile('./output/lo-mod-rules.json', loModRules);

/*
function setLOmodRules(
  hash: number,
  max: number,
  excludes: number[],
  requires: number[],
  optionalRequires: number[]
) {
  loModRules[hash] = {
    max: max,
    excludes: excludes,
    requires: requires,
    optionalRequires: optionalRequires,
  };
}
*/
