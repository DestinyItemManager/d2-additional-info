/*================================================================================================================================*\
||
|| categorizeSources()
|| converts manifest's sourceHashes and sourceStrings into DIM filters according to categories.json rules
||
\*================================================================================================================================*/
const { writeFile, getMostRecentManifest } = require('./helpers.js');
const stringifyObject = require('stringify-object');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

let inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
let collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

const newSource = {};

Object.values(collectibles).forEach(function(collectible) {
  const hash = collectible.sourceHash;
  const sourceName = collectible.sourceString
    ? collectible.sourceString
    : collectible.displayProperties.description;
  if (hash) {
    // Only add sources that have an existing hash (eg. no classified items)
    newSource[hash] = sourceName;
  }
});

writeFile('./output/sources.json', newSource);
categorizeSources();

function categorizeSources() {
  let categories = require('./data/sources/categories.json');
  let sourcesInfo = {};
  let D2Sources = {}; // converts search field short source tags to item & source hashes

  // sourcesInfo built from manifest collectibles
  Object.values(collectibles).forEach(function(collectible) {
    if (collectible.sourceHash) {
      sourcesInfo[collectible.sourceHash] = collectible.sourceString;
    }
  });

  // add any manual source strings from categories.json
  categories.exceptions.forEach(function([sourceHash, sourceString]) {
    sourcesInfo[sourceHash] = sourceString;
  });

  // loop through categorization rules
  Object.entries(categories.sources).forEach(function([sourceTag, matchRule]) {
    // initialize this source's object
    D2Sources[sourceTag] = {
      itemHashes: [],
      sourceHashes: []
    };

    // string match this category's source descriptions
    D2Sources[sourceTag].sourceHashes = objectSearchValues(sourcesInfo, matchRule);
    if (!D2Sources[sourceTag].sourceHashes.length) {
      console.log(`no matching sources for: ${matchRule}`);
    }

    // add individual items if available for this category
    if (categories.sources[sourceTag].items) {
      categories.sources[sourceTag].items.forEach(function(itemNameOrHash) {
        Object.entries(inventoryItems).forEach(function([itemHash, itemProperties]) {
          if (
            itemNameOrHash == itemHash ||
            itemProperties.displayProperties.name == itemNameOrHash
          ) {
            D2Sources[sourceTag].itemHashes.push(itemHash);
          }
        });
      });
    }

    // lastly add aliases and copy info
    if (categories.sources[sourceTag].alias) {
      D2Sources[categories.sources[sourceTag].alias] = D2Sources[sourceTag];
    }
  });

  // sort the object after adding in the aliases
  D2SourcesSorted = {};
  Object.keys(D2Sources)
    .sort()
    .forEach((k) => (D2SourcesSorted[k] = D2Sources[k]));

  let pretty = `const D2Sources: { [key: string]: { itemHashes: number[]; sourceHashes: number[] } } = ${stringifyObject(
    D2SourcesSorted,
    {
      indent: '  '
    }
  )};\n\nexport default D2Sources;`;

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

  writeFile('./output/source-info.ts', annotated);
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
