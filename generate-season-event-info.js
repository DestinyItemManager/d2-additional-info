const {
  getCurrentSeason,
  writeFilePretty,
  getMostRecentManifest,
  getSourceBlacklist
} = require('./helpers.js');
const seasons = require('./data/seasons.json');
const events = require('./data/events.json');

const calculatedSeason = getCurrentSeason();

const items = {};
const newSeason = {};
const newEvent = {};

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

const sourceBlacklist = getSourceBlacklist();

Object.keys(inventoryItem).forEach(function(key) {
  const hash = inventoryItem[key].hash;
  const sourceHash = inventoryItem[key].collectibleHash
    ? collectibles[inventoryItem[key].collectibleHash].sourceHash
    : null;
  const categoryHashes = inventoryItem[key].itemCategoryHashes || [];
  const categoryBlacklist = [
    18, // Currencies
    1784235469, // Bounties
    53, // Quests
    16, // Quest Steps
    40, // Material
    2005599723, // Prophecy Offerings
    2150402250, // Gags
    2250046497, // Prophecy Tablets
    2253669532, // Treasure Maps
    3109687656 // Dummies
  ];

  const seasonBlacklisted = categoryHashes.some((v) => categoryBlacklist.indexOf(v) !== -1);
  const eventBlacklisted = sourceBlacklist.includes(sourceHash);

  items[hash] = JSON.stringify(inventoryItem[key]);

  if (!seasonBlacklisted) {
    // Only add items not currently in db and not blacklisted
    newSeason[hash] = seasons[hash] || calculatedSeason;
  } else {
    // delete any items that got through before blacklist or when new blacklist items are added
    delete newSeason[hash];
  }

  if (events[hash] && !eventBlacklisted) {
    // Only add event info, if none currently exists!
    newEvent[hash] = events[hash];
  } else {
    delete newEvent[hash];
  }
});

writeFilePretty('./output/events.json', newEvent);
writeFilePretty('./output/seasons.json', newSeason);

writeFilePretty('./data/events.json', newEvent);
writeFilePretty('./data/seasons.json', newSeason);
