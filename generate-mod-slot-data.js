const { writeFile, getMostRecentManifest } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

const modTypeHashesByName = {};

Object.values(inventoryItems).forEach((item) => {
  if (
    item.itemCategoryHashes &&
    item.itemCategoryHashes.includes(59) &&
    item.plug &&
    (item.plug.plugCategoryIdentifier.includes('enhancements.season_') ||
      item.plug.plugCategoryIdentifier.includes('enhancements.rivens_curse') ||
      item.plug.plugCategoryIdentifier.includes('enhancements.activity'))
  ) {
    const shortName = item.itemTypeDisplayName.toLowerCase().split(' ')[0];
    if (!(shortName in modTypeHashesByName)) {
      modTypeHashesByName[shortName] = [];
    }
    if (!modTypeHashesByName[shortName].includes(item.plug.plugCategoryHash)) {
      modTypeHashesByName[shortName].push(item.plug.plugCategoryHash);
    }
  }
});

writeFile('./output/seasonal-mod-slots.json', modTypeHashesByName);
