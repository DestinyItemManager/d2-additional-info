'use strict';
exports.__esModule = true;
var node_1 = require('destiny2-manifest/node');
var helpers_1 = require('./helpers');
node_1.loadLocal();
var inventoryItems = node_1.getAll('DestinyInventoryItemDefinition');
var collectibles = node_1.getAll('DestinyCollectibleDefinition');
var itemReplacementTable = {};
Object.values(inventoryItems).forEach(function (item) {
  var _a;
  if (
    ((_a = item.itemCategoryHashes) === null || _a === void 0 ? void 0 : _a.includes(1)) &&
    item.collectibleHash &&
    collectibles[item.collectibleHash] &&
    (collectibles[item.collectibleHash].sourceHash === 1618754228 ||
      collectibles[item.collectibleHash].sourceHash === 2627087475)
  ) {
    var badItem = Object.values(inventoryItems).find(function (correspondingItem) {
      return (
        correspondingItem.hash !== item.hash &&
        correspondingItem.displayProperties.name === item.displayProperties.name &&
        correspondingItem.inventory.bucketTypeHash === 2422292810
      );
    });
    if (badItem) {
      itemReplacementTable[badItem.hash] = item.hash;
    }
  }
});
helpers_1.writeFile('./output/item-def-workaround-replacements.json', itemReplacementTable);
