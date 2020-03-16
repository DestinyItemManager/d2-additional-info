const { writeFile, getMostRecentManifest } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

// known mods specifically corresponding to seasons that i hope won't somehow change
const seasonNumberByExampleMod = {
  'Taken Armaments': 4,
  'Fallen Armaments': 5,
  'Hive Armaments': 7,
  'Relay Defender': 8,
  'Stacks on Stacks': 9,
  'Blessing of Rasputin': 10
};

// about these hashes:
// modslots themselves have no special slot affinity information.
// mods expose a hash, corresponding to no perticular definition,
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

// anyway,
const modMetadataBySlotTag = {};
const modTypeExampleHashesBySeason = {};

// since i don't want to assume itemHashes own't change, we look for some specific (y3) mods by name
Object.values(inventoryItems).forEach((item) => {
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

// the goal is to index our final output by "empty slot" hash,
// but the thing they all have in common is itemTypeDisplayName
// so we index by that temporarily
// and later swap keys (itemTypeDisplayName) for emptySlotItemHash
Object.values(inventoryItems).forEach((item) => {
  if (isSpecialtyMod(item)) {
    const displayName = modShortName(item);
    if (!(displayName in modMetadataBySlotTag)) {
      modMetadataBySlotTag[displayName] = {
        tag: modShortName(item),
        thisSlotPlugCategoryHashes: [],
        compatiblePlugCategoryHashes: [],
        compatibleTags: []
      };
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
      modMetadataBySlotTag[displayName].emptySlotItemHash = item.hash;
      const matches = item.displayProperties.description.match(/\b\d+\b/g);
      console.log(matches);
      if (matches)
        modMetadataBySlotTag[displayName].compatiblePlugCategoryHashes = matches.map((n) =>
          Number(n)
        );
      else
        console.log(
          item.hash,
          item.displayProperties.name,
          JSON.stringify(item.displayProperties.description)
        );
    }
  }
});

// we loop back through all the compatiblePlugCategoryHashes and turn their season #s into that season's compatibility hashes
for (key in modMetadataBySlotTag) {
  let allCompatibleSlotHashes = [];
  modMetadataBySlotTag[key].compatiblePlugCategoryHashes.forEach((seasonNumber) => {
    const modMetadataForThisSeasonNumber = Object.values(modMetadataBySlotTag).find(
      (singleModMetadata) =>
        singleModMetadata.thisSlotPlugCategoryHashes.includes(
          modTypeExampleHashesBySeason[seasonNumber]
        )
    );
    const modTypesForThisSeasonNumber =
      modMetadataForThisSeasonNumber && modMetadataForThisSeasonNumber.thisSlotPlugCategoryHashes;
    if (modTypesForThisSeasonNumber)
      allCompatibleSlotHashes = [...allCompatibleSlotHashes, ...modTypesForThisSeasonNumber];
  });
  modMetadataBySlotTag[key].compatiblePlugCategoryHashes = allCompatibleSlotHashes;
}
for (key in modMetadataBySlotTag) {
  let allCompatibleTags = [];

  Object.values(modMetadataBySlotTag).fifilternd((singleModMetadata) =>
    singleModMetadata.thisSlotPlugCategoryHashes.includes(
      modTypeExampleHashesBySeason[seasonNumber]
    )
  );
  const modTypesForThisSeasonNumber =
    modMetadataForThisSeasonNumber && modMetadataForThisSeasonNumber.thisSlotPlugCategoryHashes;
  if (modTypesForThisSeasonNumber)
    allCompatibleSlotHashes = [...allCompatibleSlotHashes, ...modTypesForThisSeasonNumber];

  modMetadataBySlotTag[key].compatiblePlugCategoryHashes = allCompatibleSlotHashes;
}

writeFile('./output/specialty-modslot-metadata.json', modMetadataBySlotTag);

function isSpecialtyMod(item) {
  return (
    item.itemCategoryHashes &&
    item.itemCategoryHashes.includes(59) &&
    item.plug &&
    (item.plug.plugCategoryIdentifier.includes('enhancements.season_') ||
      item.plug.plugCategoryIdentifier.includes('enhancements.rivens_curse') ||
      item.plug.plugCategoryIdentifier.includes('enhancements.activity'))
  );
}

function modShortName(item) {
  return item.itemTypeDisplayName.toLowerCase().split(' ')[0];
}
