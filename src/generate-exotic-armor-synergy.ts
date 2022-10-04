import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { DamageType } from 'bungie-api-ts/destiny2/interfaces.js';
import { PlugCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

loadLocal();

const debug = true;
const inventoryItems = getAll('DestinyInventoryItemDefinition');

const exoticSynergyDebug = {} as Record<string, { desc: string; synergy: string[] }>;

const exoticSynergy = {} as Record<
  number,
  { synergy: string[]; subclass: number[]; damageType: number[] }
>;

const getComposedRegex = (...regexes: RegExp[]) =>
  new RegExp(regexes.map((regex) => regex.source).join('|'));

// Grenade Identifiers
const arcGrenades = generateRegexByPCH([PlugCategoryHashes.SharedArcGrenades]);
const solarGrenades = generateRegexByPCH([PlugCategoryHashes.SharedSolarGrenades]);
const voidGrenades = generateRegexByPCH([PlugCategoryHashes.SharedVoidGrenades]);
const stasisGrenades = generateRegexByPCH([PlugCategoryHashes.SharedStasisGrenades]);
const strandGrenades =
  /*generateRegexByPCH([PlugCategoryHashes.SharedStrandGrenades]);*/ /strand grenade(s)?/;

// Melee Identifiers
const arcMelees = generateRegexByPCH([
  PlugCategoryHashes.TitanArcMelee,
  PlugCategoryHashes.HunterArcMelee,
  PlugCategoryHashes.WarlockArcMelee,
]);
const solarMelees = generateRegexByPCH([
  PlugCategoryHashes.TitanSolarMelee,
  PlugCategoryHashes.HunterSolarMelee,
  PlugCategoryHashes.WarlockSolarMelee,
]);
const voidMelees = generateRegexByPCH([
  PlugCategoryHashes.TitanVoidMelee,
  PlugCategoryHashes.HunterVoidMelee,
  PlugCategoryHashes.WarlockVoidMelee,
]);
const stasisMelees = generateRegexByPCH([
  PlugCategoryHashes.TitanStasisMelee,
  PlugCategoryHashes.HunterStasisMelee,
  PlugCategoryHashes.WarlockStasisMelee,
]);
const strandMelees = /*generateRegexByPCH([
  PlugCategoryHashes.TitanStrandMelee,
  PlugCategoryHashes.HunterStrandMelee,
  PlugCategoryHashes.WarlockStrandMelee
]);*/ /strand melee(s)?/;

// Super Identifiers (with regexen)
// Arc
const arcSuperObject = [
  getSingleSuperNameAndHash('fists of havoc'),
  getSingleSuperNameAndHash('thundercrash'),
  getSingleSuperNameAndHash('stormtrance'),
  getSingleSuperNameAndHash('chaos reach'),
  getSingleSuperNameAndHash('arc staff', 'whirlwind guard'),
  getSingleSuperNameAndHash('gathering storm'),
];
const arcSuperRegex = generateGenericRegexFromObject(arcSuperObject);

// Solar
const solarSuperObject = [
  getSingleSuperNameAndHash('golden gun - marksman'),
  getSingleSuperNameAndHash('golden gun - deadshot'),
  getSingleSuperNameAndHash('blade barrage'),
  getSingleSuperNameAndHash('daybreak', 'dawnblade'),
  getSingleSuperNameAndHash('well of radiance', 'dawnblade'),
  getSingleSuperNameAndHash('burning maul'),
  getSingleSuperNameAndHash('hammer of sol'),
];
const solarSuperRegex = generateGenericRegexFromObject(solarSuperObject);

// Void
const voidSuperObject = [
  getSingleSuperNameAndHash('spectral blades'),
  getSingleSuperNameAndHash('deadfall'),
  getSingleSuperNameAndHash('moebius quiver'),
  getSingleSuperNameAndHash('ward of dawn'),
  getSingleSuperNameAndHash('sentinel shield'),
  getSingleSuperNameAndHash('nova bomb: cataclysm'),
  getSingleSuperNameAndHash('nova bomb: vortex'),
  getSingleSuperNameAndHash('nova warp'),
];
const voidSuperRegex = generateGenericRegexFromObject(voidSuperObject);

// Stasis
const stasisSuperObject = [
  getSingleSuperNameAndHash('glacial quake'),
  getSingleSuperNameAndHash('silence and squall'),
  getSingleSuperNameAndHash("winter's wrath"),
];
const stasisSuperRegex = generateGenericRegexFromObject(stasisSuperObject);

// Strand
const strandSuperObject = [
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
];
const strandSuperRegex = generateGenericRegexFromObject(strandSuperObject);

// Verb Identifiers
const arcVerbs = /blind(s)?|jolt/;
const solarVerbs = /scorch(es)?/;
const voidVerbs = /suppresses/;
const stasisVerbs = /slows/;
const strandVerbs = /strand/;

// Keywords
const keywordsArc = getComposedRegex(
  arcSuperRegex,
  arcGrenades,
  arcMelees,
  arcVerbs,
  /arc (bolt|ability|soul)|ionic traces/
);

const keywordsSolar = getComposedRegex(
  solarSuperRegex,
  solarGrenades,
  solarMelees,
  solarVerbs,
  /sunspot|solar abilities|sol invictus|kni(v|f)e(s)?/
);
const keywordsVoid = getComposedRegex(
  voidSuperRegex,
  voidGrenades,
  voidMelees,
  voidVerbs,
  /smoke bomb|void-damage|devour|invisible|blink/
);
const keywordsStasis = getComposedRegex(
  stasisSuperRegex,
  stasisGrenades,
  stasisMelees,
  stasisVerbs,
  /stasis subclass/
);

// Naive attempt to catch new strand exotics on LightFall release
const keywordsStrand = getComposedRegex(
  strandSuperRegex,
  strandGrenades,
  strandMelees,
  strandVerbs,
  /strand subclass/
);

// Exclusions
const exclusionsArc = /sentinel shield/; // sentinel shield blinds ...

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

        if (
          keywordsArc.test(intrinsicTraitDescription) &&
          !exclusionsArc.test(intrinsicTraitDescription)
        ) {
          synergy.push('arc');
          damageType.push(DamageType.Arc);
          for (const sooper of arcSuperObject) {
            if (sooper.regex.test(intrinsicTraitDescription)) {
              subclass.push(sooper.hash);
              synergy.push(sooper.name);
            }
          }
        }

        if (keywordsSolar.test(intrinsicTraitDescription)) {
          damageType.push(DamageType.Thermal);
          synergy.push('solar');
          for (const sooper of solarSuperObject) {
            if (sooper.regex.test(intrinsicTraitDescription)) {
              subclass.push(sooper.hash);
              synergy.push(sooper.name);
            }
          }
        }

        if (keywordsStasis.test(intrinsicTraitDescription)) {
          damageType.push(DamageType.Stasis);
          synergy.push('stasis');
          for (const sooper of stasisSuperObject) {
            if (sooper.regex.test(intrinsicTraitDescription)) {
              subclass.push(sooper.hash);
              synergy.push(sooper.name);
            }
          }
        }

        if (keywordsVoid.test(intrinsicTraitDescription)) {
          damageType.push(DamageType.Void);
          synergy.push('void');
          for (const sooper of voidSuperObject) {
            if (sooper.regex.test(intrinsicTraitDescription)) {
              subclass.push(sooper.hash);
              synergy.push(sooper.name);
            }
          }
        }

        if (keywordsStrand.test(intrinsicTraitDescription)) {
          //damageType.push(DamageType.Strand)
          synergy.push('strand');
          for (const sooper of strandSuperObject) {
            if (sooper.regex.test(intrinsicTraitDescription)) {
              subclass.push(sooper.hash);
              synergy.push(sooper.name);
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
  writeFile('./output/exotic-synergy-debug.json', exoticSynergyDebug);
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
    regex += `|${additionalMatch}`;
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
