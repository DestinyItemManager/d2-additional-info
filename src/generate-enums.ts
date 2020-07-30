import { getAll, loadLocal } from 'destiny2-manifest/node';
import {
  DestinyItemSubTypeLookup,
  DestinyItemTypeLookup,
  DestinySocketCategoryStyleLookup,
} from './flipped-enums';

// import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2';
import { writeFile } from './helpers';
// import { D2CalculatedSeason } from '../data/seasons/d2-season-info';
// import stringifyObject from 'stringify-object';

loadLocal();

const ignoreHashes = [
  3792382831, // SocketCategory "Ingredients" -- nothing corresponds to this. 322810736 is the right one
  2481496894, // SocketCategory "Recipes" -- nothing corresponds to this. 2059652296 is the right one
];

const generatedEnums: Record<string, Record<string, number>> = {};

generatedEnums.PlugCategoryHashes = {};
getAll('DestinyInventoryItemDefinition').forEach((item) => {
  if (item.plug && !item.redacted) {
    const identifier = convertMixedStringToLeadingCapCamelCase(item.plug.plugCategoryIdentifier);

    generatedEnums.PlugCategoryHashes[identifier] = item.plug.plugCategoryHash;
  }
});

const allStats = getAll('DestinyStatDefinition');
const allItemCategories = getAll('DestinyItemCategoryDefinition');
const allSocketCategories = getAll('DestinySocketCategoryDefinition');

const enumSources = [
  { name: 'StatHashes', data: allStats },
  { name: 'ItemCategoryHashes', data: allItemCategories },
  { name: 'SocketCategoryHashes', data: allSocketCategories },
];
type Data = typeof enumSources[number]['data'][number];

enumSources.forEach(({ name, data }) => {
  generatedEnums[name] = {};
  const dupeNames = new Set();
  const foundNames = new Set();
  data.forEach((thing: Data) => {
    if (thing.redacted || !thing.displayProperties.name || ignoreHashes.includes(thing.hash)) {
      return;
    }

    const identifier = convertMixedStringToLeadingCapCamelCase(thing.displayProperties.name);
    if (foundNames.has(identifier)) {
      dupeNames.add(identifier);
    }
    foundNames.add(identifier);
  });
  console.log(dupeNames);

  data.forEach((thing: Data) => {
    if (thing.redacted || !thing.displayProperties.name || ignoreHashes.includes(thing.hash)) {
      return;
    }
    let identifier = convertMixedStringToLeadingCapCamelCase(thing.displayProperties.name);
    if (dupeNames.has(identifier)) {
      identifier += tryToGetAdditionalStringContent(thing);
    }
    if (generatedEnums[name][identifier] === thing.hash) {
      return;
    }
    if (generatedEnums[name][identifier] && generatedEnums[name][identifier] !== thing.hash) {
      console.error(`multiple ${name} named ${identifier}`);
      return;
    }
    generatedEnums[name][identifier] = thing.hash;
  });
});

// enum format
const outString = Object.entries(generatedEnums)
  .map(
    ([enumName, enumValues]) =>
      `export const enum ${enumName} {${Object.entries(enumValues)
        .map(([label, value]) => `${label} = ${value},`)
        .sort()
        .join('\n')}}`
  )
  .join('\n\n');
writeFile('./output/generated-enums.ts', outString);

function convertMixedStringToLeadingCapCamelCase(input: string) {
  return input
    .toLowerCase()
    .split(/[\W_]+/)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join('');
}

function tryToGetAdditionalStringContent(thing: Data) {
  const strs: string[] = [];

  // for categories, try using its granted types as labels
  const thingAsItemCategory = thing as typeof allItemCategories[number];
  if (thingAsItemCategory.grantDestinyItemType !== undefined) {
    if (thingAsItemCategory.grantDestinyItemType) {
      strs.push(DestinyItemTypeLookup[thingAsItemCategory.grantDestinyItemType]);
    }
    if (thingAsItemCategory.grantDestinySubType) {
      strs.push(DestinyItemSubTypeLookup[thingAsItemCategory.grantDestinySubType]);
    }
  }
  // for categories, try using its granted types as labels
  const thingAsSocketCategory = thing as typeof allSocketCategories[number];
  if (thingAsSocketCategory.categoryStyle !== undefined) {
    if (thingAsSocketCategory.categoryStyle) {
      strs.push(DestinySocketCategoryStyleLookup[thingAsSocketCategory.categoryStyle]);
    }
  }
  if (!strs.length) {
    strs.push(`${thing.hash}`);
  }
  strs.unshift('');
  return strs.join('_');
}
