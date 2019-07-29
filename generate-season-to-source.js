const { getCurrentSeason, writeFilePretty, getMostRecentManifest } = require('./helpers.js');
const seasonsMaster = require('./data/seasons/seasons_master.json');
const calculatedSeason = getCurrentSeason();

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

// init an array in seasonNumbers for each season
const seasonNumbers = [...Array(calculatedSeason + 1).keys()].slice(1);
const seasonToSource = {};
const itemSource = {};
seasonNumbers.forEach((num) => (seasonToSource[num] = []));

// loop through collectibles
Object.values(inventoryItems).forEach(function(item) {
  const sourceHash = item.collectibleHash ? collectibles[item.collectibleHash].sourceHash : null;
  const season = seasonsMaster[item.hash];
  if (sourceHash && season) {
    seasonToSource[season].push(sourceHash);
    itemSource[item.hash] = sourceHash;
  }
});

// uniq each season's collectibles
seasonNumbers.forEach((season) => (seasonToSource[season] = [...new Set(seasonToSource[season])]));

// Now to verify there are no intersections; if intersections remove source from seasonToSource

// notSeasonallyUnique contains sourceHashes which correspond to items in more than 1 season
let notSeasonallyUnique = [];
seasonNumbers.forEach((season_a) => {
  seasonNumbers.forEach((season_b) => {
    if (season_a < season_b)
      notSeasonallyUnique = notSeasonallyUnique.concat(
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

const categoryBlacklist = [
  16, // Quest Steps
  18, // Currencies
  34, // Engrams
  40, // Material
  53, // Quests
  58, // Clan Banner
  268598612, // Packages
  303512563, // Bonus Mods
  444756050, // Weapon Mods: Bow strings
  945330047, // Weapon Mods: Gameplay
  1334054322, // Weapon Mods: Batteries
  1449602859, // Ghost Mods
  1576735337, // Clan Banner: Perks
  1709863189, // Weapon Mods: Sword Blades
  1784235469, // Bounties
  2005599723, // Prophecy Offerings
  2076918099, // Weapon Mods: Launch Tubes
  2150402250, // Gags
  2237038328, // Weapon Mods: Intrinsic
  2250046497, // Prophecy Tablets
  2253669532, // Treasure Maps
  2411768833, // Weapon Mods: Scopes
  2423200735, // Item Sets
  3055157023, // Weapon Mods: Stocks
  3072652064, // Weapon Mods: Sword Guards
  3085181971, // Weapon Mods: Barrels
  3109687656, // Dummies
  3360831066, // Weapon Mods: Arrows
  3708671066, // Weapon Mods: Frames
  3836367751, // Weapon Mods: Grips
  3866509906, // Weapon Mods: Sights
  4184407433 // Weapon Mods: Magazines
];

const seasonToSourceOutput = {};
seasonToSourceOutput.seasons = seasonToSource;
seasonToSourceOutput.categoryBlacklist = categoryBlacklist;

writeFilePretty('./output/seasonToSource.json', seasonToSourceOutput);

const seasons = {};

Object.values(inventoryItems).forEach(function(item) {
  const categoryHashes = item.itemCategoryHashes || [];
  const seasonBlacklisted = categoryBlacklist.filter((hash) => categoryHashes.includes(hash))
    .length;
  if (
    (notSeasonallyUnique.includes(itemSource[item.hash]) || !itemSource[item.hash]) &&
    !seasonBlacklisted &&
    (item.itemTypeDisplayName || categoryHashes.length)
  ) {
    seasons[item.hash] = seasonsMaster[item.hash];
  }
});

writeFilePretty('./output/seasons.json', seasons);
