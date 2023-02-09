import { getAll, loadLocal } from '@d2api/manifest-node';
import { DamageType } from 'bungie-api-ts/destiny2/interfaces.js';
import { getComposedRegex } from '../src/helpers.js';
import { PlugCategoryHashes } from './generated-enums.js';

loadLocal();
const inventoryItems = getAll('DestinyInventoryItemDefinition');

export const synergies = {
  arc: {
    super: [
      getSingleSuperNameAndHash('fists of havoc'),
      getSingleSuperNameAndHash('thundercrash'),
      getSingleSuperNameAndHash('stormtrance'),
      getSingleSuperNameAndHash('chaos reach'),
      getSingleSuperNameAndHash('arc staff', 'whirlwind guard'),
      getSingleSuperNameAndHash('gathering storm'),
    ],
    damageType: DamageType.Arc,
    grenades: getRegexByPCH([PlugCategoryHashes.SharedArcGrenades]),
    melees: getRegexByPCH([
      PlugCategoryHashes.TitanArcMelee,
      PlugCategoryHashes.HunterArcMelee,
      PlugCategoryHashes.WarlockArcMelee,
    ]),
    verbs: /blind(s)?|jolt/,
    misc: /arc (bolt|ability|soul)|ionic traces/,
    keywords: {
      exclude: /sentinel shield/,
    },
  },
  solar: {
    super: [
      getSingleSuperNameAndHash('golden gun - marksman'),
      getSingleSuperNameAndHash('golden gun - deadshot'),
      getSingleSuperNameAndHash('blade barrage'),
      getSingleSuperNameAndHash('daybreak', 'dawnblade'),
      getSingleSuperNameAndHash('well of radiance', 'dawnblade'),
      getSingleSuperNameAndHash('burning maul'),
      getSingleSuperNameAndHash('hammer of sol'),
    ],
    damageType: DamageType.Thermal,
    grenades: getRegexByPCH([PlugCategoryHashes.SharedSolarGrenades]),
    melees: getRegexByPCH([
      PlugCategoryHashes.TitanSolarMelee,
      PlugCategoryHashes.HunterSolarMelee,
      PlugCategoryHashes.WarlockSolarMelee,
    ]),
    verbs: /scorch(es)?/,
    misc: /sunspot|solar abilities|sol invictus|kni(v|f)e(s)?/,
    keywords: {},
  },
  void: {
    super: [
      getSingleSuperNameAndHash('spectral blades'),
      getSingleSuperNameAndHash('deadfall'),
      getSingleSuperNameAndHash('moebius quiver'),
      getSingleSuperNameAndHash('ward of dawn'),
      getSingleSuperNameAndHash('sentinel shield'),
      getSingleSuperNameAndHash('nova bomb: cataclysm'),
      getSingleSuperNameAndHash('nova bomb: vortex'),
      getSingleSuperNameAndHash('nova warp'),
    ],
    damageType: DamageType.Void,
    grenades: getRegexByPCH([PlugCategoryHashes.SharedVoidGrenades]),
    melees: getRegexByPCH([
      PlugCategoryHashes.TitanVoidMelee,
      PlugCategoryHashes.HunterVoidMelee,
      PlugCategoryHashes.WarlockVoidMelee,
    ]),
    verbs: /suppresses/,
    misc: /smoke bomb|void-damage|devour|invisible|blink/,
    keywords: {},
  },
  stasis: {
    super: [
      getSingleSuperNameAndHash('glacial quake'),
      getSingleSuperNameAndHash('silence and squall'),
      getSingleSuperNameAndHash("winter's wrath"),
    ],
    damageType: DamageType.Stasis,
    grenades: getRegexByPCH([PlugCategoryHashes.SharedStasisGrenades]),
    melees: getRegexByPCH([
      PlugCategoryHashes.TitanStasisMelee,
      PlugCategoryHashes.HunterStasisMelee,
      PlugCategoryHashes.WarlockStasisMelee,
    ]),
    verbs: /slows/,
    misc: /stasis subclass/,
    keywords: {},
  },
  strand: {
    super: [
      {
        regex: /architect/,
        name: 'architect',
        hash: 0,
      },

      {
        regex: /threadrunner/,
        name: 'threadrunner',
        hash: 0,
      },
      {
        regex: /tyrant/,
        name: 'tyrant',
        hash: 0,
      },
      /*
         getSingleSuperNameAndHash('architect'),
         getSingleSuperNameAndHash('threadrunner'),
         getSingleSuperNameAndHash('tyrant'),
      */
    ],
    damageType: 0 /*DamageType.Strand*/,
    grenades: /strand grenade(s)?/ /*getRegexByPCH([PlugCategoryHashes.SharedStrandGrenades]);*/,
    melees: /strand melee(s)?/ /*getRegexByPCH([
      PlugCategoryHashes.TitanStrandMelee,
      PlugCategoryHashes.HunterStrandMelee,
      PlugCategoryHashes.WarlockStrandMelee
    ]);*/,
    verbs: /sever(es)?|suspend(s)?|unravel(s)?/,
    misc: /strand subclass/,
    keywords: {},
  },
} as Record<
  string,
  {
    super: { name: string; hash: number; regex: RegExp }[];
    superRegex?: RegExp;
    damageType: number;
    grenades: RegExp;
    melees: RegExp;
    verbs: RegExp;
    misc: RegExp;
    keywords: {
      include?: RegExp;
      exclude?: RegExp;
    };
  }
>;

export const burns = ['arc', 'solar', 'void', 'stasis', 'strand'];

for (const burn of burns) {
  synergies[burn].superRegex = getSuperRegex(synergies[burn].super);
  synergies[burn].keywords.include = getBurnKeywords(burn);
}

function getSingleSuperNameAndHash(itemName: string, additionalMatch?: string) {
  const item = inventoryItems.find(
    (item) =>
      item.itemTypeDisplayName === 'Super Ability' &&
      item.displayProperties.name.toLowerCase().includes(itemName.toLowerCase())
  );
  const name =
    item?.displayProperties.name.toLowerCase().replace(/ - /g, '|').replace(/: /g, '|') ?? '';
  let regex = name;
  if (additionalMatch) {
    regex += `|${additionalMatch}`;
  }
  return { name, hash: item?.hash ?? 0, regex: RegExp(regex) };
}

function getRegexByPCH(plugHashes: PlugCategoryHashes[]) {
  const items = inventoryItems.filter((item) =>
    plugHashes.includes(item.plug?.plugCategoryHash ?? 0)
  );
  const itemTypeDisplayName = items.flatMap((i) => i.itemTypeDisplayName.toLowerCase())[0];
  return RegExp(
    `${items
      .map((i) => i.displayProperties.name.toLowerCase())
      .join('|')}|${itemTypeDisplayName}(s)?`
  );
}

function getSuperRegex(obj: { name: string; hash: number; regex: RegExp }[]) {
  let regex = [] as RegExp[];
  for (const [, value] of Object.entries(obj)) {
    regex.push(Object(value).regex);
  }
  return getComposedRegex(...regex);
}

function getBurnKeywords(burn: string) {
  if (synergies[burn].superRegex) {
    return getComposedRegex(
      synergies[burn].superRegex!,
      synergies[burn].grenades,
      synergies[burn].melees,
      synergies[burn].verbs,
      synergies[burn].misc
    );
  }
}
