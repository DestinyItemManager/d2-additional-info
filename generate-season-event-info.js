const {
  getCurrentSeason,
  writeFilePretty,
  getMostRecentManifest,
  getSourceBlacklist
} = require('./helpers.js');
const seasons = require('./data/seasons_master.json');
const events = require('./data/events.json');

const calculatedSeason = getCurrentSeason();

const newEvent = {};

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

const sourceEngramItems = getSourceBlacklist();

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

  if (events[hash] && !eventEngramItem) {
    // Only add event info, if none currently exists!
    newEvent[hash] = events[hash];
  } else {
    delete newEvent[hash];
  }
});

writeFilePretty('./output/events.json', newEvent);

writeFilePretty('./data/events.json', newEvent);
writeFilePretty('./data/seasons_master.json', seasons);
