const { writeFile, getMostRecentManifest, isEqual } = require('./helpers.js');
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);
const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

missingCollectibleHashes = {};

// Every Inventory Item without a collectible hash
nonCollectibleItems = Object.values(inventoryItems).filter(function(item) {
  if (!item.collectibleHash) {
    return true;
  }
});

// Every Inventory Item with a collectible hash
collectibleItems = Object.values(inventoryItems).filter(function(item) {
  if (item.collectibleHash) {
    return true;
  }
});

Object.values(collectibleItems).forEach(function(item) {
  itemsWithSameName = Object.values(nonCollectibleItems).filter(function(item2) {
    if (
      item.displayProperties.name === item2.displayProperties.name &&
      isEqual(item.itemCategoryHashes, item2.itemCategoryHashes)
    ) {
      return true;
    }
  });
  Object.values(itemsWithSameName).forEach(function(item2) {
    missingCollectibleHashes[item2.hash] = item.collectibleHash;
  });
});

writeFile('./output/missing-collectible-hashes.json', missingCollectibleHashes);
