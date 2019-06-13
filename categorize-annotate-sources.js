const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');
const fs = require('fs');

const isDirectory = (source) => lstatSync(source).isDirectory();
const getDirectories = (source) =>
  readdirSync(source)
    .map((name) => join(source, name))
    .filter(isDirectory);
const getFiles = (source) => readdirSync(source).map((name) => join(source, name));

let manifestDirs = getDirectories('./manifests');

let latest = manifestDirs[manifestDirs.length - 1];
let manifest = getFiles(latest);
let mostRecentManifest = manifest[manifest.length - 1];
let mostRecentManifestLoaded = require(`./${mostRecentManifest}`);

let inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
let collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

var sourcesInfo = {};
Object.values(collectibles).forEach(function(collectible) { 
  if (collectible['sourceHash']) sourcesInfo[collectible.sourceHash] = collectible.sourceString;
});

let categories = require('./data/categories.json');

function objectSearchValues(haystack, searchTermArray) {
  var searchResults = [];
  Object.entries(haystack).forEach(function(entry) {
    searchTermArray.forEach(function(searchTerm) {
      if (entry[1].toLowerCase().indexOf(searchTerm.toLowerCase())!=-1) {
        searchResults.push(entry[0]);
      }
    });
  });
  return searchResults;
}

// the result for prettyprinting
var D2Sources = {"SourceList": [], "Sources": {}};

// loop through categorization rules
Object.entries(categories.sources).forEach(function(category) {

  // initialize this source's object
  D2Sources.SourceList.push(category[0]);
  D2Sources.Sources[category[0]] = {"itemHashes": [], "sourceHashes": []};

  // string match source descriptions
  D2Sources.Sources[category[0]].sourceHashes = objectSearchValues(sourcesInfo, category[1]);
  if (!D2Sources.Sources[category[0]].sourceHashes.length) console.log(`no matching sources for "${category[1]}"`);

  // if there's individual items, look them up
  if (categories.items[category[0]]) {
    categories.items[category[0]].forEach(function(itemName) {
      Object.entries(inventoryItem).forEach(function(entry) {
        if (entry[1].displayProperties.name == itemName) D2Sources.Sources[category[0]].itemHashes.push(entry[0]);
      });
    });
  }
});

var pretty = "export const D2Sources = " + JSON.stringify(D2Sources, null, "  ") + "\n";

// annotate the file with sources or item names next to matching hashes
var annotated = pretty.replace(/"(\d{2,})",?/g, function(match, submatch){
  if (sourcesInfo[submatch]) return match + " // " + sourcesInfo[submatch];
  if (inventoryItem[submatch]) return match + " // " + inventoryItem[submatch].displayProperties.name;
  console.log(`unable to find information for hash ${submatch}`);
});

fs.writeFile("./output/d2-source-info.ts", annotated, 'utf8', function(err) {
  if (err) {
    return console.log(err);
  }
});
