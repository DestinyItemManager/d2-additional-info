import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { DamageType, DestinyClass } from 'bungie-api-ts/destiny2/interfaces.js';
import { writeFile } from './helpers.js';

loadLocal();

const debug = true;
const inventoryItems = getAll('DestinyInventoryItemDefinition');
const exoticSynergy = {} as Record<number, string[]>;
const exoticSynergyV2 = {} as Record<
  number,
  { synergy: string[]; subclass: number[]; damageType: number[] }
>;
const getComposedRegex = (...regexes: RegExp[]) =>
  new RegExp(regexes.map((regex) => regex.source).join('|'));

const arcSupers = generateRegexForSuper(DamageType.Arc);
const solarSupers = generateRegexForSuper(DamageType.Thermal);
const voidSupers = generateRegexForSuper(DamageType.Void);
const stasisSupers = generateRegexForSuper(DamageType.Stasis);
const strandSupers = /*generateRegexForSuper(DamageType.Strand); */ /architect|threadrunner|tyrant/;

const arcGrenades = generateRegexByItemTypeDisplayName('Arc Grenade');
const solarGrenades = generateRegexByItemTypeDisplayName('Solar Grenade');
const voidGrenades = generateRegexByItemTypeDisplayName('Void Grenade');
const stasisGrenades = generateRegexByItemTypeDisplayName('Stasis Grenade');
const strandGrenades =
  /*generateRegexByItemTypeDisplayName('Strand Grenade');*/ /strand grenade(s)?/;

const arcMelees = generateRegexByItemTypeDisplayName('Arc Melee');
const solarMelees = generateRegexByItemTypeDisplayName('Solar Melee');
const voidMelees = generateRegexByItemTypeDisplayName('Void Melee');
const stasisMelees = generateRegexByItemTypeDisplayName('Stasis Melee');
const strandMelees = /*generateRegexByItemTypeDisplayName('Strand Melee');*/ /strand melee(s)?/;

// Super Identifiers
// Arc
const arcStaff = getSingleSuperNameAndHash('arc staff');
arcStaff.regex = getComposedRegex(arcStaff.regex, /whirlwind guard/);

const arcSuperRegex = [
  getSingleSuperNameAndHash('fists of havoc'),
  getSingleSuperNameAndHash('thundercrash'),
  getSingleSuperNameAndHash('stormtrance'),
  getSingleSuperNameAndHash('chaos reach'),
  arcStaff,
  getSingleSuperNameAndHash('gathering storm'),
];

// Solar
const daybreak = getSingleSuperNameAndHash('daybreak');
daybreak.regex = getComposedRegex(daybreak.regex, /dawnblade/);

const wellOfRadiance = getSingleSuperNameAndHash('well of radiance');
wellOfRadiance.regex = getComposedRegex(wellOfRadiance.regex, /dawnblade/);

const solarSuperRegex = [
  getSingleSuperNameAndHash('golden gun - marksman'),
  getSingleSuperNameAndHash('golden gun - deadshot'),
  getSingleSuperNameAndHash('blade barrage'),
  daybreak,
  wellOfRadiance,
  getSingleSuperNameAndHash('burning maul'),
  getSingleSuperNameAndHash('hammer of sol'),
];

// Void
const voidSuperRegex = [
  getSingleSuperNameAndHash('spectral blades'),
  getSingleSuperNameAndHash('deadfall'),
  getSingleSuperNameAndHash('moebius quiver'),
  getSingleSuperNameAndHash('ward of dawn'),
  getSingleSuperNameAndHash('sentinel shield'),
  getSingleSuperNameAndHash('nova bomb: cataclysm'),
  getSingleSuperNameAndHash('nova bomb: vortex'),
  getSingleSuperNameAndHash('nova warp'),
];

// Stasis
const stasisSuperRegex = [
  getSingleSuperNameAndHash('glacial quake'),
  getSingleSuperNameAndHash('silence and squall'),
  getSingleSuperNameAndHash("winter's wrath"),
];

// Strand
const strandSuperRegex = [
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

const arcVerbs = /blind(s)?|jolt/;
const solarVerbs = /scorch(es)?/;
const voidVerbs = /suppresses/;
const stasisVerbs = /slows/;
const strandVerbs = /strand/;

// Keywords
const keywordsArc = getComposedRegex(
  arcSupers,
  arcGrenades,
  arcMelees,
  arcVerbs,
  /whirlwind guard|arc (bolt|ability|soul)|ionic traces/
);

const keywordsSolar = getComposedRegex(
  solarSupers,
  solarGrenades,
  solarMelees,
  solarVerbs,
  /dawnblade|sunspot|solar abilities|sol invictus|kni(v|f)e(s)?/
);
const keywordsVoid = getComposedRegex(
  voidSupers,
  voidGrenades,
  voidMelees,
  voidVerbs,
  /smoke bomb|void-damage|devour|invisible|blink/
);
const keywordsStasis = getComposedRegex(
  stasisSupers,
  stasisGrenades,
  stasisMelees,
  stasisVerbs,
  /stasis subclass/
);

// Naive attempt to catch new exotics on LightFall release
const keywordsStrand = getComposedRegex(
  strandSupers,
  strandGrenades,
  strandMelees,
  strandVerbs,
  /strand/
);

console.log(keywordsStrand);
// Exclusions
const exclusionsArc = /sentinel shield/; // sentinel shield blinds ...

// Debug Table
const synergies = [] as string[];
synergies[DestinyClass.Titan] = setTableInfo('Titan');
synergies[DestinyClass.Hunter] = setTableInfo('Hunter');
synergies[DestinyClass.Warlock] = setTableInfo('Warlock');

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
          for (const sooper of arcSuperRegex) {
            if (sooper.regex.test(intrinsicTraitDescription)) {
              subclass.push(sooper.hash);
              synergy.push(sooper.name);
            }
          }
        }

        if (keywordsSolar.test(intrinsicTraitDescription)) {
          damageType.push(DamageType.Thermal);
          synergy.push('solar');
          for (const sooper of solarSuperRegex) {
            if (sooper.regex.test(intrinsicTraitDescription)) {
              subclass.push(sooper.hash);
              synergy.push(sooper.name);
            }
          }
        }

        if (keywordsStasis.test(intrinsicTraitDescription)) {
          damageType.push(DamageType.Stasis);
          synergy.push('stasis');
          for (const sooper of stasisSuperRegex) {
            if (sooper.regex.test(intrinsicTraitDescription)) {
              subclass.push(sooper.hash);
              synergy.push(sooper.name);
            }
          }
        }

        if (keywordsVoid.test(intrinsicTraitDescription)) {
          damageType.push(DamageType.Void);
          synergy.push('void');
          for (const sooper of voidSuperRegex) {
            if (sooper.regex.test(intrinsicTraitDescription)) {
              subclass.push(sooper.hash);
              synergy.push(sooper.name);
            }
          }
        }

        if (keywordsStrand.test(intrinsicTraitDescription)) {
          synergy.push('strand'); // DamageType.Strand);
          for (const sooper of strandSuperRegex) {
            if (sooper.regex.test(intrinsicTraitDescription)) {
              subclass.push(sooper.hash);
              synergy.push(sooper.name);
            }
          }
        }

        if (debug) {
          synergies[item.classType] += `|${item.displayProperties.name}|${synergy}|\n`;
        }
        exoticSynergy[item.hash] = synergy;
        exoticSynergyV2[item.hash] = { synergy, damageType, subclass };
      }
    })
);

if (debug) {
  synergies.forEach((synergyList) => console.log(synergyList));
}

writeFile('./output/exotic-synergy.json', exoticSynergy);
writeFile('./output/exotic-synergy-v2.json', exoticSynergyV2);

function setTableInfo(subclass: string) {
  return `|${subclass} Armor|Synergies|\n|---|---|\n`;
}

function generateRegexForSuper(damageType: DamageType) {
  return RegExp(
    inventoryItems
      .filter(
        (item) =>
          item.itemTypeDisplayName === 'Super Ability' &&
          item.talentGrid?.hudDamageType === damageType
      )
      .map((i) => i.displayProperties.name.toLowerCase().replace(/ - /g, '|'))
      .join('|')
      .replace(/\|\|/g, '|')
  );
}

function generateRegexByItemTypeDisplayName(itemTypeDisplayName: string) {
  return RegExp(
    `${inventoryItems
      .filter((item) => item.itemTypeDisplayName === itemTypeDisplayName)
      .map((i) => i.displayProperties.name.toLowerCase())
      .join('|')}|${itemTypeDisplayName.toLowerCase()}(s)?`
  );
}

function getSingleSuperNameAndHash(itemName: string) {
  const item = inventoryItems.find(
    (item) =>
      item.itemTypeDisplayName === 'Super Ability' &&
      item.displayProperties.name.toLowerCase().includes(itemName.toLowerCase())
  );
  const name = item?.displayProperties.name.toLowerCase() ?? '';
  const hash = item?.hash ?? 0;
  const regex = RegExp(name.replace(/ - /g, '|').replace(': ', '|'));
  return { name, hash, regex };
}
