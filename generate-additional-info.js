const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');
const fs = require('fs');
const redis = require('redis');
const client = redis.createClient();

const seasonInfo = require('./data/d2-season-info.js');
const seasons = require('./data/seasons.json');
const events = require('./data/events.json');
const calculatedSeason = getCurrentSeason();
const firstRun = false;

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

    if (!seasons[hash] && !typeBlacklist.includes[type]) {
      // Only add items not currently in db and not blacklisted
      client.hset('itemhash', hash, JSON.stringify(inventoryItem[key]));
      client.hset('season', hash, firstRun ? seasons[hash] || calculatedSeason : calculatedSeason);
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

categorizeSources();
/*================================================================================================================================*\
||
|| Helper Functions
||
||
\*================================================================================================================================*/
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

function writeFile(obj, filename, stringify = true) {
  const content = stringify ? JSON.stringify(obj, null, 2) : obj;
  fs.writeFile(filename, content, 'utf8', function(err) {
    if (err) {
      return console.log(err);
    }
  });
}

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
/*================================================================================================================================*\
||
|| Sundevour categorizeSources()
|| https://github.com/sundevour/d2-additonal-info-redis/commit/903b2b4835c53da6c2175abac387e6c5ff97a51e
||
\*================================================================================================================================*/
function categorizeSources() {
  let categories = require('./data/categories.json');
  let sourcesInfo = {};
  let D2Sources = {
    // the result for pretty printing
    SourceList: [],
    Sources: {}
  };

  Object.values(collectibles).forEach(function(collectible) {
    if (collectible.sourceHash) {
      sourcesInfo[collectible.sourceHash] = collectible.sourceString;
    }
  });

  // loop through categorization rules
  Object.entries(categories.sources).forEach(function(category) {
    // initialize this source's object
    D2Sources.SourceList.push(category[0]);
    D2Sources.Sources[category[0]] = {
      itemHashes: [],
      sourceHashes: []
    };

    // string match source descriptions
    D2Sources.Sources[category[0]].sourceHashes = objectSearchValues(sourcesInfo, category[1]);
    if (!D2Sources.Sources[category[0]].sourceHashes.length) {
      console.log(`no matching sources for: ${category[1]}`);
    }

    // if there's individual items, look them up
    if (categories.items[category[0]]) {
      categories.items[category[0]].forEach(function(itemName) {
        Object.entries(inventoryItem).forEach(function(entry) {
          if (entry[1].displayProperties.name === itemName) {
            D2Sources.Sources[category[0]].itemHashes.push(entry[0]);
          }
        });
      });
    }
  });

  let pretty = `const Sources = ${JSON.stringify(D2Sources, null, 2)}\n\n export default Sources;`;

  // annotate the file with sources or item names next to matching hashes
  let annotated = pretty.replace(/"(\d{2,})",?/g, function(match, submatch) {
    if (sourcesInfo[submatch]) {
      return `${match} // ${sourcesInfo[submatch]}`;
    }
    if (inventoryItem[submatch]) {
      return `${match} // ${inventoryItem[submatch].displayProperties.name}`;
    }
    console.log(`unable to find information for hash ${submatch}`);
  });

  writeFile(annotated, './output/source-info.ts', false);
}

function objectSearchValues(haystack, searchTermArray) {
  var searchResults = [];
  Object.entries(haystack).forEach(function(entry) {
    searchTermArray.forEach(function(searchTerm) {
      if (entry[1].toLowerCase().indexOf(searchTerm.toLowerCase()) != -1) {
        searchResults.push(entry[0]);
      }
    });
  });
  return searchResults;
}
