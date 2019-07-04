const { getCurrentSeason, writeFilePretty, getMostRecentManifest } = require('./helpers.js');
const seasonsMaster = require('./data/seasons_master.json');
const _ = require('underscore');
const calculatedSeason = getCurrentSeason();

const items = {};
const newSeason = {};

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

const seasonToSource = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };

Object.keys(inventoryItems).forEach(function(key) {
  const sourceHash = inventoryItems[key].collectibleHash
    ? collectibles[inventoryItems[key].collectibleHash].sourceHash
    : null;
  const season = seasonsMaster[inventoryItems[key].hash];
  if (sourceHash && season) {
    seasonToSource[season].push(sourceHash);
  }
});

seasonToSource[1] = _.uniq(seasonToSource[1]);
seasonToSource[2] = _.uniq(seasonToSource[2]);
seasonToSource[3] = _.uniq(seasonToSource[3]);
seasonToSource[4] = _.uniq(seasonToSource[4]);
seasonToSource[5] = _.uniq(seasonToSource[5]);
seasonToSource[6] = _.uniq(seasonToSource[6]);
seasonToSource[7] = _.uniq(seasonToSource[7]);

// Now to verify there are no intersections if intersections remove source from seasonToSource
// put these into notSeasonallyUnique.json so we do not process these sources or items again

intersections = [];
for (var i = 1; i < 7; i++) {
  for (var j = 1; j < 7; j++) {
    if (i === j) {
      continue;
    }
    intersections.push(_.intersection(seasonToSource[i], seasonToSource[j]));
  }
}

const notSeasonallyUnique = _.uniq(_.flatten(intersections));

writeFilePretty('seasonToSource.json', seasonToSource);
