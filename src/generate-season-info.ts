const { getCurrentSeason, writeFile, getMostRecentManifest } = require('./helpers.js');
const seasons = require('./data/seasons/seasons_master.json');
const seasonsInfo = require('./data/seasons/d2-season-info.js').D2SeasonInfo;

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

const seasonTags = Object.values(seasonsInfo)
  .filter((seasonInfo) => seasonInfo.season <= calculatedSeason)
  .map((seasonInfo) => [seasonInfo.seasonTag, seasonInfo.season])
  .reduce((acc, [tag, num]) => ((acc[tag] = num), acc), {});

writeFile('./output/season-tags.json', seasonTags);
