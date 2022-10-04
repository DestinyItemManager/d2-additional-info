import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { DamageType } from 'bungie-api-ts/destiny2/interfaces.js';
import { PlugCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

loadLocal();

const debug = false;
const inventoryItems = getAll('DestinyInventoryItemDefinition');

const burns = ['arc', 'solar', 'void', 'stasis', 'strand'];
const exoticSynergyDebug = {} as Record<string, { desc: string; synergy: string[] }>;

const exoticSynergy = {} as Record<
  number,
  { synergy: string[]; subclass: number[]; damageType: number[] }
>;

const getComposedRegex = (...regexes: RegExp[]) =>
  new RegExp(regexes.map((regex) => regex.source).join('|'));

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
    grenades: generateRegexByPCH([PlugCategoryHashes.SharedArcGrenades]),
    melees: generateRegexByPCH([
      PlugCategoryHashes.TitanArcMelee,
      PlugCategoryHashes.HunterArcMelee,
      PlugCategoryHashes.WarlockArcMelee,
    ]),
    verbs: /blind(s)?|jolt/,
    misc: /arc (bolt|ability|soul)|ionic traces/,
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
    grenades: generateRegexByPCH([PlugCategoryHashes.SharedSolarGrenades]),
    melees: generateRegexByPCH([
      PlugCategoryHashes.TitanSolarMelee,
      PlugCategoryHashes.HunterSolarMelee,
      PlugCategoryHashes.WarlockSolarMelee,
    ]),
    verbs: /scorch(es)?/,
    misc: /sunspot|solar abilities|sol invictus|kni(v|f)e(s)?/,
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
    grenades: generateRegexByPCH([PlugCategoryHashes.SharedVoidGrenades]),
    melees: generateRegexByPCH([
      PlugCategoryHashes.TitanVoidMelee,
      PlugCategoryHashes.HunterVoidMelee,
      PlugCategoryHashes.WarlockVoidMelee,
    ]),
    verbs: /suppresses/,
    misc: /smoke bomb|void-damage|devour|invisible|blink/,
  },
  stasis: {
    super: [
      getSingleSuperNameAndHash('glacial quake'),
      getSingleSuperNameAndHash('silence and squall'),
      getSingleSuperNameAndHash("winter's wrath"),
    ],
    damageType: DamageType.Stasis,
    grenades: generateRegexByPCH([PlugCategoryHashes.SharedStasisGrenades]),
    melees: generateRegexByPCH([
      PlugCategoryHashes.TitanStasisMelee,
      PlugCategoryHashes.HunterStasisMelee,
      PlugCategoryHashes.WarlockStasisMelee,
    ]),
    verbs: /slows/,
    misc: /stasis subclass/,
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
    grenades:
      /*generateRegexByPCH([PlugCategoryHashes.SharedStrandGrenades]);*/ /strand grenade(s)?/,
    melees: /*generateRegexByPCH([
      PlugCategoryHashes.TitanStrandMelee,
      PlugCategoryHashes.HunterStrandMelee,
      PlugCategoryHashes.WarlockStrandMelee
    ]);*/ /strand melee(s)?/,
    verbs: /strand/,
    misc: /strand subclass/,
  },
} as Record<
  string,
  {
    super: { name: string; hash: number; regex: RegExp }[];
    damageType: number;
    grenades: RegExp;
    melees: RegExp;
    verbs: RegExp;
    misc: RegExp;
  }
>;

const superRegex = {
  arc: generateGenericRegexFromObject(synergies.arc.super),
  solar: generateGenericRegexFromObject(synergies.solar.super),
  void: generateGenericRegexFromObject(synergies.void.super),
  stasis: generateGenericRegexFromObject(synergies.stasis.super),
  strand: generateGenericRegexFromObject(synergies.strand.super),
};

const keywords = {
  arc: getComposedRegex(
    superRegex.arc,
    synergies.arc.grenades,
    synergies.arc.melees,
    synergies.arc.verbs,
    synergies.arc.misc
  ),
  solar: getComposedRegex(
    superRegex.solar,
    synergies.solar.grenades,
    synergies.solar.melees,
    synergies.solar.verbs,
    synergies.solar.misc
  ),
  void: getComposedRegex(
    superRegex.void,
    synergies.void.grenades,
    synergies.void.melees,
    synergies.void.verbs,
    synergies.void.misc
  ),
  stasis: getComposedRegex(
    superRegex.stasis,
    synergies.stasis.grenades,
    synergies.stasis.melees,
    synergies.stasis.verbs,
    synergies.stasis.misc
  ),
  // Naive attempt to catch new strand exotics on LightFall release
  strand: getComposedRegex(
    superRegex.strand,
    synergies.strand.grenades,
    synergies.strand.melees,
    synergies.strand.verbs,
    synergies.strand.misc
  ),
} as Record<string, RegExp>;

const exclusions = {
  arc: /sentinel shield/, // sentinel shield blinds ...
} as Record<string, RegExp>;

const intrinsicTraitHash = 965959289;

inventoryItems.filter(
  (item) =>
    item.equippingBlock?.uniqueLabel === 'exotic_armor' &&
    item.sockets?.socketEntries.find((socket) => {
      if (socket.socketTypeHash === intrinsicTraitHash) {
        const synergy = [];
        const damageType = [];
        const subclass = [];
        const intrinsicTraitDescription =
          get(
            'DestinyInventoryItemDefinition',
            socket.singleInitialItemHash
          )?.displayProperties.description.toLowerCase() ?? '';

        for (const burn of burns) {
          if (
            keywords[burn].test(intrinsicTraitDescription) &&
            !exclusions[burn]?.test(intrinsicTraitDescription)
          ) {
            synergy.push(burn);
            damageType.push(synergies[burn].damageType);
            for (const sooper of synergies[burn].super) {
              if (sooper.regex.test(intrinsicTraitDescription)) {
                subclass.push(sooper.hash);
                synergy.push(sooper.name);
              }
            }
          }
        }

        if (debug) {
          exoticSynergyDebug[item.displayProperties.name] = {
            desc: intrinsicTraitDescription.replace(/\n/g, ' '),
            synergy,
          };
        }

        exoticSynergy[item.hash] = { synergy, damageType, subclass };
      }
    })
);

if (debug) {
  console.log(exoticSynergyDebug);
}

writeFile('./output/exotic-synergy.json', exoticSynergy);

function generateRegexByPCH(plugHashes: PlugCategoryHashes[]) {
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
  const name = normalizeSuperName(item?.displayProperties.name ?? '');
  let regex = name;
  if (additionalMatch) {
    regex += `|${normalizeSuperName(additionalMatch)}`;
  }
  return { name, hash: item?.hash ?? 0, regex: RegExp(regex) };
}

function normalizeSuperName(name: string) {
  return name.toLowerCase().replace(/ - /g, '|').replace(/: /g, '|');
}

function generateGenericRegexFromObject(obj: { name: string; hash: number; regex: RegExp }[]) {
  let regex = '';
  for (const [, value] of Object.entries(obj)) {
    regex += Object(value).regex;
  }
  return new RegExp(regex.replace(/\/\//g, '|').replace(/\//g, ''));
}
