/*================================================================================================================================*\
||
|| categorizeSources()
|| converts manifest's sourceHashes and sourceStrings into DIM filters according to categories.json rules
||
\*================================================================================================================================*/
const { writeFile, getMostRecentManifest } = require('./helpers.js');

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

writeFile(newSource, 'output/sources.json');
categorizeSources();

function categorizeSources() {
  let categories = require('./data/categories.json');
  let sourcesInfo = {};
  let D2Sources = {
    // the result for pretty printing
    SourceList: [],
    Sources: {}
  };

  // sourcesInfo built from manifest collectibles
  Object.values(collectibles).forEach(function(collectible) {
    if (collectible.sourceHash) {
      sourcesInfo[collectible.sourceHash] = collectible.sourceString;
    }
  });

  // add any manual exceptions from categories.json
  categories.exceptions.forEach(function(exceptionTuple) {
    sourcesInfo[exceptionTuple[0]] = exceptionTuple[1];
  });

  // loop through categorization rules
  Object.entries(categories.sources).forEach(function(category) {
    // initialize this source's object
    D2Sources.SourceList.push(category[0]);
    D2Sources.Sources[category[0]] = {
      itemHashes: [],
      sourceHashes: []
    };

    // string match this category's source descriptions
    D2Sources.Sources[category[0]].sourceHashes = objectSearchValues(sourcesInfo, category[1]);
    if (!D2Sources.Sources[category[0]].sourceHashes.length) {
      console.log(`no matching sources for: ${category[1]}`);
    }

    // add individual items if available for this category
    if (categories.items[category[0]]) {
      categories.items[category[0]].forEach(function(itemName) {
        Object.entries(inventoryItem).forEach(function(entry) {
          if (entry[1].displayProperties.name === itemName) {
            D2Sources.Sources[category[0]].itemHashes.push(entry[0]);
          }
        });
      });
    }
  });

  let pretty = `const Sources = ${JSON.stringify(D2Sources, null, 2)}\n\nexport default Sources;`;

  // annotate the file with sources or item names next to matching hashes
  let annotated = pretty.replace(/"(\d{2,})",?/g, function(match, submatch) {
    if (sourcesInfo[submatch]) {
      return `${match} // ${sourcesInfo[submatch]}`;
    }
    if (inventoryItem[submatch]) {
      return `${match} // ${inventoryItem[submatch].displayProperties.name}`;
    }
    console.log(`unable to find information for hash ${submatch}`);
    return `${match} // could not identify hash`;
  });

  writeFile('./output/source-info.ts', annotated);
}

function objectSearchValues(haystack, searchTermArray) {
  var searchResults = [];
  Object.entries(haystack).forEach(function(entry) {
    searchTermArray.forEach(function(searchTerm) {
      if (entry[1].toLowerCase().indexOf(searchTerm.toLowerCase()) != -1) {
        searchResults.push(entry[0]);
      }
    });
  });
  return searchResults;
}
