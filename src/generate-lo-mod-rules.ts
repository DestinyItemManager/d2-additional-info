import { getAll, loadLocal } from '@d2api/manifest-node';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

loadLocal();
const loModRules: Record<number, string[]> = {};

const debug = true;

const allArmorMods = getAll('DestinyInventoryItemDefinition').filter((i) =>
  i.itemCategoryHashes?.includes(ItemCategoryHashes.ArmorMods)
);

const allSandboxPerks = getAll('DestinySandboxPerkDefinition');

const allArmorModsDesc: Record<number, string | undefined> = {};

allArmorMods.forEach((i) => {
  const armorModName = i.displayProperties.name;
  const itemWithSameName = allSandboxPerks.find((p) => p.displayProperties.name === armorModName);
  if (itemWithSameName?.displayProperties.description) {
    allArmorModsDesc[i.hash] = itemWithSameName.displayProperties.description;
  }
});

Object.entries(allArmorModsDesc).forEach(([hash, desc]) => {
  loModRules[Number(hash)] = [];
  if (desc?.includes('Become Charged')) {
    loModRules[Number(hash)].push('produce.cwl');
  }
  if (desc?.includes('While Charged')) {
    loModRules[Number(hash)].push('consumes.cwl');
  }
  if (desc?.includes('spawns an elemental well')) {
    loModRules[Number(hash)].push('produce.well');
  }
});

if (debug) {
  writeFile('./output/mod-description.json', allArmorModsDesc); // for debug / build only
}
writeFile('./output/lo-mod-rules.json', loModRules);
