import { getAll, loadLocal } from 'destiny2-manifest/node';

// import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2';
import { writeFile } from './helpers';
// import { D2CalculatedSeason } from '../data/seasons/d2-season-info';
// import stringifyObject from 'stringify-object';

loadLocal();

const generatedEnums: Record<string, Record<string, number>> = {};

generatedEnums.PlugCategoryHashes = {};
getAll('DestinyInventoryItemDefinition').forEach((item) => {
  if (item.plug && !item.redacted) {
    const identifier = item.plug.plugCategoryIdentifier
      .toLowerCase()
      .split(/\W+/)
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join('');
    generatedEnums.PlugCategoryHashes[identifier] = item.plug.plugCategoryHash;
  }
});

generatedEnums.StatHashes = {};
getAll('DestinyStatDefinition').forEach((stat) => {
  if (stat.redacted || !stat.displayProperties.name) {
    return;
  }
  const identifier = stat.displayProperties.name
    .toLowerCase()
    .split(/\W+/)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join('');
  generatedEnums.StatHashes[identifier] = stat.hash;
});

generatedEnums.ItemCategoryHashes = {};
getAll('DestinyItemCategoryDefinition').forEach((category) => {
  if (category.redacted || !category.displayProperties.name) {
    return;
  }
  const identifier = category.displayProperties.name
    .toLowerCase()
    .split(/\W+/)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join('');
  generatedEnums.ItemCategoryHashes[identifier] = category.hash;
});

generatedEnums.SocketCategoryHashes = {};
getAll('DestinySocketCategoryDefinition').forEach((category) => {
  if (category.redacted || !category.displayProperties.name) {
    return;
  }
  const identifier = category.displayProperties.name
    .toLowerCase()
    .split(/\W+/)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join('');
  generatedEnums.SocketCategoryHashes[identifier] = category.hash;
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
// export const enum VendorDropType {
//   NoData = 0,
//   DroppingLow = 1,
//   DroppingHigh = 2,
// }
