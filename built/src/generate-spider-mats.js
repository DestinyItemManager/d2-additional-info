'use strict';
exports.__esModule = true;
var node_1 = require('destiny2-manifest/node');
var helpers_1 = require('./helpers');
node_1.loadLocal();
var inventoryItems = node_1.getAll('DestinyInventoryItemDefinition');
var spiderMatsWithIndex = [];
var spiderMats = [];
var debug = false;
var spiderMatsCategoryHash = 2088636411;
inventoryItems.forEach(function (inventoryItem) {
  var hash = inventoryItem.hash,
    index = inventoryItem.index;
  var categoryHashes = inventoryItem.itemCategoryHashes || [];
  var _a = inventoryItem.inventory,
    tierType = _a.tierType,
    maxStackSize = _a.maxStackSize,
    stackUniqueLabel = _a.stackUniqueLabel;
  var name = inventoryItem.displayProperties.name;
  if (
    categoryHashes.includes(spiderMatsCategoryHash) &&
    maxStackSize === 9999 &&
    tierType === 3 &&
    !stackUniqueLabel &&
    !name.includes('Token') &&
    !name.includes('Gunsmith')
  ) {
    spiderMatsWithIndex.push({
      hash: hash,
      index: index % 10 === 2 ? index + 16 : index,
      itemName: name,
    });
  }
});
spiderMatsWithIndex.sort(function (a, b) {
  return a.index > b.index ? 1 : -1;
});
if (debug) console.log(spiderMatsWithIndex);
/*
This is the sort we want, based on season and location.

hash       | name             | season | location | index |
-----------|------------------|--------|----------|-------|
950899352  | dusklight shard  | 1      | edz      | 1835  |
2014411539 | alkane dust      | 1      | titan    | 1838  |
3487922223 | datalattice      | 1      | nessus   | 1847  |*
1305274547 | phaseglass       | 1      | io       | 1832  |
49145143   | sim seed         | 2      | mercury  | 3571  |
31293053   | seraphite        | 3      | mars     | 4660  |
1177810185 | etheric spiral   | 4      | tangled  | 5894  |
592227263  | baryon bough     | 4      | dreaming | 5892  |*
3592324052 | helium filaments | 8      | moon     | 10792 |

* are incorrectly sorted via index; adding 16 to any index that ends in 2 solves this...

*/
Object.values(spiderMatsWithIndex).forEach(function (item) {
  spiderMats.push(item.hash);
});
if (debug) console.log(spiderMats);
helpers_1.writeFile('./output/spider-mats.json', spiderMats);
