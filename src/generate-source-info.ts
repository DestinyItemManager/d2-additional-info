import { getAllDefs, getDef } from '@d2api/manifest-node';
import categories_ from 'data/sources/categories.json' with { type: 'json' };
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
const originTraitSocketCategoryHash = 3993098925;
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
  }
> = {};

const D2SourcesSupplementalV2: Record<
  string,
  {
    itemHashes?: number[];
    sourceHashes?: number[];
    aliases?: string[];
  }
> = {};

// sourcesInfo built from manifest collectibles
for (const collectible of allCollectibles) {
  if (collectible.sourceHash) {
    sourcesInfo[collectible.sourceHash] = collectible.sourceString;
  }
}

// add any manual source strings from categories.json
for (const [sourceHash, sourceString] of categories.renameSourceStrings) {
  sourcesInfo[Number(sourceHash)] = sourceString;
}

// loop through categorization rules
for (const [sourceTag, matchRule] of Object.entries(categories.sources)) {
  // string match this category's source descriptions
  const sourceHashes = applySourceStringRules(sourcesInfo, matchRule);
  assignedSources.push(...sourceHashes);
  let searchString: string[] = [];
  if (matchRule.searchString) {
    searchString = [...matchRule.searchString];
  }

  // worth noting if one of our rules has become defunct
  if (!sourceHashes.length && matchRule.includes.length) {
    console.log(`no matching sources for ${sourceTag}:`);
    console.log(matchRule);
  }

  // item hashes which correspond to this sourceTag
  let itemHashes: number[] = [];

  const categoryDenyList = [
    ItemCategoryHashes.Dummies,
    ItemCategoryHashes.QuestStep,
    ItemCategoryHashes.Patterns,
  ];

  const categoryIncludeList = [
    ItemCategoryHashes.Weapon,
    ItemCategoryHashes.Armor,
    ItemCategoryHashes.Ghost,
    ItemCategoryHashes.Shaders,
    ItemCategoryHashes.Emblems,
    ItemCategoryHashes.Ships,
    ItemCategoryHashes.Mods_Ornament,
    ItemCategoryHashes.Sparrows,
  ];

  // find any specified individual items by name,
  // and add their hashes
  if (matchRule.items) {
    for (const itemNameOrHash of matchRule.items) {
      const includedItemHashes = allInventoryItems
        .filter((i) => {
          // lets not add an item that we can use a currently assigned sourceHash for
          const unmatchedSourceString = !matchRule.includes.some((term) =>
            getDef('Collectible', i.collectibleHash)?.sourceString.includes(term),
          );

          const itemMatch = [String(i.hash), i.displayProperties?.name].includes(
            String(itemNameOrHash),
          );

          return (
            unmatchedSourceString &&
            !categoryDenyList.some((hash) => i.itemCategoryHashes?.includes(hash)) &&
            categoryIncludeList.some((hash) => i.itemCategoryHashes?.includes(hash)) &&
            itemMatch
          );
        })
        .map((i) => i.hash);
      itemHashes.push(...includedItemHashes);
    }
  }

  if (matchRule.originTrait) {
    // Origin Traits are specific to sources, some weapons have multiple origin traits
    for (const trait of matchRule.originTrait) {
      const excludedItems = matchRule.excludedItems;
      const traitHash = allInventoryItems
        .filter((i) => i.displayProperties.name === trait)
        .map((i) => i.hash)[0];

      const includedOriginTraits = allInventoryItems
        .filter((i) => {
          // lets not add an item that we can use a currently assigned sourceHash for
          const unmatchedSourceString = !matchRule.includes.some((term) =>
            getDef('Collectible', i.collectibleHash)?.sourceString.includes(term),
          );

          const traitHashes = [
            getDef(
              'PlugSet',
              i.sockets?.socketEntries.filter(
                (socket) => socket.socketTypeHash === originTraitSocketCategoryHash,
              )[0]?.reusablePlugSetHash,
            ),
          ]
            .map((i) => i?.reusablePlugItems.map((p) => p.plugItemHash))
            .flat();

          return (
            i.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) &&
            !i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies) &&
            !excludedItems?.some((term) => i.displayProperties.name.includes(term)) &&
            unmatchedSourceString &&
            traitHashes.includes(traitHash)
          );
        })
        .map((i) => i.hash);
      itemHashes.push(...includedOriginTraits);
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

  if (matchRule.extends) {
    // sourceTag info from another tag
    // all raids are supplemental to the raid tag, all dungeons are supplemental to the dungeon
    for (const sourceTag of matchRule.extends) {
      if (!D2SourcesSupplementalV2[sourceTag]) {
        D2SourcesSupplementalV2[sourceTag] = {};
        D2SourcesSupplementalV2[sourceTag].itemHashes = [];
        D2SourcesSupplementalV2[sourceTag].sourceHashes = [];
      }
      D2SourcesSupplementalV2[sourceTag].itemHashes?.push(...itemHashes);
      D2SourcesSupplementalV2[sourceTag].sourceHashes?.push(...sourceHashes);
    }
  }
}

for (const sourceTag in D2SourcesSupplementalV2) {
  if (D2Sources[sourceTag]) {
    D2Sources[sourceTag].itemHashes.push(...(D2SourcesSupplementalV2[sourceTag].itemHashes ?? []));
    D2Sources[sourceTag].sourceHashes.push(
      ...(D2SourcesSupplementalV2[sourceTag].sourceHashes ?? []),
    );
  } else {
    const itemHashes = D2SourcesSupplementalV2[sourceTag].itemHashes ?? [];
    const sourceHashes = D2SourcesSupplementalV2[sourceTag].sourceHashes ?? [];
    const searchString = [''];
    D2Sources[sourceTag] = {
      itemHashes,
      sourceHashes,
      searchString,
    };
  }
  D2Sources[sourceTag].itemHashes = uniqAndSortArray(D2Sources[sourceTag].itemHashes);
  D2Sources[sourceTag].sourceHashes = uniqAndSortArray(D2Sources[sourceTag].sourceHashes);
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

for (const sourceTag in D2SourcesSupplementalV2) {
  const itemHashes = D2SourcesSupplementalV2[sourceTag].itemHashes ?? [];
  const sourceHashes = D2SourcesSupplementalV2[sourceTag].sourceHashes ?? [];

  if (!D2SourcesV2[sourceTag].itemHashes?.length && itemHashes.length) {
    D2SourcesV2[sourceTag].itemHashes = [];
  }

  if (!D2SourcesV2[sourceTag].sourceHashes?.length && sourceHashes.length) {
    D2SourcesV2[sourceTag].sourceHashes = [];
  }

  if (itemHashes.length) {
    D2SourcesV2[sourceTag].itemHashes?.push(...itemHashes);
    D2SourcesV2[sourceTag].itemHashes = uniqAndSortArray(D2SourcesV2[sourceTag].itemHashes ?? []);
  }

  if (sourceHashes.length) {
    D2SourcesV2[sourceTag].sourceHashes?.push(...sourceHashes);
    D2SourcesV2[sourceTag].sourceHashes = uniqAndSortArray(
      D2SourcesV2[sourceTag].sourceHashes ?? [],
    );
  }
}

// removed ignored sources
delete D2SourcesV2['ignore'];

const D2SourcesSortedV2 = sortObject(D2SourcesV2);
const D2SourcesStringifiedV2 = stringifyObject(D2SourcesSortedV2, {
  indent: '  ',
});

const prettyV2 = `const D2Sources: { [key: string]: { itemHashes?: number[]; sourceHashes?: number[]; aliases?: string[] } } = ${D2SourcesStringifiedV2};\n\nexport default D2Sources;`;

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
