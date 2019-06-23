const { getMostRecentManifest } = require('./helpers.js');
const fs = require('fs');
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

let inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
let sources = mostRecentManifestLoaded.DestinyCollectibleDefinition;

console.log("writing pretty printed manifest to ./output/prettymanifest.json");

fs.writeFile("./output/prettymanifest.json",  JSON.stringify(mostRecentManifestLoaded, null, "  "), 'utf8', function(err) {
  if (err) {
    return console.log(err);
  }
});
