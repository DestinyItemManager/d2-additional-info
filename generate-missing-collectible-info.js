const { writeFile, getMostRecentManifest, isEqual } = require('./helpers.js');
const stringifyObject = require('stringify-object');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);
const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

missingCollectibleHashes = {};

// Every Inventory Item without a collectible hash
nonCollectibleItems = Object.values(inventoryItems).filter(function(item) {
  if (!item.collectibleHash) {
    return true;
  }
});

// Every Inventory Item with a collectible hash
collectibleItems = Object.values(inventoryItems).filter(function(item) {
  if (item.collectibleHash) {
    return true;
  }
});

Object.values(collectibleItems).forEach(function(item) {
  itemsWithSameName = Object.values(nonCollectibleItems).filter(function(item2) {
    if (
      item.displayProperties.name === item2.displayProperties.name &&
      isEqual(item.itemCategoryHashes, item2.itemCategoryHashes)
    ) {
      return true;
    }
  });
  Object.values(itemsWithSameName).forEach(function(item2) {
    Object.values(collectibles).filter(function(collectible) {
      if (item.collectibleHash === collectible.hash) {
        missingCollectibleHashes[collectible.sourceHash]
          ? missingCollectibleHashes[collectible.sourceHash].push(item2.hash)
          : (missingCollectibleHashes[collectible.sourceHash] = [item2.hash]);
      }
    });
  });
});

categorizeSources();

function categorizeSources() {
  let categories = require('./data/sources/categories.json');
  let sourcesInfo = {};
  let D2Sources = {}; // converts search field short source tags to item & source hashes
  let newSourceInfo = {};

  // sourcesInfo built from manifest collectibles
  Object.values(collectibles).forEach(function(collectible) {
    if (collectible.sourceHash) {
      sourcesInfo[collectible.sourceHash] = collectible.sourceString;
    }
  });

  // loop through categorization rules
  Object.entries(categories.sources).forEach(function([sourceTag, matchRule]) {
    // initialize this source's object
    D2Sources[sourceTag] = {};

    // string match this category's source descriptions
    D2Sources[sourceTag].sourceHashes = objectSearchValues(sourcesInfo, matchRule);
    if (!D2Sources[sourceTag].sourceHashes.length) {
      console.log(`no matching sources for: ${matchRule}`);
    }

    Object.entries(D2Sources).forEach(function([sourceTag, sourceHashes]) {
      Object.entries(missingCollectibleHashes).forEach(function([sourceHash, items]) {
        if (sourceHashes.sourceHashes.includes(sourceHash)) {
          newSourceInfo[sourceTag] = items;
        }
      });
    });

    // lastly add aliases and copy info
    if (categories.sources[sourceTag].alias) {
      newSourceInfo[categories.sources[sourceTag].alias] = newSourceInfo[sourceTag];
    }
  });

  // sort the object after adding in the aliases
  D2SourcesSorted = {};
  Object.keys(newSourceInfo)
    .sort()
    .forEach((k) => (D2SourcesSorted[k] = newSourceInfo[k]));

  let pretty = `const missingSources: { [key: string]: number[] } = ${stringifyObject(
    D2SourcesSorted,
    {
      indent: '  '
    }
  )};\n\nexport default missingSources;`;

  // annotate the file with sources or item names next to matching hashes
  let annotated = pretty.replace(/'(\d{2,})',?/g, function(match, submatch) {
    if (sourcesInfo[submatch]) {
      return `${Number(submatch)}, // ${sourcesInfo[submatch]}`;
    }
    if (inventoryItems[submatch]) {
      return `${Number(submatch)}, // ${inventoryItems[submatch].displayProperties.name}`;
    }
    console.log(`unable to find information for hash ${submatch}`);
    return `${Number(submatch)}, // could not identify hash`;
  });

  writeFile('./output/missing-source-info.ts', annotated);
}

// searches haystack (collected manifest source strings) to match against needleInfo (a categories.json match rule)
// returns a list of source hashes
function objectSearchValues(haystack, needleInfo) {
  var searchResults = Object.entries(haystack); // [[hash, string],[hash, string],[hash, string]]

  // filter down to only search results that match conditions
  searchResults = searchResults.filter(
    ([sourceHash, sourceString]) =>
      // do inclusion strings match this sourceHash?
      needleInfo.includes.filter((searchTerm) =>
        sourceString.toLowerCase().includes(searchTerm.toLowerCase())
      ).length &&
      // not any excludes or not any exclude matches
      !(
        needleInfo.excludes &&
        // do exclusion strings match this sourceHash?
        needleInfo.excludes.filter((searchTerm) =>
          sourceString.toLowerCase().includes(searchTerm.toLowerCase())
        ).length
      )
  );
  // extracts key 0 (sourcehash) from searchResults
  return [...new Set(searchResults.map((result) => result[0]))];
}
