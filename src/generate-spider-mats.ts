import { getAll, loadLocal } from 'destiny2-manifest/node';

import { writeFile } from './helpers';

loadLocal();
const inventoryItems = getAll('DestinyInventoryItemDefinition');

const spiderMatsWithIndex: {
  hash: number;
  index: number;
  itemName: string;
}[] = [];
const spiderMats: number[] = [];
const debug = false;
const spiderMatsCategoryHash = 2088636411;

inventoryItems.forEach((inventoryItem) => {
  const { hash, index } = inventoryItem;
  const categoryHashes = inventoryItem.itemCategoryHashes || [];
  const { tierType, maxStackSize, stackUniqueLabel } = inventoryItem.inventory;
  const name = inventoryItem.displayProperties.name;

  if (
    categoryHashes.includes(spiderMatsCategoryHash) &&
    maxStackSize === 9999 &&
    tierType === 3 &&
    !stackUniqueLabel &&
    !name.match(/(?=.*token)|(?=.*gunsmith)/gi)
  ) {
    spiderMatsWithIndex.push({
      hash: hash,
      index: index % 10 === 2 ? index + 16 : index,
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
