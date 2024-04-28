import { getAllDefs, getDef } from '@d2api/manifest-node';
import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2';
import stringifyObject from 'stringify-object';
import _categories from '../data/sources/categories.json' assert { type: 'json' };
import {
  annotate,
  applySourceStringRules,
  Categories,
  sortObject,
  uniqAndSortArray,
  writeFile,
} from './helpers.js';

const categories: Categories = _categories;

const inventoryItems = getAllDefs('InventoryItem');
const collectibles = getAllDefs('Collectible');

const hashToMissingCollectibleHash: Record<string, number> = {};

// Every Inventory Item without a collectible hash
const nonCollectibleItemsByName: { [name: string]: DestinyInventoryItemDefinition[] } = {};
for (const item of inventoryItems) {
  if (item.displayProperties.name && !item.collectibleHash) {
    (nonCollectibleItemsByName[item.displayProperties.name] ??= []).push(item);
  }
}

// Every Inventory Item with a collectible hash
const collectibleItems = inventoryItems.filter((item) => item.collectibleHash);

collectibleItems.forEach((collectibleItem) => {
  if (!collectibleItem.displayProperties?.name) {
    return;
  }
  const itemsWithSameName =
    nonCollectibleItemsByName[collectibleItem.displayProperties.name]?.filter(
      (nonCollectibleItem) =>
        stringifySortCompare(
          collectibleItem.itemCategoryHashes ?? [],
          nonCollectibleItem.itemCategoryHashes ?? [],
        ),
    ) ?? [];

  itemsWithSameName.forEach((nonCollectibleItem) => {
    const collectibleDef = getDef('Collectible', collectibleItem.collectibleHash);
    if (collectibleDef?.sourceHash) {
      hashToMissingCollectibleHash[nonCollectibleItem.hash] = collectibleDef.sourceHash;
    }
  });
});

const sourcesInfo: Record<number, string> = {};
const D2Sources: Record<string, number[]> = {}; // converts search field short source tags to item & source hashes
const newSourceInfo: Record<string, number[]> = {}; // DEPRECATED

// sourcesInfo built from manifest collectibles
collectibles.forEach((collectible) => {
  if (collectible.sourceHash) {
    sourcesInfo[collectible.sourceHash] = collectible.sourceString;
  }
});

// loop through categorization rules
Object.entries(categories.sources).forEach(([sourceTag, matchRule]) => {
  if (sourceTag === 'ignore') {
    return;
  }
  // string match this category's source descriptions
  D2Sources[sourceTag] = applySourceStringRules(sourcesInfo, matchRule);

  if (!D2Sources[sourceTag].length && !sourceTag.includes('shatteredthrone')) {
    console.log(`no matching sources for: ${matchRule}`);
  }
});

Object.entries(D2Sources).forEach(([sourceTag, sourceHashes]) => {
  Object.entries(hashToMissingCollectibleHash).forEach(([hash, sourceHash]) => {
    if (sourceHashes.includes(Number(sourceHash))) {
      (newSourceInfo[sourceTag] ??= []).push(Number(hash));
    }
  });
  newSourceInfo[sourceTag] = uniqAndSortArray(newSourceInfo[sourceTag]);
});

// lastly add aliases and copy info
Object.keys(categories.sources).forEach((sourceTag) => {
  if (sourceTag === 'ignore') {
    return;
  }
  const aliases = categories.sources[sourceTag].alias;
  if (aliases) {
    aliases.forEach((alias) => {
      newSourceInfo[alias] = newSourceInfo[sourceTag];
    });
  }
});

for (const sourceTag of Object.keys(newSourceInfo)) {
  if (newSourceInfo[sourceTag].length === 0) {
    delete newSourceInfo[sourceTag];
  }
}

// sort the object after adding in the aliases
const D2SourcesSorted = sortObject(newSourceInfo);

const pretty = `const missingSources: { [key: string]: number[] } = ${stringifyObject(
  D2SourcesSorted,
  {
    indent: '  ',
  },
)};\n\nexport default missingSources;`;

// annotate the file with sources or item names next to matching hashes
const annotated = annotate(pretty, sourcesInfo);

writeFile('./output/missing-source-info.ts', annotated);

function stringifySort(arr: number[]) {
  return JSON.stringify(arr.sort());
}

function stringifySortCompare(arr1: number[], arr2: number[]) {
  return stringifySort(arr1) === stringifySort(arr2);
}
