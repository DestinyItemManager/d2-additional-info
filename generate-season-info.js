const { getCurrentSeason, writeFilePretty, getMostRecentManifest } = require('./helpers.js');
const seasons = require('./data/seasons_master.json');

const calculatedSeason = getCurrentSeason();

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

Object.keys(inventoryItem).forEach(function(key) {
  const hash = inventoryItem[key].hash;
  const sourceHash = inventoryItem[key].collectibleHash
    ? collectibles[inventoryItem[key].collectibleHash].sourceHash
    : null;

  const eventEngramItem = sourceEngramItems.includes(sourceHash);

  if (!seasons[hash]) {
    // Only add items not currently in db
    seasons[hash] = calculatedSeason;
  }
});

writeFilePretty('./data/seasons_master.json', seasons);
