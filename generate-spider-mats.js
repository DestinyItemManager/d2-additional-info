const { writeFile, getMostRecentManifest } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const spiderMats = [];
const spiderMatsCategoryHash = 2088636411;

Object.keys(inventoryItem).forEach(function(key) {
  const hash = inventoryItem[key].hash;
  const categoryHashes = inventoryItem[key].itemCategoryHashes || [];
  const tier = inventoryItem[key].inventory.tierType;
  const maxStackSize = inventoryItem[key].inventory.maxStackSize;
  const name = inventoryItem[key].displayProperties.name;
  if (
    categoryHashes.includes(spiderMatsCategoryHash) &&
    maxStackSize === 9999 &&
    tier === 3 &&
    !name.includes('Token') &&
    !name.includes('Gunsmith')
  ) {
    spiderMats.push(hash);
  }
});

/*
This is the sort we want, based on season and location.

hash       | name             | season | location |
-----------|------------------|--------|----------|
950899352  | dusklight shard  | 1      | edz      |
2014411539 | alkane dust      | 1      | titan    |
3487922223 | datalattice      | 1      | nessus   |
1305274547 | phaseglass       | 1      | io       |
49145143   | sim seed         | 2      | mercury  |
31293053   | seraphite        | 3      | mars     |
1177810185 | etheric spiral   | 4      | tangled  |
592227263  | baryon bough     | 4      | dreaming |
3592324052 | helium filaments | 8      | moon     |

*/

const seasons = require('./data/seasons/seasons_master.json');
let entries = Object.entries(spiderMats);
let sorted = entries.sort((a, b) => a[1] - b[1]);

writeFile('./output/spider-mats.json', spiderMats);
