const { getMostRecentManifest, writeFilePretty } = require('./helpers.js');
const fs = require('fs');
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

let inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
let sources = mostRecentManifestLoaded.DestinyCollectibleDefinition;

console.log('writing pretty printed manifest to ./output/prettymanifest.json');

writeFilePretty('./output/prettymanifest.json', mostRecentManifestLoaded);
