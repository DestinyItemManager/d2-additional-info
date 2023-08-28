import { getAllDefs, getDef } from '@d2api/manifest-node';
import { ItemCategoryHashes, PlugCategoryHashes } from '../data/generated-enums.js';
import seasonsUnfiltered from '../data/seasons/seasons_unfiltered.json' assert { type: 'json' };
import { D2CalculatedSeason } from './generate-season-info.js';
import { writeFile } from './helpers.js';

let inventoryItems = getAllDefs('InventoryItem');

// init an array in seasonNumbers for each season
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

const sources: Record<number, number> = {};
for (const season in seasonToSource) {
  for (const source of seasonToSource[season]) {
    sources[source] = Number(season);
  }
}

const seasonToSourceOutput = {
  sources: sources,
};

writeFile('./output/season-to-source.json', seasonToSourceOutput, true);

const seasons: Record<number, number> = {};

inventoryItems = inventoryItems.filter(
  (o) =>
    o.quality?.displayVersionWatermarkIcons === undefined ||
    o.quality?.displayVersionWatermarkIcons.includes('')
);

inventoryItems.forEach((item) => {
  const categoryHashes = item.itemCategoryHashes || [];
  const seasonDenied = categoryDenyList.some((hash) => categoryHashes.includes(hash));
  const categoryDenied =
    item.plug &&
    plugCategoryDenyList.some((pc) =>
      typeof pc === 'string'
        ? item.plug!.plugCategoryIdentifier.includes(pc)
        : item.plug!.plugCategoryHash === pc
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
