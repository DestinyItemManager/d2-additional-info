/*================================================================================================================================*\
||
|| categorizeSources()
|| converts manifest's sourceHashes and sourceStrings into DIM filters according to categories.json rules
||
\*================================================================================================================================*/
const { writeFile, writeFilePretty, getMostRecentManifest, prettier } = require('./helpers.js');
const stringifyObject = require('stringify-object');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

let inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
let collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

const newSource = {};

Object.keys(collectibles).forEach(function(key) {
  const hash = collectibles[key].sourceHash;
  const sourceName = collectibles[key].sourceString
    ? collectibles[key].sourceString
    : collectibles[key].displayProperties.description;
  if (hash) {
    // Only add sources that have an existing hash (eg. no classified items)
    newSource[hash] = sourceName;
  }
});

writeFilePretty('./output/sources.json', newSource);
categorizeSources();

function categorizeSources() {
  let categories = require('./data/categories.json');
  let sourcesInfo = {};
  let D2Sources = {
    // the result for pretty printing
    SourceList: [], // just one of each source tag
    Sources: {} // converts source tags to item & source hashes
  };

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
    D2Sources.SourceList.push(sourceTag);
    D2Sources.Sources[sourceTag] = {
      itemHashes: [],
      sourceHashes: []
    };

    // string match this category's source descriptions
    D2Sources.Sources[sourceTag].sourceHashes = objectSearchValues(sourcesInfo, matchRule);
    if (!D2Sources.Sources[sourceTag].sourceHashes.length) {
      console.log(`no matching sources for: ${matchRule}`);
    }

    // add individual items if available for this category
    if (categories.items[sourceTag]) {
      categories.items[sourceTag].forEach(function(itemName) {
        Object.entries(inventoryItem).forEach(function([itemHash, itemProperties]) {
          if (itemProperties.displayProperties.name === itemName) {
            D2Sources.Sources[sourceTag].itemHashes.push(itemHash);
          }
        });
      });
    }
  });

  let pretty = `const Sources = ${stringifyObject(D2Sources, {
    indent: '  '
  })};\n\nexport default Sources;`;

  // annotate the file with sources or item names next to matching hashes
  let annotated = pretty.replace(/'(\d{2,})',?/g, function(match, submatch) {
    if (sourcesInfo[submatch]) {
      return `${Number(submatch)}, // ${sourcesInfo[submatch]}`;
    }
    if (inventoryItem[submatch]) {
      return `${Number(submatch)}, // ${inventoryItem[submatch].displayProperties.name}`;
    }
    console.log(`unable to find information for hash ${submatch}`);
    return `${Number(submatch)}, // could not identify hash`;
  });

  writeFile('./output/source-info.ts', annotated);
  prettier('./output/source-info.ts');
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
