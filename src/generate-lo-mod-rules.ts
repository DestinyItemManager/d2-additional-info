import { getAll, loadLocal } from '@d2api/manifest-node';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

loadLocal();
const loModRules: Record<string, string[]> = {};

const debug = true;

const allArmorMods = getAll('DestinyInventoryItemDefinition').filter((i) =>
  i.itemCategoryHashes?.includes(ItemCategoryHashes.ArmorMods)
);

const allSandboxPerks = getAll('DestinySandboxPerkDefinition');

const allArmorModsDesc: Record<string, string> = {};

allArmorMods.forEach((i) => {
  loModRules[i.hash] = [];
  const armorModName = i.displayProperties.name;
  const itemWithSameName = allSandboxPerks.find((p) => p.displayProperties.name === armorModName);
  // currently matching on description instead of i.perks[x] lookup
  if (itemWithSameName?.displayProperties.description) {
    allArmorModsDesc[i.hash] = itemWithSameName.displayProperties.description;
  }
  if (armorModName.match(/radiant light|powerful friends/i)) {
    loModRules[i.hash].push('max.1');
  }
  if (armorModName.match(/finisher/i)) {
    loModRules[i.hash].push('finisher');
  }
});

Object.entries(allArmorModsDesc).forEach(([hash, desc]) => {
  if (desc?.match(/become charged/i)) {
    loModRules[hash].push('produce.cwl');
  }
  if (desc?.match(/while charged/i)) {
    loModRules[hash].push('consume.cwl');
  }
  if (desc?.match(/spawns a(n| void| solar|n arc| stasis| strand)? elemental well/i)) {
    loModRules[hash].push('produce.well');
  }
  if (desc?.match(/picking up a(n| void| solar|n arc| stasis| strand)? elemental well/i)) {
    loModRules[hash].push('consume.well');
  }
  if (desc?.match(/does not stack/i)) {
    loModRules[hash].push('max.1');
  }
  if (desc?.match(/damag(e|ing)( a glyphkeeper)? with a grenade|grenade attack/i)) {
    loModRules[hash].push('consume.damage.grenade');
  }
  if (
    desc?.match(/defeating a(( taken)? combatant| vex)? with a grenade|grenade (kill|final blows)/i)
  ) {
    loModRules[hash].push('consume.kill.grenade');
  }
  if (desc?.match(/grants additional damage to your melee and grenade abilities/i)) {
    loModRules[hash].push('produce.grenade.damage');
    loModRules[hash].push('produce.melee.damage');
  }
});

// Remove empty behavior, reduce noise
Object.keys(loModRules).forEach((key) => {
  if (loModRules[key].length === 0) {
    delete loModRules[key];
  }
});

if (debug) {
  writeFile('./output/mod-description.json', allArmorModsDesc); // for debug / build only
}
writeFile('./output/lo-mod-rules.json', loModRules);
