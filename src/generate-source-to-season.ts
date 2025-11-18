import { getAllDefs, getDef } from '@d2api/manifest-node';
import { ItemCategoryHashes, PlugCategoryHashes } from '../data/generated-enums.js';
import { getCurrentSeason, readJsonFile, writeFile } from './helpers.js';
import { infoLog } from './log.js';

// Read seasons_unfiltered.json at runtime to avoid Node.js module caching issues
// (generate-season-info writes to this file during the same run)
const seasonsUnfiltered = readJsonFile<Record<string, number>>(
  './data/seasons/seasons_unfiltered.json',
);

// Read watermark-to-season.json at runtime to avoid Node.js module caching issues
// (generate-watermark-info writes to this file during the same run)
const seasonWatermarks: Record<string, number> = readJsonFile('./output/watermark-to-season.json');

const TAG = 'SOURCE-SEASON';

let inventoryItems = getAllDefs('InventoryItem');

// init an array in seasonNumbers for each season
const D2CalculatedSeason = getCurrentSeason();
const seasonNumbers = [...Array(D2CalculatedSeason + 1).keys()].slice(1);

const seasonToSource: Record<number, number[]> = {};
seasonNumbers.forEach((num) => (seasonToSource[num] = []));

const itemSource: Record<number, number> = {};

// loop through collectibles
inventoryItems.forEach(function (item) {
  const sourceHash = item.collectibleHash
    ? getDef('Collectible', item.collectibleHash)?.sourceHash
    : null;
  const season = (seasonsUnfiltered as Record<string, number>)[item.hash];
  if (sourceHash && season) {
    (seasonToSource[season] ??= []).push(sourceHash);
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
        seasonToSource[seasonA].filter((hash) => seasonToSource[seasonB].includes(hash)),
      );
    }
  });
});
notSeasonallyUnique = [...new Set(notSeasonallyUnique)];

const categoryDenyList = [
  ItemCategoryHashes.Currencies,
  ItemCategoryHashes.Engrams,
  ItemCategoryHashes.Materials,
  ItemCategoryHashes.ClanBanner,
  ItemCategoryHashes.Packages,
  ItemCategoryHashes.BonusMods,
  ItemCategoryHashes.WeaponModsArrows,
  ItemCategoryHashes.WeaponModsBarrels,
  ItemCategoryHashes.WeaponModsBatteries,
  ItemCategoryHashes.WeaponModsBowstring,
  ItemCategoryHashes.WeaponModsFrame,
  ItemCategoryHashes.WeaponModsGameplay,
  ItemCategoryHashes.WeaponModsGrips,
  ItemCategoryHashes.WeaponModsHafts,
  ItemCategoryHashes.WeaponModsIntrinsic,
  ItemCategoryHashes.WeaponModsLaunchTubes,
  ItemCategoryHashes.WeaponModsMagazines,
  ItemCategoryHashes.WeaponModsOriginTraits,
  ItemCategoryHashes.WeaponModsScopes,
  ItemCategoryHashes.WeaponModsSights,
  ItemCategoryHashes.WeaponModsStocks,
  ItemCategoryHashes.WeaponModsSwordBlades,
  ItemCategoryHashes.WeaponModsSwordGuards,
  ItemCategoryHashes.GhostMods,
  ItemCategoryHashes.ClanBannersPerks,
  ItemCategoryHashes.ProphecyOfferings,
  ItemCategoryHashes.GagPrizes,
  ItemCategoryHashes.ProphecyTablets,
  ItemCategoryHashes.TreasureMaps,
  ItemCategoryHashes.ItemSets,
  ItemCategoryHashes.Dummies,
  ItemCategoryHashes.Bounties,
  ItemCategoryHashes.QuestStep,
  ItemCategoryHashes.Quest,
  ItemCategoryHashes.SubclassMods,
  ItemCategoryHashes.MasterworksMods,
  ItemCategoryHashes.WeaponModsDamage,
];

const plugCategoryDenyList = [
  PlugCategoryHashes.BuildPerk, // deprecated armor perks
  PlugCategoryHashes.AmmoPerk, // deprecated armor perks
  'enhancements', // armor mods
  'plugs.masterworks', // Y1 masterworks
  'plugs.weapons.masterworks.stat', // weapon masterwork plugs
  'plugs.armor.masterworks.stat', // armor masterwork plugs
  PlugCategoryHashes.Intrinsics,
];

// FIXME use TraitHashes enum when it exists
const traitDenyList = ['item.engram', 'item.exotic_catalyst'];

const itemTypeDenyList = [
  'Enhanced Origin Trait', // ???
  'Enhanced Trait',
];

const seasons: Record<number, number> = {};

// Filter out all items that have SEASONAL watermarks
const seasonWatermarksKeys = Object.keys(seasonWatermarks);
inventoryItems = inventoryItems.filter((o) => {
  const currentItemWatermarks = [
    ...(o.quality?.displayVersionWatermarkIcons ?? ''),
    o.iconWatermark,
    o.iconWatermarkShelved,
  ];
  return !currentItemWatermarks.some((watermark) => seasonWatermarksKeys.includes(watermark));
});

inventoryItems.forEach((item) => {
  const categoryHashes = item.itemCategoryHashes || [];
  const seasonDenied = categoryDenyList.some((hash) => categoryHashes.includes(hash));
  const categoryDenied =
    item.plug &&
    plugCategoryDenyList.some((pc) =>
      typeof pc === 'string'
        ? item.plug!.plugCategoryIdentifier.includes(pc)
        : item.plug!.plugCategoryHash === pc,
    );
  const traitDenied = traitDenyList.some((trait) => item.traitIds?.includes(trait));
  const itemTypeDenied = itemTypeDenyList.some((itemType) => item.itemTypeDisplayName === itemType);
  if (
    !categoryDenied &&
    !seasonDenied &&
    !traitDenied &&
    !itemTypeDenied &&
    (item.itemTypeDisplayName || categoryHashes.length) &&
    (notSeasonallyUnique.includes(itemSource[item.hash]) || !itemSource[item.hash])
  ) {
    seasons[item.hash] = (seasonsUnfiltered as Record<string, number>)[item.hash];
  }
});

const seasonsClean = removeItemsNoLongerInManifest(seasons);

writeFile('./output/seasons.json', seasonsClean);

const seasonToSourceV2: Record<number, number[]> = {};
seasonNumbers.forEach((num) => (seasonToSourceV2[num] = []));

// loop through collectibles
inventoryItems.forEach(function (item) {
  const sourceHash = item.collectibleHash
    ? getDef('Collectible', item.collectibleHash)?.sourceHash
    : null;
  const season = (seasonsUnfiltered as Record<string, number>)[item.hash];
  if (sourceHash && season) {
    (seasonToSourceV2[season] ??= []).push(sourceHash);
  }
});

// remove entries in notSeasonallyUnique from seasonToSource
seasonNumbers.forEach((season) => {
  seasonToSourceV2[season].sort(function (a, b) {
    return a - b;
  });
  seasonToSourceV2[season] = seasonToSourceV2[season].filter(
    (hash) => !notSeasonallyUnique.includes(hash),
  );
});

const sources: Record<number, number> = {};
for (const season in seasonToSourceV2) {
  for (const source of seasonToSourceV2[season]) {
    sources[source] = Number(season);
  }
}

writeFile('./output/season-to-source.json', { sources }, true);
writeFile('./output/source-to-season-v2.json', sources, true);

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

  infoLog(TAG, `${matches} matches out of ${hashesSeason.length} hashes.`);
  infoLog(TAG, `Deleted ${deleted} items.`);
  return seasons;
}
