import { getAll, loadLocal } from '@d2api/manifest/node';
import stringifyObject from 'stringify-object';
import _categories from '../data/sources/categories.json';
import { sortObject, writeFile } from './helpers';
import { annotate, uniqAndSortArray } from './helpers.js';

interface Categories {
  sources: Record<
    string,
    {
      includes: string[];
      excludes?: string[];
      items?: string[];
      alias?: string;
    }
  >;
  exceptions: number[];
}
const categories: Categories = _categories;

loadLocal();
const inventoryItems = getAll('DestinyInventoryItemDefinition');
const collectibles = getAll('DestinyCollectibleDefinition');

const hashToMissingCollectibleHash: Record<string, number> = {};

// Every Inventory Item without a collectible hash
const nonCollectibleItems = inventoryItems.filter((item) => !item.collectibleHash);

// Every Inventory Item with a collectible hash
const collectibleItems = inventoryItems.filter((item) => item.collectibleHash);

collectibleItems.forEach((collectibleItem) => {
  const itemsWithSameName = nonCollectibleItems.filter(
    (nonCollectibleItem) =>
      collectibleItem.displayProperties.name === nonCollectibleItem.displayProperties.name &&
      stringifySortCompare(
        collectibleItem.itemCategoryHashes ?? [],
        nonCollectibleItem.itemCategoryHashes ?? []
      )
  );

  itemsWithSameName.forEach((nonCollectibleItem) => {
    collectibles.filter((collectible) => {
      if (collectibleItem.collectibleHash === collectible.hash && collectible.sourceHash) {
        hashToMissingCollectibleHash[nonCollectibleItem.hash] = collectible.sourceHash;
      }
    });
  });
});

const sourcesInfo: Record<number, string> = {};
const D2Sources: Record<string, number[]> = {}; // converts search field short source tags to item & source hashes
const newSourceInfo: Record<string, number[]> = {};

// sourcesInfo built from manifest collectibles
collectibles.forEach((collectible) => {
  if (collectible.sourceHash) {
    sourcesInfo[collectible.sourceHash] = collectible.sourceString;
  }
});

// loop through categorization rules
Object.entries(categories.sources).forEach(([sourceTag, matchRule]) => {
  // string match this category's source descriptions
  D2Sources[sourceTag] = objectSearchValues(sourcesInfo, matchRule);

  if (!D2Sources[sourceTag].length) {
    console.log(`no matching sources for: ${matchRule}`);
  }

  Object.entries(hashToMissingCollectibleHash).forEach(([hash, sourceHash]) => {
    Object.entries(D2Sources).forEach(([sourceTag, sourceHashes]) => {
      if (sourceHashes.includes(Number(sourceHash))) {
        newSourceInfo[sourceTag] = newSourceInfo[sourceTag] ?? [];
        newSourceInfo[sourceTag].push(Number(hash));
      }
      newSourceInfo[sourceTag] = uniqAndSortArray(newSourceInfo[sourceTag]);
    });
  });

  // lastly add aliases and copy info
  const alias = categories.sources[sourceTag].alias;
  if (alias) {
    newSourceInfo[alias] = newSourceInfo[sourceTag];
  }
});

// sort the object after adding in the aliases
const D2SourcesSorted = sortObject(newSourceInfo);

const pretty = `const missingSources: { [key: string]: number[] } = ${stringifyObject(
  D2SourcesSorted,
  {
    indent: '  ',
  }
)};\n\nexport default missingSources;`;

// annotate the file with sources or item names next to matching hashes
const annotated = annotate(pretty, sourcesInfo);

writeFile('./output/missing-source-info.ts', annotated);

// searches haystack (collected manifest source strings) to match against needleInfo (a categories.json match rule)
// returns a list of source hashes
export function objectSearchValues(
  haystack: Record<number, string>,
  needleInfo: Categories['sources'][string]
) {
  let searchResults = Object.entries(haystack); // [[hash, string],[hash, string],[hash, string]]

  // filter down to only search results that match conditions
  searchResults = searchResults.filter(
    ([, sourceString]) =>
      // do inclusion strings match this sourceString?
      needleInfo.includes?.filter((searchTerm) =>
        sourceString.toLowerCase().includes(searchTerm.toLowerCase())
      ).length &&
      // not any excludes or not any exclude matches
      !(
        // do exclusion strings match this sourceString?
        needleInfo.excludes?.filter((searchTerm) =>
          sourceString.toLowerCase().includes(searchTerm.toLowerCase())
        ).length
      )
  );
  // extracts key 0 (sourcehash) from searchResults
  return [...new Set(searchResults.map((result) => Number(result[0])))];
}

function stringifySort(arr: number[]) {
  return JSON.stringify(arr.sort());
}

function stringifySortCompare(arr1: number[], arr2: number[]) {
  return stringifySort(arr1) === stringifySort(arr2);
}
