import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { DamageType } from 'bungie-api-ts/destiny2/interfaces.js';
import { PlugCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const burns = ['arc', 'solar', 'void', 'stasis', 'strand'];
const intrinsicTraitHash = 965959289;
const debug = false;

const exoticSynergy = {} as Record<number, { subclass: number[]; damageType: number[] }>;
const exoticSynergyDebug = {} as Record<string, { desc: string; synergy: string[] }>;

const synergies = {
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
      /*getSingleSuperNameAndHash('architect') */
      {
        regex: /architect/,
        name: 'architect',
        hash: 0,
      },
      /*getSingleSuperNameAndHash('threadrunner') */
      {
        regex: /threadrunner/,
        name: 'threadrunner',
        hash: 0,
      },
      /*getSingleSuperNameAndHash('tyrant') */
      {
        regex: /tyrant/,
        name: 'tyrant',
        hash: 0,
      },
    ],
    damageType: /*DamageType.Strand*/ 0,
    grenades: /*getRegexByPCH([PlugCategoryHashes.SharedStrandGrenades]);*/ /strand grenade(s)?/,
    melees: /*getRegexByPCH([
      PlugCategoryHashes.TitanStrandMelee,
      PlugCategoryHashes.HunterStrandMelee,
      PlugCategoryHashes.WarlockStrandMelee
    ]);*/ /strand melee(s)?/,
    verbs: /strand/,
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

for (const burn of burns) {
  synergies[burn].superRegex = getSuperRegex(synergies[burn].super);
  synergies[burn].keywords.include = getBurnKeywords(burn);
}

inventoryItems.filter(
  (item) =>
    item.equippingBlock?.uniqueLabel === 'exotic_armor' &&
    item.sockets?.socketEntries.find((socket) => {
      if (socket.socketTypeHash === intrinsicTraitHash) {
        const synergy = [] as string[];
        const damageType = [];
        const subclass = [];
        const intrinsicTraitDescription =
          get(
            'DestinyInventoryItemDefinition',
            socket.singleInitialItemHash
          )?.displayProperties.description.toLowerCase() ?? '';

        for (const burn of burns) {
          if (
            synergies[burn].keywords.include?.test(intrinsicTraitDescription) &&
            !synergies[burn].keywords.exclude?.test(intrinsicTraitDescription)
          ) {
            damageType.push(synergies[burn].damageType);
            for (const sooper of synergies[burn].super) {
              if (sooper.regex.test(intrinsicTraitDescription)) {
                subclass.push(sooper.hash);
              }
            }
          }
        }
        exoticSynergy[item.hash] = { damageType, subclass };

        if (debug) {
          exoticSynergyDebug[item.displayProperties.name] = {
            desc: intrinsicTraitDescription.replace(/\n/g, ' '),
            synergy,
          };
        }
      }
    })
);

if (debug) {
  console.log(exoticSynergyDebug);
}

writeFile('./output/exotic-synergy.json', exoticSynergy);

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

function getSuperRegex(obj: { name: string; hash: number; regex: RegExp }[]) {
  let regex = new RegExp(/ /);
  for (const [, value] of Object.entries(obj)) {
    regex = getComposedRegex(regex, Object(value).regex);
  }
  return new RegExp(regex.source.slice(2)); // remove leading space-pipe ' |'
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

function getComposedRegex(...regexes: RegExp[]) {
  return new RegExp(regexes.map((regex) => regex.source).join('|'));
}
