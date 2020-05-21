import { getAll, loadLocal } from 'destiny2-manifest/node';

import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2';
import { writeFile } from './helpers';

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

// known mods specifically corresponding to seasons that i hope won't somehow change
const seasonNumberByExampleMod: Record<string, number> = {
  'Taken Armaments': 4,
  'Fallen Armaments': 5,
  'Hive Armaments': 7,
  'Relay Defender': 8,
  'Stacks on Stacks': 9,
  'Blessing of Rasputin': 10
};

// about these hashes:
// modslots themselves have no special slot affinity information.
// mods expose a hash, corresponding to no particular definition,
// that determines where they can end up. so in DIM, we determine a modslot's type
// by looking at the compatibility hash (plugCategoryHash) of the mod inside it.
// this works on empty slots because "empty [season] socket" is also actually a mod.

// this script generates a data structure that looks like:
// {
//   [key:numberstring]:{
//      tag:string,
//      thisSlotPlugCategoryHashes:number[],
//      compatiblePlugCategoryHashes:number[],
//      compatibleTags:string[]
//   }
// }
//
// i.e.:
// {
//   "720857": {
//     "tag": "forge",
//     "thisSlotPlugCategoryHashes": [65589297],
//     "compatiblePlugCategoryHashes": [2149155760, 13646368, 65589297]
//     "compatibleTags": ["outlaw"]
//   },
interface ModslotMetadata {
  tag: string;
  thisSlotPlugCategoryHashes: number[];
  compatiblePlugCategoryHashes: number[];
  compatibleTags: string[];
  season: number;
  emptyModSocketHashes: number[];
}
// anyway,
let modMetadataBySlotTag: Record<string, ModslotMetadata> = {};

/** converts season number into example plugCategoryHash */
const modTypeExampleHashesBySeason: Record<number, number> = {};

// since i don't want to assume item hashes won't change, we look for some specific (y3-style) mods by name
inventoryItems.forEach((item) => {
  if (
    item.collectibleHash && // having a collectibleHash excludes the consumable (y2) mods
    isSpecialtyMod(item) &&
    item.displayProperties.name in seasonNumberByExampleMod // looking for only the specific mods listed above
  ) {
    const modSeason = seasonNumberByExampleMod[item.displayProperties.name];
    if (!modTypeExampleHashesBySeason[modSeason])
      modTypeExampleHashesBySeason[modSeason] = item.plug.plugCategoryHash;
  }
});
// the point of the above was to get an example compatibility hash for each Season (4, 5, 7, 8, 9, etc)
// this way we can identify the gathered compatibility hashes by season, to do the whole
// "one season before, one season after" thing

// /////////////////
// the goal is to index our final output by "empty slot" hash,
// but the thing they all have in common is itemTypeDisplayName
// so we index by that temporarily
// and later swap keys (itemTypeDisplayName) for emptySlotItemHash
inventoryItems.forEach((item) => {
  if (isSpecialtyMod(item)) {
    const displayName = modShortName(item);
    if (!(displayName in modMetadataBySlotTag)) {
      modMetadataBySlotTag[displayName] = {
        season: 0,
        tag: modShortName(item),
        compatibleTags: [],
        thisSlotPlugCategoryHashes: [],
        compatiblePlugCategoryHashes: [],
        emptyModSocketHashes: []
      } as ModslotMetadata;
    }
    if (
      !modMetadataBySlotTag[displayName].thisSlotPlugCategoryHashes.includes(
        item.plug.plugCategoryHash
      )
    ) {
      modMetadataBySlotTag[displayName].thisSlotPlugCategoryHashes.push(item.plug.plugCategoryHash);
    }

    // we do special processing if one of the mods we looped through is an "empty slot" plug.
    // from this mod's description, we can determine the "also compatible" seasons
    // we need to finish collecting all hashes before we resolves seasons into groups of hashes,
    // so for now, we stick season numbers instead of mod hashes, into compatiblePlugCategoryHashes
    if (item.displayProperties.name === 'Empty Mod Socket') {
      // generate extra compatible seasons info
      const matches = item.displayProperties.description.match(/\b\d+\b/g);
      if (matches)
        modMetadataBySlotTag[displayName].compatiblePlugCategoryHashes = matches.map((n) =>
          Number(n)
        );
    }

    if (
      item.displayProperties.name === 'Empty Mod Socket' ||
      item.displayProperties.name === "Riven's Curse"
    ) {
      // generate initial mod info
      if (!modMetadataBySlotTag[displayName].emptyModSocketHashes.includes(item.hash))
        modMetadataBySlotTag[displayName].emptyModSocketHashes.push(item.hash);
    }

    // if it's one of those example mods from earlier, we can now insert the season number into the metadata object
    if (item.collectibleHash && item.displayProperties.name in seasonNumberByExampleMod)
      modMetadataBySlotTag[displayName].season = Number(
        Object.entries(modTypeExampleHashesBySeason).find(
          ([, pch]) => pch === item.plug.plugCategoryHash
        )![0]
      );
  }
});

// after this, we are done treating modMetadataBySlotTag like an object, accessing it by itemTypeDisplayName
// and want to loop over its values and do stuff to them, so we turn into into an array and sort it by season
const modMetadataBySlotTagV2 = Object.values(modMetadataBySlotTag).sort(
  (a, b) => a.season - b.season
);

// we loop back through all the compatiblePlugCategoryHashes and turn their season #s into that season's compatibility hashes
for (const modMetadataEntry of modMetadataBySlotTagV2) {
  let allCompatibleSlotHashes: ModslotMetadata['compatiblePlugCategoryHashes'] = [];
  modMetadataEntry.compatiblePlugCategoryHashes.forEach((seasonNumber) => {
    const modMetadataForThisSeasonNumber = Object.values(
      modMetadataBySlotTag
    ).find((singleModMetadata) =>
      singleModMetadata.thisSlotPlugCategoryHashes.includes(
        modTypeExampleHashesBySeason[seasonNumber]
      )
    );
    const modTypesForThisSeasonNumber =
      modMetadataForThisSeasonNumber && modMetadataForThisSeasonNumber.thisSlotPlugCategoryHashes;
    if (modTypesForThisSeasonNumber)
      allCompatibleSlotHashes = [...allCompatibleSlotHashes, ...modTypesForThisSeasonNumber];
  });
  modMetadataEntry.compatiblePlugCategoryHashes = allCompatibleSlotHashes;
}

// fill in compatibleTags
for (const modMetadataEntry of modMetadataBySlotTagV2) {
  modMetadataEntry.compatibleTags = Object.values(modMetadataBySlotTag)
    .filter((singleModMetadata) =>
      singleModMetadata.compatiblePlugCategoryHashes.some((compat) =>
        modMetadataEntry.thisSlotPlugCategoryHashes.includes(compat)
      )
    )
    .sort((mod1, mod2) => mod1.season - mod2.season)
    .map((singleModMetadata) => singleModMetadata.tag);
}

writeFile('./output/specialty-modslot-metadata.json', modMetadataBySlotTagV2);

function isSpecialtyMod(item: DestinyInventoryItemDefinition) {
  return (
    item.itemCategoryHashes &&
    item.itemCategoryHashes.includes(59) &&
    item.plug &&
    (item.plug.plugCategoryIdentifier.includes('enhancements.season_') ||
      item.plug.plugCategoryIdentifier.includes('enhancements.rivens_curse') ||
      item.plug.plugCategoryIdentifier.includes('enhancements.activity'))
  );
}

function modShortName(item: DestinyInventoryItemDefinition) {
  return item.itemTypeDisplayName.toLowerCase().split(' ')[0];
}
