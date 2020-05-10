const { writeFile, getMostRecentManifest } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const spiderMatsWithIndex = [];
const spiderMats = [];
const debug = false;
const spiderMatsCategoryHash = 2088636411;

Object.keys(inventoryItem).forEach(function(key) {
  const hash = inventoryItem[key].hash;
  const categoryHashes = inventoryItem[key].itemCategoryHashes || [];
  const tier = inventoryItem[key].inventory.tierType;
  const maxStackSize = inventoryItem[key].inventory.maxStackSize;
  const name = inventoryItem[key].displayProperties.name;
  const stackLabel = inventoryItem[key].inventory && inventoryItem[key].inventory.stackUniqueLabel;
  const sortedLocation = inventoryItem[key].index;
  if (
    categoryHashes.includes(spiderMatsCategoryHash) &&
    maxStackSize === 9999 &&
    tier === 3 &&
    !stackLabel &&
    !name.includes('Token') &&
    !name.includes('Gunsmith')
  ) {
    spiderMatsWithIndex.push({
      hash: hash,
      index: sortedLocation % 10 === 2 ? sortedLocation + 16 : sortedLocation,
      itemName: name
    });
  }
});

spiderMatsWithIndex.sort((a, b) => (a.index > b.index ? 1 : -1));
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

Object.values(spiderMatsWithIndex).forEach((item) => {
  spiderMats.push(item.hash);
});

if (debug) console.log(spiderMats);

writeFile('./output/spider-mats.json', spiderMats);
