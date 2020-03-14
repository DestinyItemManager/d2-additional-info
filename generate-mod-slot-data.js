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

const modMetadataBySlotTag = {};
const modTypeExampleHashesBySeason = {};

Object.values(inventoryItems).forEach((item) => {
  if (
    item.collectibleHash && // having a collectibleHash excludes the consumable mods
    isSpecialtyMod(item) &&
    item.displayProperties.name in seasonNumberByExampleMod // looking for only the specific mods listed above
  ) {
    const modSeason = seasonNumberByExampleMod[item.displayProperties.name];
    if (!modTypeExampleHashesBySeason[modSeason])
      modTypeExampleHashesBySeason[modSeason] = item.plug.plugCategoryHash;
    // if (!modTypeExampleHashesBySeason[modSeason].includes(item.plug.plugCategoryHash)) {
    //   modTypeExampleHashesBySeason[modSeason].push(item.plug.plugCategoryHash);
    // }
    // seasonsByModTypeHash[item.plug.plugCategoryHash] = modSeason;
  }
});

Object.values(inventoryItems).forEach((item) => {
  if (isSpecialtyMod(item)) {
    const shortName = item.itemTypeDisplayName.toLowerCase().split(' ')[0];
    if (!(shortName in modMetadataBySlotTag)) {
      modMetadataBySlotTag[shortName] = {
        thisSlotPlugCategoryHashes: [],
        compatiblePlugCategoryHashes: []
      };
    }
    if (
      !modMetadataBySlotTag[shortName].thisSlotPlugCategoryHashes.includes(
        item.plug.plugCategoryHash
      )
    ) {
      modMetadataBySlotTag[shortName].thisSlotPlugCategoryHashes.push(item.plug.plugCategoryHash);
    }
    if (item.displayProperties.name === 'Empty Mod Socket') {
      const matches = item.displayProperties.description.match(/\b\d+\b/g);
      if (matches)
        modMetadataBySlotTag[shortName].compatiblePlugCategoryHashes = matches.map((n) =>
          Number(n)
        );
      // else console.log(item.hash, item.displayProperties.name,JSON.stringify(item.displayProperties.description))
    }
  }
});
for (tag in modMetadataBySlotTag) {
  let allCompatibleSlotHashes = [];
  modMetadataBySlotTag[tag].compatiblePlugCategoryHashes.forEach((seasonNumber) => {
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
  modMetadataBySlotTag[tag].compatiblePlugCategoryHashes = allCompatibleSlotHashes;
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
