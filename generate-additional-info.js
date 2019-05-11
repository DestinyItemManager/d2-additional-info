const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');
const fs = require('fs');
const redis = require('redis');
const client = redis.createClient();

const seasonInfo = require('./data/d2-season-info.js');
const eventInfo = require('./data/d2-event-info.js');
const seasons = require('./data/seasons.json');
const events = require('./data/events.json');
const calculatedSeason = getCurrentSeason();
const firstRun = true;

client.on('error', function(err) {
  console.log(`Redis Error: ${err}`);
});

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
let collectibleItem = mostRecentManifestLoaded.DestinyCollectibleDefinition;

client.hgetall('itemhash', function(err, items) {
  Object.keys(inventoryItem).forEach(function(key) {
    const hash = inventoryItem[key].hash;
    // const source = inventoryItem[key].collectibleHash ? collectibleItem[inventoryItem[key].collectibleHash].sourceHash : null;
    
    if (firstRun || !items[hash]) {
      // Only add items not currently in db
      client.hset('itemhash', hash, JSON.stringify(inventoryItem[key]));
      client.hset('season', hash, firstRun ? seasons[hash] || calculatedSeason : calculatedSeason);
    }
    if (events[hash]) { // && !existsInRedis(hash, 'event')) {
      // Only add event info, if none currently exists!
      client.hset('event', hash, events[hash]);
    }
  });

  outputTable('season', 'd2-seasons.json');
  outputTable('event', 'd2-events.json');

  client.quit();
  console.log('Redis Updated!');
  process.exit();
});

async function existsInRedis(hash, table) {
  const exists = await client.hget(table, hash).resolve;
  return exists;
}

function getCurrentSeason() {
  let seasonDate;
  const maxSeasons = Object.keys(seasonInfo.D2SeasonInfo).length;
  const today = new Date(Date.now());
  for (let i = maxSeasons; i > 0; i--) {
    seasonDate = new Date(
      `${seasonInfo.D2SeasonInfo[i].releaseDate}T${seasonInfo.D2SeasonInfo[i].resetTime}`
    );
    if (today >= seasonDate) {
      return seasonInfo.D2SeasonInfo[i].season;
    }
  }
  return 0;
}

function writeFile(obj, filename) {
  const content = JSON.stringify(obj, null, 2);
  fs.writeFile(filename, content, 'utf8', function(err) {
    if (err) {
      return console.log(err);
    }
  });
}

function outputTable(table, filename) {
  client.hgetall(table, function(err, obj) {
    Object.keys(obj).forEach(function(key) {
      let value = parseInt(obj[key], 10);
      if (!isNaN(value)) {
        obj[key] = value;
      }
    });
    writeFile(obj, `./output/${filename}`);
  });
}
