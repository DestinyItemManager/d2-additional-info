import { getAllDefs, getDef } from '@d2api/manifest-node';
import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2';
import categories_ from 'data/sources/categories.json' assert { type: 'json' };
import stringifyObject from 'stringify-object';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import {
  annotate,
  applySourceStringRules,
  Categories,
  sortObject,
  uniqAndSortArray,
  writeFile,
} from './helpers.js';
const categories: Categories = categories_;

// get the manifest data ready
const allInventoryItems = getAllDefs('InventoryItem');
const allCollectibles = getAllDefs('Collectible');
const allPresentationNodes = getAllDefs('PresentationNode');

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

const hashToMissingCollectibleHash: Record<string, number> = {};

// Every Inventory Item without a collectible hash
const nonCollectibleItemsByName: { [name: string]: DestinyInventoryItemDefinition[] } = {};
for (const item of allInventoryItems) {
  if (item.displayProperties.name && !item.collectibleHash) {
    (nonCollectibleItemsByName[item.displayProperties.name] ??= []).push(item);
  }
}

// Every Inventory Item with a collectible hash
const collectibleItems = allInventoryItems.filter((item) => item.collectibleHash);

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
const D2Sources: Record<
  // DEPRECATED
  string,
  {
    itemHashes: number[];
    sourceHashes: number[];
    searchString: string[];
  }
> = {};

const D2SourcesV2: Record<
  string,
  {
    itemHashes?: number[];
    sourceHashes?: number[];
    aliases?: string[];
    missingSource?: number[];
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
  let searchString: string[] = [];
  let missingSources: number[] = [];
  if (matchRule.searchString) {
    searchString = [...matchRule.searchString];
  }

  // worth noting if one of our rules has become defunct
  if (!sourceHashes.length && !sourceTag.includes('shatteredthrone')) {
    console.log(`no matching sources for ${sourceTag}:`);
    console.log(matchRule);
  }

  Object.entries(D2Sources).forEach(([sourceTag, sourceAttrs]) => {
    Object.entries(hashToMissingCollectibleHash).forEach(([hash, sourceHash]) => {
      if (sourceHashes.includes(Number(sourceHash))) {
        missingSources.push(Number(hash));
        //(sourcesInfo[sourceTag] ??= []).push(Number(hash));
      }
    });
    //newSourceInfo[sourceTag] = uniqAndSortArray(newSourceInfo[sourceTag]);
  });

  // item hashes which correspond to this sourceTag
  let itemHashes: number[] = [];

  // find any specified individual items by name,
  // and add their hashes
  if (matchRule.items) {
    for (const itemNameOrHash of matchRule.items) {
      const includedItemHashes = allInventoryItems
        .filter(
          (i) =>
            (!i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies) &&
              !i.itemCategoryHashes?.includes(ItemCategoryHashes.QuestStep) &&
              !i.itemCategoryHashes?.includes(ItemCategoryHashes.Patterns) &&
              itemNameOrHash === String(i.hash)) ||
            (i.displayProperties?.name === itemNameOrHash &&
              (i.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) ||
                i.itemCategoryHashes?.includes(ItemCategoryHashes.Armor) ||
                i.itemCategoryHashes?.includes(ItemCategoryHashes.Ghost) ||
                i.itemCategoryHashes?.includes(ItemCategoryHashes.Shaders) ||
                i.itemCategoryHashes?.includes(ItemCategoryHashes.Emblems) ||
                i.itemCategoryHashes?.includes(ItemCategoryHashes.Ships) ||
                i.itemCategoryHashes?.includes(ItemCategoryHashes.Mods_Ornament) ||
                i.itemCategoryHashes?.includes(ItemCategoryHashes.Sparrows))),
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
        matchRule.presentationNodes?.includes(p.displayProperties?.name),
    );
    for (const foundPresentationNode of foundPresentationNodes) {
      for (const collectible of foundPresentationNode.children.collectibles) {
        const childItemHash = getDef('Collectible', collectible.collectibleHash)?.itemHash;
        childItemHash && itemHashes.push(childItemHash);
      }
    }
  }

  // sort and uniq this after adding all elements
  itemHashes = uniqAndSortArray(itemHashes);
  missingSources = uniqAndSortArray(missingSources);
  const aliases = matchRule.alias || [];

  // drop our results into the output table
  D2Sources[sourceTag] = {
    itemHashes,
    sourceHashes,
    searchString,
  };

  if (aliases) {
    aliases.forEach((alias) => (D2Sources[alias] = D2Sources[sourceTag]));
  }

  D2SourcesV2[sourceTag] = {};
  if (itemHashes.length) {
    D2SourcesV2[sourceTag].itemHashes = itemHashes;
  }
  if (sourceHashes.length) {
    D2SourcesV2[sourceTag].sourceHashes = sourceHashes;
  }
  if (aliases.length) {
    D2SourcesV2[sourceTag].aliases = aliases;
  }
  if (missingSources.length) {
    D2SourcesV2[sourceTag].missingSource = missingSources;
  }
}

// removed ignored sources
delete D2Sources['ignore'];

const D2SourcesSorted = sortObject(D2Sources);
const D2SourcesStringified = stringifyObject(D2SourcesSorted, {
  indent: '  ',
});

const pretty = `const D2Sources: { [key: string]: { itemHashes: number[]; sourceHashes: number[]; searchString: string[] } } = ${D2SourcesStringified};\n\nexport default D2Sources;`;

// annotate the file with sources or item names next to matching hashes
const annotated = annotate(pretty, sourcesInfo);

writeFile('./output/source-info.ts', annotated);

// removed ignored sources
delete D2SourcesV2['ignore'];

const D2SourcesSortedV2 = sortObject(D2SourcesV2);
const D2SourcesStringifiedV2 = stringifyObject(D2SourcesSortedV2, {
  indent: '  ',
});

const prettyV2 = `const D2Sources: { [key: string]: { itemHashes?: number[]; sourceHashes?: number[]; aliases?: string[]; missingSource?: number[] } } = ${D2SourcesStringifiedV2};\n\nexport default D2Sources;`;

// annotate the file with sources or item names next to matching hashes
const annotatedV2 = annotate(prettyV2, sourcesInfo);

writeFile('./output/source-info-v2.ts', annotatedV2);

unassignedSources = allSources.filter((x) => !assignedSources.includes(x));

unassignedSources.forEach((hash) => {
  const source = allCollectibles.find((c) => c.sourceHash === hash);
  const sourceName = source?.sourceString
    ? source.sourceString
    : source?.displayProperties.description ?? '';

  unassignedSourceStringsByHash[hash] = sourceName;
});

writeFile('./data/sources/unassigned.json', unassignedSourceStringsByHash);

function stringifySort(arr: number[]) {
  return JSON.stringify(arr.sort());
}

function stringifySortCompare(arr1: number[], arr2: number[]) {
  return stringifySort(arr1) === stringifySort(arr2);
}
