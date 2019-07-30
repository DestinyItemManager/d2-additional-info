const { getCurrentSeason, writeFile, getMostRecentManifest } = require('./helpers.js');
const seasons = require('./data/seasons/seasons_master.json');

const calculatedSeason = getCurrentSeason();

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

Object.keys(inventoryItem).forEach(function(key) {
  const hash = inventoryItem[key].hash;

  if (!seasons[hash]) {
    // Only add items not currently in db
    seasons[hash] = calculatedSeason;
  }
});

writeFile('./data/seasons/seasons_master.json', seasons);
