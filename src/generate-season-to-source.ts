import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { D2CalculatedSeason } from '../data/seasons/d2-season-info.js';
import seasonsUnfiltered from '../data/seasons/seasons_unfiltered.json';
import { writeFile } from './helpers.js';

loadLocal();

let inventoryItems = getAll('DestinyInventoryItemDefinition');

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
  ItemCategoryHashes.Currencies,
  ItemCategoryHashes.Engrams,
  ItemCategoryHashes.Materials,
  ItemCategoryHashes.ClanBanner,
  ItemCategoryHashes.Packages,
  ItemCategoryHashes.BonusMods,
  ItemCategoryHashes.WeaponModsBowstring,
  ItemCategoryHashes.WeaponModsGameplay,
  ItemCategoryHashes.WeaponModsBatteries,
  ItemCategoryHashes.GhostMods,
  ItemCategoryHashes.ClanBannersPerks,
  ItemCategoryHashes.WeaponModsSwordBlades,
  ItemCategoryHashes.ProphecyOfferings,
  ItemCategoryHashes.WeaponModsLaunchTubes,
  ItemCategoryHashes.GagPrizes,
  ItemCategoryHashes.WeaponModsIntrinsic,
  ItemCategoryHashes.ProphecyTablets,
  ItemCategoryHashes.TreasureMaps,
  ItemCategoryHashes.WeaponModsScopes,
  ItemCategoryHashes.ItemSets,
  ItemCategoryHashes.WeaponModsStocks,
  ItemCategoryHashes.WeaponModsSwordGuards,
  ItemCategoryHashes.WeaponModsBarrels,
  ItemCategoryHashes.Dummies,
  ItemCategoryHashes.WeaponModsArrows,
  ItemCategoryHashes.WeaponModsFrame,
  ItemCategoryHashes.WeaponModsGrips,
  ItemCategoryHashes.WeaponModsSights,
  ItemCategoryHashes.WeaponModsMagazines,
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

inventoryItems = inventoryItems.filter(
  (o) =>
    o.quality?.displayVersionWatermarkIcons === undefined ||
    o.quality?.displayVersionWatermarkIcons.includes('')
);

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
