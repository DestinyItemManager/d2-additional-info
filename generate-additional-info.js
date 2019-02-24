const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');
const fs = require('fs');
const seasonInfo = require('./data/d2-season-info.js');
const seasons = require('./data/seasons.json');
const events = require('./data/events.json');
const firstRun = false;

const redis = require('redis');
const client = redis.createClient();

client.on('error', function(err) {
  console.log('Error ' + err);
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

Object.keys(inventoryItem).forEach(function(key) {
  const hash = inventoryItem[key].hash;
  if (!existsInRedis(hash, 'itemhash')) {
    client.hset('itemhash', hash, JSON.stringify(inventoryItem[key]));
    client.hset(
      'season',
      hash,
      firstRun ? seasons[hash] || getCurrentSeason() : getCurrentSeason()
    );
  }
  if (events[hash] && !existsInRedis(hash, 'event')) {
    client.hset('event', hash, events[hash]);
  }
});

client.hgetall('season', function(err, obj) {
  string2int(obj);
  writeFile(obj, './output/d2-seasons.json');
});

client.hgetall('event', function(err, obj) {
  string2int(obj);
  writeFile(obj, './output/d2-events.json');
});

client.quit();
console.log('Redis Updated!');

async function existsInRedis(hash, table) {
  const exists = await client.hget(table, hash);
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

function string2int(obj) {
  Object.keys(obj).forEach(function(key) {
    let value = parseInt(obj[key], 10);
    if (!isNaN(value)) {
      obj[key] = value;
    }
  });
}
