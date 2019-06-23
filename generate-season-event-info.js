const { getCurrentSeason, writeFile, getMostRecentManifest } = require('./helpers.js');
const seasons = require('./data/seasons.json');
const events = require('./data/events.json');

const calculatedSeason = getCurrentSeason();

const items = {};
const newSeason = {};
const newEvent = {};

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

let inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

Object.keys(inventoryItem).forEach(function(key) {
  const hash = inventoryItem[key].hash;
  const type = inventoryItem[key].itemType;
  const typeBlacklist = [1, 12, 26]; // Currencies, Bounties, Quests

  items[hash] = JSON.stringify(inventoryItem[key]);

  if (!typeBlacklist.includes[type]) {
    // Only add items not currently in db and not blacklisted
    newSeason[hash] = seasons[hash] || calculatedSeason;
  }
  if (typeBlacklist.includes(type)) {
    // delete any items that got through before blacklist or when new blacklist items are added
    delete newSeason[hash];
  }
  if (events[hash]) {
    // Only add event info, if none currently exists!
    newEvent[hash] = events[hash];
  }
});

writeFile(newEvent, 'output/events.json');
writeFile(newSeason, 'output/seasons.json');

writeFile(newEvent, 'data/events.json');
writeFile(newSeason, 'data/seasons.json');
