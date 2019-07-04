const { getCurrentSeason, writeFilePretty, getMostRecentManifest } = require('./helpers.js');
const seasonsMaster = require('./data/seasons_master.json');
const _ = require('underscore');
const calculatedSeason = getCurrentSeason();

const items = {};
const newSeason = {};

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

const thisSeason = 7;

// init an array in seasonNumbers for each season
const seasonNumbers = [...Array(thisSeason + 1).keys()].slice(1);
const seasonToSource = {};
seasonNumbers.forEach((num) => (seasonToSource[num] = []));

// loop through collectibles
Object.values(inventoryItems).forEach(function(item) {
  const sourceHash = item.collectibleHash ? collectibles[item.collectibleHash].sourceHash : null;
  const season = seasonsMaster[item.hash];
  if (sourceHash && season) {
    seasonToSource[season].push(sourceHash);
  }
});

// uniq each season's collectibles
seasonNumbers.forEach((num) => (seasonToSource[num] = _.uniq(seasonToSource[num])));

// Now to verify there are no intersections if intersections remove source from seasonToSource
// put these into notSeasonallyUnique.json so we do not process these sources or items again

const intersections = [];
seasonNumbers.forEach((s1) => {
  seasonNumbers.forEach((s2) => {
    if (s1 !== s2) intersections.push(_.intersection(seasonToSource[s1], seasonToSource[s2]));
  });
});

const notSeasonallyUnique = _.uniq(_.flatten(intersections));

writeFilePretty('seasonToSource.json', seasonToSource);
