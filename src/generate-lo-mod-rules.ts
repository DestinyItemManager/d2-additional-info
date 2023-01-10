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
  loModRules[Number(i.hash)] = [];
  const armorModName = i.displayProperties.name;
  const itemWithSameName = allSandboxPerks.find((p) => p.displayProperties.name === armorModName);
  // currently matching on description instead of i.perks[x] lookup
  if (itemWithSameName?.displayProperties.description) {
    allArmorModsDesc[i.hash] = itemWithSameName.displayProperties.description;
  }
  if (armorModName.match(/radiant light|powerful friends/i)) {
    loModRules[Number(i.hash)].push('max.1');
  }
  if (armorModName.match(/finisher/i)) {
    loModRules[Number(i.hash)].push('finisher');
  }
});

Object.entries(allArmorModsDesc).forEach(([hash, desc]) => {
  if (desc?.match(/become charged/i)) {
    loModRules[Number(hash)].push('produce.cwl');
  }
  if (desc?.match(/while charged/i)) {
    loModRules[Number(hash)].push('consumes.cwl');
  }
  if (desc?.match(/spawns a(n| void| solar|n arc| stasis| strand)? elemental well/i)) {
    loModRules[Number(hash)].push('produce.well');
  }
  if (desc?.match(/picking up a(n| void| solar|n arc| stasis| strand)? elemental well/i)) {
    loModRules[Number(hash)].push('consumes.well');
  }
  if (desc?.match(/does not stack/i)) {
    loModRules[Number(hash)].push('max.1');
  }
  if (desc?.match(/damage with a grenade|grenade attack|damaging a glyphkeeper with a grenade/i)) {
    loModRules[Number(hash)].push('consumes.damage.grenade');
  }
  if (
    desc?.match(
      /defeating a(( taken)? combantant| vex)? with a grenade|grenade (kill|final blows)/i
    )
  ) {
    loModRules[Number(hash)].push('consumes.kill.grenade');
  }
  if (desc?.match(/grants additional damage to your melee and grenade abilities/i)) {
    loModRules[Number(hash)].push('produce.grenade.damage');
    loModRules[Number(hash)].push('produce.melee.damage');
  }
});

// Remove empty behavior, reduce noise
Object.keys(loModRules).forEach((key) => {
  if (loModRules[Number(key)].length === 0) {
    delete loModRules[Number(key)];
  }
});

if (debug) {
  writeFile('./output/mod-description.json', allArmorModsDesc); // for debug / build only
}
writeFile('./output/lo-mod-rules.json', loModRules);
