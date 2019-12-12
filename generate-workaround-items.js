const { writeFile, getMostRecentManifest } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

const itemReplacementTable = {};

Object.values(inventoryItems).forEach((item) => {
  if (
    item.itemCategoryHashes &&
    item.itemCategoryHashes.includes(1) &&
    item.collectibleHash &&
    collectibles[item.collectibleHash] &&
    collectibles[item.collectibleHash].sourceHash === 1618754228
  ) {
    const badItem = Object.values(inventoryItems).find(
      (correspondingItem) =>
        correspondingItem.hash !== item.hash &&
        correspondingItem.displayProperties.name === item.displayProperties.name
    );
    if (badItem) {
      itemReplacementTable[badItem.hash] = item.hash;
    }
  }
});

writeFile('./output/item-def-workaround-replacements.json', itemReplacementTable);
