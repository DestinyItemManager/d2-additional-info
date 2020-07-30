import { getAll, loadLocal } from 'destiny2-manifest/node';
import {
  DestinyItemSubTypeLookup,
  DestinyItemTypeLookup,
  DestinySocketCategoryStyleLookup,
} from './flipped-enums';
import { uniqAndSortArray, writeFile } from './helpers';

loadLocal();

const ignoreHashes = [
  3792382831, // SocketCategory "Ingredients" -- nothing corresponds to this. 322810736 is the right one
  2481496894, // SocketCategory "Recipes" -- nothing corresponds to this. 2059652296 is the right one
];

const generatedEnums: Record<string, Record<string, number>> = {};

const inventoryItems = getAll('DestinyInventoryItemDefinition');
generatedEnums.PlugCategoryHashes = {};
inventoryItems.forEach((item) => {
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
  // our output data goes here
  generatedEnums[name] = {};

  // for keeping track temporarily of names we've seen
  const foundNames = new Set();
  // names we'll need to do more work on to create uniqueness
  const dupeNames = new Set();

  // this loop is to check item names for uniqueness
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

  // store dupenamed items here for tiebreaking
  const dupeNamedItems: Data[] = [];

  // this loop is to build output enums
  data.forEach((thing: Data) => {
    if (thing.redacted || !thing.displayProperties.name || ignoreHashes.includes(thing.hash)) {
      return;
    }
    const identifier = convertMixedStringToLeadingCapCamelCase(thing.displayProperties.name);

    // done if this enum already exists and is set correctly
    if (generatedEnums[name][identifier] === thing.hash) {
      return;
    }

    // process later if it's a preidentified dupe name
    if (dupeNames.has(identifier)) {
      dupeNamedItems.push(thing);
      return;
    }

    // it's a problem if something with the same name, points at a different hash.
    // i think this shouldn't happen due to above dupe checking
    if (generatedEnums[name][identifier] && generatedEnums[name][identifier] !== thing.hash) {
      console.error(`multiple ${name} named ${identifier}`);
      return;
    }

    // if we made it here, set that enum
    generatedEnums[name][identifier] = thing.hash;
  });

  // now deal with dupes
  const deDupedIdentifiers = dupeNamedItems.map(
    (thing: Data) =>
      convertMixedStringToLeadingCapCamelCase(thing.displayProperties.name) +
      tryToGetAdditionalStringContent(thing)
  );
  // if generated names aren't all unique, idk what to do yet
  if (uniqAndSortArray(deDupedIdentifiers).length !== deDupedIdentifiers.length) {
    console.error(`couldn't properly make unique labels for ${deDupedIdentifiers}`);
    return;
  }
  // if we made it here, the dupes all generated different strings
  dupeNamedItems.forEach((thing: Data) => {
    const identifier =
      convertMixedStringToLeadingCapCamelCase(thing.displayProperties.name) +
      tryToGetAdditionalStringContent(thing);
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

// this looks for additional information about an item, to include when its displayProperties.name isn't unique enough
// i've tried to involve enums a bunch so they are unlikely to change
function tryToGetAdditionalStringContent(thing: Data) {
  const strs: string[] = [];

  // for item categories, try using its granted types as labels
  const thingAsItemCategory = thing as typeof allItemCategories[number];
  if (thingAsItemCategory.grantDestinyItemType !== undefined) {
    if (thingAsItemCategory.grantDestinyItemType) {
      strs.push(DestinyItemTypeLookup[thingAsItemCategory.grantDestinyItemType]);
    }
    if (thingAsItemCategory.grantDestinySubType) {
      strs.push(DestinyItemSubTypeLookup[thingAsItemCategory.grantDestinySubType]);
    }
  }
  // for socket categories, try using its granted types as labels
  const thingAsSocketCategory = thing as typeof allSocketCategories[number];
  if (thingAsSocketCategory.categoryStyle !== undefined) {
    if (thingAsSocketCategory.categoryStyle) {
      strs.push(DestinySocketCategoryStyleLookup[thingAsSocketCategory.categoryStyle]);
    }

    // or try to go find an example item with this socket type, to show more info about where this socket ends up
    // currently this basically helps distinguish Ship sockets and Sparrow sockets
    const exampleItems = inventoryItems.filter((i) =>
      i.sockets?.socketCategories.find((s) => s.socketCategoryHash === thingAsSocketCategory.hash)
    );
    if (!exampleItems.length) {
      // no item actually has a socket with this socket category
      strs.push('UNUSED');
    } else {
      const itemTypes = [
        ...new Set(exampleItems.map((i) => i.itemTypeDisplayName).filter(Boolean)),
      ];
      // only use this label if all found items have the same item type
      if (itemTypes.length === 1) {
        strs.push(convertMixedStringToLeadingCapCamelCase(itemTypes[0]));
      }
    }
  }
  if (!strs.length) {
    strs.push(`${thing.hash}`);
  }
  strs.unshift('');
  return strs.join('_');
}
