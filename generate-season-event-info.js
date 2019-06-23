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
  const categoryHashes = inventoryItem[key].itemCategoryHashes || [];
  const categoryBlacklist = [18, 1784235469, 53, 16]; // Currencies, Bounties, Quests, Quest Steps

  const blacklisted = categoryHashes.some((v) => categoryBlacklist.indexOf(v) !== -1);

  items[hash] = JSON.stringify(inventoryItem[key]);

  if (!blacklisted) {
    // Only add items not currently in db and not blacklisted
    newSeason[hash] = seasons[hash] || calculatedSeason;
  }
  if (blacklisted) {
    // delete any items that got through before blacklist or when new blacklist items are added
    delete newSeason[hash];
  }
  if (events[hash]) {
    // Only add event info, if none currently exists!
    newEvent[hash] = events[hash];
  }
});

//console.log(JSON.parse(items[2362471601]));

writeFile(newEvent, 'output/events.json');
writeFile(newSeason, 'output/seasons.json');

writeFile(newEvent, 'data/events.json');
writeFile(newSeason, 'data/seasons.json');
