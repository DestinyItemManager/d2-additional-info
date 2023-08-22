import { getAllDefs, loadLocal } from '@d2api/manifest-node';
import {
  BucketCategoryLookup,
  DestinyItemSubTypeLookup,
  DestinyItemTypeLookup,
  DestinySocketCategoryStyleLookup,
} from './flipped-enums.js';
import { writeFile } from './helpers.js';

loadLocal();

const ignoreHashes = [
  3792382831, // SocketCategory "Ingredients" -- nothing corresponds to this. 322810736 is the right one
  2481496894, // SocketCategory "Recipes" -- nothing corresponds to this. 2059652296 is the right one
];

const socketCategoryDescriptionDiscriminator = ['Ikora', 'Stranger', 'Neomuna'];
const traitDiscriminators = ['Quests', 'metric'];

const generatedEnums: Record<string, Record<string, number>> = {};

const inventoryItems = getAllDefs('InventoryItem');
generatedEnums.PlugCategoryHashes = {};
inventoryItems.forEach((item) => {
  if (item.plug && !item.redacted) {
    const identifier = convertMixedStringToLeadingCapCamelCase(item.plug.plugCategoryIdentifier);
    generatedEnums.PlugCategoryHashes[identifier] = item.plug.plugCategoryHash;
  }
});

const allStats = getAllDefs('Stat');
const allItemCategories = getAllDefs('ItemCategory');
const allSocketCategories = getAllDefs('SocketCategory');
const allBuckets = getAllDefs('InventoryBucket');
const allBreakers = getAllDefs('BreakerType');
const someProgressions = getAllDefs('Progression').filter((i) => i.rankIcon);
const allTraits = getAllDefs('Trait');

const enumSources = [
  { name: 'StatHashes', data: allStats },
  { name: 'ItemCategoryHashes', data: allItemCategories },
  { name: 'SocketCategoryHashes', data: allSocketCategories },
  { name: 'BucketHashes', data: allBuckets },
  { name: 'BreakerTypeHashes', data: allBreakers },
  { name: 'ProgressionHashes', data: someProgressions },
  { name: 'TraitHashes', data: allTraits },
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

  // store duplicate named items here for tie-breaking
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

    // process later if it's a pre-identified dupe name
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

  const idToDef: { [id: string]: Data[] } = {};
  for (const thing of dupeNamedItems) {
    const id =
      convertMixedStringToLeadingCapCamelCase(thing.displayProperties.name) +
      tryToGetAdditionalStringContent(thing);
    (idToDef[id] ??= []).push(thing);
  }

  const stillDupes: { def: number; id: string }[] = [];
  for (const [identifier, defs] of Object.entries(idToDef)) {
    if (defs.length === 1) {
      generatedEnums[name][identifier] = defs[0].hash;
    } else {
      stillDupes.push(...defs.map((def) => ({ def: def.hash, id: identifier })));
    }
  }

  if (stillDupes.length) {
    console.error(`couldn't properly make unique labels for some things`);
    console.table(stillDupes);
  }
});

// Add no-name traits we can find any name for, similar to PCHs
allTraits.forEach((trait) => {
  if (trait.displayProperties.name) {
    return;
  }

  const exampleItem = inventoryItems.find((i) => i.traitHashes?.includes(trait.hash));

  if (exampleItem) {
    const traitHashIdx = exampleItem.traitHashes.indexOf(trait.hash);
    generatedEnums.TraitHashes[
      convertMixedStringToLeadingCapCamelCase(exampleItem.traitIds[traitHashIdx])
    ] = trait.hash;
  }
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
writeFile('./data/generated-enums.ts', outString);

function convertMixedStringToLeadingCapCamelCase(input: string) {
  return (
    input
      .split(/[\W_]+|(?<=[a-z])(?=[A-Z])/) // split on spaces/symbols (removing them),
      // and on the zero-width between a lowercase and uppercase letter (to preserve existing camel casing)
      .filter(Boolean) // dump empty strings
      .map((s) => s.toLowerCase())
      .map((s) => s[0].toUpperCase() + s.slice(1) ?? '')
      .join('')
  );
}

// this looks for additional information about an item, to include when its displayProperties.name isn't unique enough
// i've tried to involve enums a bunch so they are unlikely to change
function tryToGetAdditionalStringContent(thing: Data) {
  const labels: string[] = [];

  // for item categories, try using its granted types as labels
  const thingAsItemCategory = thing as typeof allItemCategories[number];
  if (thingAsItemCategory.grantDestinyItemType !== undefined) {
    if (thingAsItemCategory.grantDestinyItemType) {
      labels.push(DestinyItemTypeLookup[thingAsItemCategory.grantDestinyItemType]);
    }
    if (thingAsItemCategory.grantDestinySubType) {
      labels.push(DestinyItemSubTypeLookup[thingAsItemCategory.grantDestinySubType]);
    }
  }

  // for socket categories, try using its granted types as labels
  const thingAsSocketCategory = thing as typeof allSocketCategories[number];
  if (thingAsSocketCategory.categoryStyle !== undefined) {
    if (thingAsSocketCategory.categoryStyle) {
      labels.push(DestinySocketCategoryStyleLookup[thingAsSocketCategory.categoryStyle]);
    }

    // or try to go find an example item with this socket type, to show more info about where this socket ends up
    // currently this basically helps distinguish Ship sockets and Sparrow sockets
    const exampleItems = inventoryItems.filter((i) =>
      i.sockets?.socketCategories.find((s) => s.socketCategoryHash === thingAsSocketCategory.hash)
    );
    if (!exampleItems.length) {
      // no item actually has a socket with this socket category
      labels.push('UNUSED');
    } else {
      const itemTypes = [
        ...new Set(exampleItems.map((i) => i.itemTypeDisplayName).filter(Boolean)),
      ];
      // only use this label if all found items have the same item type
      if (itemTypes.length === 1) {
        labels.push(convertMixedStringToLeadingCapCamelCase(itemTypes[0]));
      }

      const descriptionDiscriminator = socketCategoryDescriptionDiscriminator.find((str) =>
        thing.displayProperties.description.includes(str)
      );
      // only use this label if all found items have the same item type
      if (descriptionDiscriminator) {
        labels.push(descriptionDiscriminator);
      }
    }
  }
  // for buckets, try using its category as labels
  const thingAsBucket = thing as typeof allBuckets[number];
  if (thingAsBucket.category !== undefined) {
    labels.push(BucketCategoryLookup[thingAsBucket.category]);
  }

  const thingAsTrait = thing as typeof allTraits[number];
  if (thingAsTrait.displayHint !== undefined) {
    const discriminator = traitDiscriminators.find((str) =>
      thing.displayProperties.description.includes(str)
    );
    if (discriminator) {
      labels.push(convertMixedStringToLeadingCapCamelCase(discriminator));
    }
    if (
      thingAsTrait.displayProperties.name === 'Seasonal' &&
      discriminator === 'Quests' &&
      !inventoryItems.some((item) => item.traitHashes?.includes(thingAsTrait.hash))
    ) {
      labels.push('UNUSED');
    }
  }

  if (!labels.length) {
    labels.push(`${thing.hash}`);
  }
  labels.unshift('');
  return labels.join('_');
}
