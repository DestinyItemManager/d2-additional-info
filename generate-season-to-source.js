const { getCurrentSeason, writeFilePretty, getMostRecentManifest } = require('./helpers.js');
const seasonsMaster = require('./data/seasons_master.json');
const calculatedSeason = getCurrentSeason();

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

// init an array in seasonNumbers for each season
const seasonNumbers = [...Array(calculatedSeason + 1).keys()].slice(1);
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
seasonNumbers.forEach((season) => (seasonToSource[season] = [...new Set(seasonToSource[season])]));

// Now to verify there are no intersections if intersections remove source from seasonToSource
// put these into notSeasonallyUnique.json so we do not process these sources or items again

// notSeasonallyUnique contains sourceHashes which correspond to items in more than 1 season
let notSeasonallyUnique = [];
seasonNumbers.forEach((season_a) => {
  seasonNumbers.forEach((season_b) => {
    if (season_a !== season_b)
      notSeasonallyUnique.concat(
        seasonToSource[season_a].filter((hash) => seasonToSource[season_b].includes(hash))
      );
  });
});
notSeasonallyUnique = [...new Set(notSeasonallyUnique)];

// remove entries in notSeasonallyUnique from seasonToSource
seasonNumbers.forEach((season) => {
  seasonToSource[season] = seasonToSource[season].filter(
    (hash) => !notSeasonallyUnique.includes(hash)
  );
});

writeFilePretty('seasonToSource.json', seasonToSource);
