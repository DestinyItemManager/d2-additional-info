const { getCurrentSeason, writeFile, getMostRecentManifest } = require('./helpers.js');
const calculatedSeason = getCurrentSeason();

const redis = require('redis');
const client = redis.createClient();

const seasons = require('./data/seasons.json');
const events = require('./data/events.json');

client.on('error', function(err) {
  console.log(`Redis Error: ${err}`);
});

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

let inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
let collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

client.hgetall('sourcehash', function(err) {
  Object.keys(collectibles).forEach(function(key) {
    const hash = collectibles[key].sourceHash;
    const sourceName = collectibles[key].sourceString
      ? collectibles[key].sourceString
      : collectibles[key].displayProperties.description;
    if (hash) {
      // Only add sources that have an existing hash (eg. no classified items)
      client.hset('source', hash, sourceName);
    }
  });
});

client.hgetall('itemhash', function(err, items) {
  Object.keys(inventoryItem).forEach(function(key) {
    const hash = inventoryItem[key].hash;
    const type = inventoryItem[key].itemType;
    const typeBlacklist = [1, 12, 26]; // Currencies, Bounties, Quests

    if (!typeBlacklist.includes[type]) {
      // Only add items not currently in db and not blacklisted
      client.hset('itemhash', hash, JSON.stringify(inventoryItem[key]));
      client.hset('season', hash, seasons[hash] || calculatedSeason);
    }
    if (typeBlacklist.includes(type)) {
      // delete any items that got through before blacklist
      client.hdel('season', hash);
    }
    if (events[hash]) {
      // Only add event info, if none currently exists!
      client.hset('event', hash, events[hash]);
    }
  });

  outputTable('event', 'events.json');
  outputTable('season', 'seasons.json');
  outputTable('source', 'sources.json');

  outputTable('event', 'events.json', 'data');
  outputTable('season', 'seasons.json', 'data');

  client.quit();
  console.log('Redis Updated!');
});

function outputTable(table, filename, location = 'output') {
  client.hgetall(table, function(err, obj) {
    Object.keys(obj).forEach(function(key) {
      let value = parseInt(obj[key], 10);
      if (!isNaN(value)) {
        obj[key] = value;
      }
    });
    writeFile(obj, `./${location}/${filename}`);
  });
}
