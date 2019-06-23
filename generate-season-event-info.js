const { getCurrentSeason, writeFile, getMostRecentManifest } = require('./helpers.js');
const seasons = require('./data/seasons.json');
const events = require('./data/events.json');

const calculatedSeason = getCurrentSeason();

const items = {};
const newSeason = {};
const newEvent = {};
const newSource = {};

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

let inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
let collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

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

Object.keys(inventoryItem).forEach(function(key) {
  const hash = inventoryItem[key].hash;
  const type = inventoryItem[key].itemType;
  const typeBlacklist = [1, 12, 26]; // Currencies, Bounties, Quests

  if (!typeBlacklist.includes[type]) {
    // Only add items not currently in db and not blacklisted
    items[hash] = JSON.stringify(inventoryItem[key]);
    newSeason[hash] = seasons[hash] || calculatedSeason;
  }
  if (typeBlacklist.includes(type)) {
    // delete any items that got through before blacklist
    delete newSeason[hash];
  }
  if (events[hash]) {
    // Only add event info, if none currently exists!
    newEvent[hash] = events[hash];
  }
});

writeFile(newEvent, 'output/events.json');
writeFile(newSeason, 'output/seasons.json');
writeFile(newSource, 'output/sources.json');

writeFile(newEvent, 'data/events.json');
writeFile(newSeason, 'data/seasons.json');
