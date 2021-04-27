import { get, getAll, loadLocal } from '@d2api/manifest/node';
import stringifyObject from 'stringify-object';
import { ItemCategoryHashes } from '../data/generated-enums';
import categories_ from '../data/sources/categories.json';
import { annotate, sortObject, uniqAndSortArray, writeFile } from './helpers';

const categories: Categories = categories_;
interface Categories {
  sources: Record<
    string, // a sourceTag. i.e. "adventures" or "deadorbit" or "zavala" or "crucible"
    {
      /**
       * list of strings. if a sourceString contains one of these,
       * it probably refers to this sourceTag
       */
      includes: string[];
      /**
       * list of strings. if a sourceString contains one of these,
       * it doesn't refer to this sourceTag
       */
      excludes?: string[];
      /** list of english item names or inventoryItem hashes */
      items?: (string | number)[];
      /** duplicate this category into another sourceTag */
      alias?: string;
      /**
       * presentationNodes can contain a set of items (Collections).
       * we'll find presentation nodes by name or hash,
       * and include their children in this source
       */
      presentationNodes?: (string | number)[];
      searchString?: string;
    }
  >;
  /** i don't really remember why this exists */
  exceptions: string[][];
}

// get the manifest data ready
loadLocal();

const allInventoryItems = getAll('DestinyInventoryItemDefinition');
const allCollectibles = getAll('DestinyCollectibleDefinition');
const allPresentationNodes = getAll('DestinyPresentationNodeDefinition');

/**
 * this is just a hash-to-sourceString conversion table,
 * since none exists
 */
const sourceStringsByHash: Record<number, string> = {};
const unassignedSourceStringsByHash: Record<number, string> = {};
const allSources: number[] = [];
const assignedSources: number[] = [];
let unassignedSources: number[] = [];

for (const collectible of allCollectibles) {
  const hash = collectible.sourceHash;
  const sourceName = collectible.sourceString
    ? collectible.sourceString
    : collectible.displayProperties.description;
  if (hash) {
    // Only add sources that have an existing hash (eg. no classified items)
    sourceStringsByHash[hash] = sourceName;
    allSources.push(hash);
  }
}

writeFile('./output/sources.json', sourceStringsByHash);

const sourcesInfo: Record<number, string> = {};
const D2Sources: Record<
  string,
  {
    itemHashes: number[];
    sourceHashes: number[];
    searchString: string;
  }
> = {};

// sourcesInfo built from manifest collectibles
for (const collectible of allCollectibles) {
  if (collectible.sourceHash) {
    sourcesInfo[collectible.sourceHash] = collectible.sourceString;
  }
}

// add any manual source strings from categories.json
for (const [sourceHash, sourceString] of categories.exceptions) {
  sourcesInfo[Number(sourceHash)] = sourceString;
}

// loop through categorization rules
for (const [sourceTag, matchRule] of Object.entries(categories.sources)) {
  // string match this category's source descriptions
  const sourceHashes = applySourceStringRules(sourcesInfo, matchRule);
  assignedSources.push(...sourceHashes);
  let searchString = '';
  if (matchRule.searchString) {
    searchString = matchRule.searchString;
  }

  // worth noting if one of our rules has become defunct
  if (!sourceHashes.length) {
    console.log(`no matching sources for ${sourceTag}:`);
    console.log(matchRule);
  }

  // item hashes which correspond to this sourceTag
  let itemHashes: number[] = [];

  // find any specified individual items by name,
  // and add their hashes
  if (matchRule.items) {
    for (const itemNameOrHash of matchRule.items) {
      const includedItemHashes = allInventoryItems
        .filter(
          (i) =>
            !i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies) &&
            !i.itemCategoryHashes?.includes(ItemCategoryHashes.QuestStep) &&
            (itemNameOrHash === String(i.hash) || i.displayProperties?.name === itemNameOrHash)
        )
        .map((i) => i.hash);
      itemHashes.push(...includedItemHashes);
    }
  }

  // if any presentation nodes name or hashes are provided,
  // get the equipment they encompass, and add them
  if (matchRule.presentationNodes) {
    const foundPresentationNodes = allPresentationNodes.filter(
      (p) =>
        matchRule.presentationNodes?.includes(p.hash) ||
        matchRule.presentationNodes?.includes(p.displayProperties?.name)
    );
    for (const foundPresentationNode of foundPresentationNodes) {
      for (const collectible of foundPresentationNode.children.collectibles) {
        const childItemHash = get('DestinyCollectibleDefinition', collectible.collectibleHash)
          ?.itemHash;
        childItemHash && itemHashes.push(childItemHash);
      }
    }
  }

  // sort and uniq this after adding all elements
  itemHashes = uniqAndSortArray(itemHashes);

  // drop our results into the output table
  D2Sources[sourceTag] = {
    itemHashes,
    sourceHashes,
    searchString,
  };

  // lastly add aliases and copy info
  const alias = matchRule.alias;
  if (alias) {
    D2Sources[alias] = D2Sources[sourceTag];
  }
}

// removed ignored sources
delete D2Sources['ignore'];

// sort the object after adding in the aliases
const D2SourcesSorted = sortObject(D2Sources);
const D2SourcesStringified = stringifyObject(D2SourcesSorted, {
  indent: '  ',
});

const pretty = `const D2Sources: { [key: string]: { itemHashes: number[]; sourceHashes: number[]; searchString: string } } = ${D2SourcesStringified};\n\nexport default D2Sources;`;

// annotate the file with sources or item names next to matching hashes
const annotated = annotate(pretty, sourcesInfo);

writeFile('./output/source-info.ts', annotated);

unassignedSources = allSources.filter((x) => !assignedSources.includes(x));

unassignedSources.forEach((hash) => {
  const source = allCollectibles.find((c) => c.sourceHash === hash);
  const sourceName = source?.sourceString
    ? source.sourceString
    : source?.displayProperties.description ?? '';

  unassignedSourceStringsByHash[hash] = sourceName;
});

writeFile('./data/sources/unassigned.json', unassignedSourceStringsByHash);

/**
 * checks for sourceStringRules matches among the haystack's values,
 * and returns the keys of matched values.
 * this outputs a list of sourceHashes
 */
export function applySourceStringRules(
  haystack: typeof sourcesInfo,
  sourceStringRules: Categories['sources'][string]
): number[] {
  const { includes, excludes } = sourceStringRules;

  return (
    Object.entries(haystack)
      // filter down to only search results that match these sourceStringRules
      .filter(
        ([, sourceString]) =>
          // do inclusion strings match this sourceString?
          includes?.filter((searchTerm) =>
            sourceString.toLowerCase().includes(searchTerm.toLowerCase())
          ).length &&
          // not any excludes or not any exclude matches
          !(
            // do exclusion strings match this sourceString?
            excludes?.filter((searchTerm) =>
              sourceString.toLowerCase().includes(searchTerm.toLowerCase())
            ).length
          )
      )
      // keep the sourceHash and discard the sourceString.
      // convert them back from object keys (strings) to numbers.
      .map(([sourceHash]) => Number(sourceHash))
  );
}
