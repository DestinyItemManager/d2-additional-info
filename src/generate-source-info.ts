import { getAllDefs, getDef } from '@d2api/manifest-node';
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
  if (matchRule.searchString) {
    searchString = [...matchRule.searchString];
  }

  // worth noting if one of our rules has become defunct
  if (!sourceHashes.length && !sourceTag.includes('shatteredthrone')) {
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

  if (matchRule.originTrait) {
    for (const trait of matchRule.originTrait) {
      const excludedWords = matchRule.excludedWords;
      const traitHash = allInventoryItems
        .filter((i) => i.displayProperties.name === trait)
        .map((i) => i.hash)[0];

      const includedOriginTraits = allInventoryItems
        .filter((i) => {
          const traitHashes = [
            getDef(
              'PlugSet',
              i.sockets?.socketEntries.filter((socket) => socket.socketTypeHash === 3993098925)[0]
                ?.reusablePlugSetHash,
            ),
          ]
            .map((i) => i?.reusablePlugItems.map((p) => p.plugItemHash))
            .flat();

          return (
            i.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) &&
            !i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies) &&
            !excludedWords?.some((term) => i.displayProperties.name.includes(term)) &&
            !matchRule.includes.some((term) =>
              getDef('Collectible', i.collectibleHash)?.sourceString.includes(term),
            ) &&
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
