const { writeFile, getMostRecentManifest } = require('./helpers.js');
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);
const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

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

missingCollectibleHashes = {};

Object.values(collectibleItems).forEach(function(item) {
  // itemCategoryHashes may be missing on classified objects
  collectibleHash = item.collectibleHash;
  itemsWithSameName = Object.values(nonCollectibleItems).filter(function(item2) {
    if (
      item.displayProperties.name === item2.displayProperties.name &&
      JSON.stringify(item.itemCategoryHashes) === JSON.stringify(item2.itemCategoryHashes)
    ) {
      return true;
    }
  });
  // console.log(itemsWithSameName);
  Object.values(itemsWithSameName).forEach(function(item2) {
    missingCollectibleHashes[item2.hash] = collectibleHash;
  });
});

writeFile('./output/missing-collectible-hashes.json', missingCollectibleHashes);
