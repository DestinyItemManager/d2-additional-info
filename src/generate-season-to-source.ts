import { get, getAll, loadLocal } from 'destiny2-manifest/node';
import { D2CalculatedSeason } from '../data/seasons/d2-season-info';
import { writeFile } from './helpers';

import seasonsUnfiltered from '../data/seasons/seasons_unfiltered.json';

loadLocal();
const inventoryItems = getAll('DestinyInventoryItemDefinition');

// init an array in seasonNumbers for each season
const seasonNumbers = [...Array(D2CalculatedSeason + 1).keys()].slice(1);

const seasonToSource: Record<number, number[]> = {};
seasonNumbers.forEach((num) => (seasonToSource[num] = []));

const itemSource: Record<number, number> = {};

// loop through collectibles
inventoryItems.forEach(function (item) {
  const sourceHash = item.collectibleHash
    ? get('DestinyCollectibleDefinition', item.collectibleHash)?.sourceHash
    : null;
  const season = (seasonsUnfiltered as Record<string, number>)[item.hash];
  if (sourceHash && season) {
    seasonToSource[season].push(sourceHash);
    itemSource[item.hash] = sourceHash;
  }
});

// uniq each season's collectibles
seasonNumbers.forEach((season) => (seasonToSource[season] = [...new Set(seasonToSource[season])]));

// Now to verify there are no intersections; if intersections remove source from seasonToSource

// notSeasonallyUnique contains sourceHashes which correspond to items in more than 1 season
let notSeasonallyUnique: number[] = [];
seasonNumbers.forEach((seasonA) => {
  seasonNumbers.forEach((seasonB) => {
    if (seasonA < seasonB) {
      notSeasonallyUnique = notSeasonallyUnique.concat(
        seasonToSource[seasonA].filter((hash) => seasonToSource[seasonB].includes(hash))
      );
    }
  });
});
notSeasonallyUnique = [...new Set(notSeasonallyUnique)];

// remove entries in notSeasonallyUnique from seasonToSource
seasonNumbers.forEach((season) => {
  seasonToSource[season].sort(function (a, b) {
    return a - b;
  });
  seasonToSource[season] = seasonToSource[season].filter(
    (hash) => !notSeasonallyUnique.includes(hash)
  );
});

const categoryDenyList = [
  18, // Currencies
  34, // Engrams
  40, // Material
  58, // Clan Banner
  268598612, // Packages
  303512563, // Bonus Mods
  444756050, // Weapon Mods: Bow strings
  945330047, // Weapon Mods: Gameplay
  1334054322, // Weapon Mods: Batteries
  1449602859, // Ghost Mods
  1576735337, // Clan Banner: Perks
  1709863189, // Weapon Mods: Sword Blades
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
  4184407433, // Weapon Mods: Magazines
];

const sources: Record<number, number> = {};
for (const season in seasonToSource) {
  for (const source of seasonToSource[season]) {
    sources[source] = Number(season);
  }
}

const seasonToSourceOutput = {
  categoryDenyList: categoryDenyList,
  sources: sources,
};

writeFile('./output/season-to-source.json', seasonToSourceOutput);

const seasons: Record<number, number> = {};

inventoryItems.forEach((item) => {
  const categoryHashes = item.itemCategoryHashes || [];
  const seasonDenied = categoryDenyList.filter((hash) => categoryHashes.includes(hash)).length;
  if (
    (notSeasonallyUnique.includes(itemSource[item.hash]) || !itemSource[item.hash]) &&
    !seasonDenied &&
    (item.itemTypeDisplayName || categoryHashes.length)
  ) {
    seasons[item.hash] = (seasonsUnfiltered as Record<string, number>)[item.hash];
  }
});

const seasonsClean = removeItemsNoLongerInManifest(seasons);

writeFile('./output/seasons.json', seasonsClean);

function removeItemsNoLongerInManifest(seasons: Record<number, number>) {
  const hashesManifest: string[] = [];
  const hashesSeason: string[] = [];
  let deleted = 0;
  let matches = 0;

  Object.values(inventoryItems).forEach((item) => {
    hashesManifest.push(String(item.hash));
  });

  Object.keys(seasons).forEach((hash) => {
    hashesSeason.push(hash);
  });

  hashesSeason.forEach((hash) => {
    if (hashesManifest.includes(hash)) {
      matches++;
    } else {
      deleted++;
      delete seasons[Number(hash)];
    }
  });

  console.log(`${matches} matches out of ${hashesSeason.length} hashes.`);
  console.log(`Deleted ${deleted} items.`);
  return seasons;
}
