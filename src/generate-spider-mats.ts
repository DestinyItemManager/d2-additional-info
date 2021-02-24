import { get, getAll, loadLocal } from '@d2api/manifest/node';
import { ItemCategoryHashes } from '../data/generated-enums';
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

inventoryItems.forEach((inventoryItem) => {
  const { hash, index } = inventoryItem;
  const categoryHashes = inventoryItem.itemCategoryHashes || [];
  const { tierType, maxStackSize, stackUniqueLabel } = inventoryItem.inventory ?? {};
  const name = inventoryItem.displayProperties.name;

  if (
    categoryHashes.includes(ItemCategoryHashes.ReputationTokens) &&
    maxStackSize === 9999 &&
    tierType === 3 &&
    !stackUniqueLabel &&
    !name.includes('Token') &&
    !name.includes('Gunsmith') &&
    !name.includes('Recon Data')
  ) {
    spiderMatsWithIndex.push({
      hash: hash,
      index: hash === 1305274547 || hash === 592227263 ? index + 16 : index,
      itemName: name,
    });
  }
});

spiderMatsWithIndex.sort((a, b) => (a.index > b.index ? 1 : -1));
if (debug) {
  console.log(spiderMatsWithIndex);
}

/*
This is the sort we want, based on season and location.

hash       | name             | season | location | index |
-----------|------------------|--------|----------|-------|
950899352  | dusklight shard  | 1      | edz      | 2513  |
2014411539 | alkane dust      | 1      | titan    | 2516  |
3487922223 | datalattice      | 1      | nessus   | 2524  |
1305274547 | phaseglass       | 1      | io       | 2510  | *
49145143   | sim seed         | 2      | mercury  | 3706  |
31293053   | seraphite        | 3      | mars     | 4590  |
1177810185 | etheric spiral   | 4      | tangled  | 5791  |
592227263  | baryon bough     | 4      | dreaming | 5789  | *
3592324052 | helium filaments | 8      | moon     | 10368 |
293622383  | spinmetal leaves |        | cosmo    | 12041 |
1485756901 | glacial starwort |        | europa   | 12042 |

*/

Object.values(spiderMatsWithIndex).forEach((item) => {
  spiderMats.push(item.hash);
});

if (debug) {
  console.log(spiderMats);
}

writeFile('./output/spider-mats.json', spiderMats);

const spider = get('DestinyVendorDefinition', 863940356);

const validSpiderCurrencies = [
  ...new Set(
    spider?.itemList.flatMap((i) =>
      i.currencies.map(
        (c) =>
          [
            c.itemHash,
            get('DestinyInventoryItemDefinition', c.itemHash)?.displayProperties.name,
          ] as const
      )
    ) ?? []
  ),
];
const purchaseableCurrencyItems = spider?.itemList.filter((i) => {
  const def = get('DestinyInventoryItemDefinition', i.itemHash)?.displayProperties.name;
  if (
    def?.startsWith('Purchase ') &&
    validSpiderCurrencies.find(
      ([, matName]) =>
        matName?.includes(def.replace('Purchase ', '')) || (matName && def.includes(matName))
    )
  ) {
    return true;
  }
});
const purchaseableMatTable: NodeJS.Dict<number> = {};
purchaseableCurrencyItems?.forEach((i) => {
  const def = get('DestinyInventoryItemDefinition', i.itemHash)!.displayProperties.name;
  purchaseableMatTable[i.itemHash] = validSpiderCurrencies.find(
    ([, matName]) =>
      matName?.includes(def.replace('Purchase ', '')) || (matName && def.includes(matName))
  )![0];
});

writeFile('./output/spider-purchaseables-to-mats.json', purchaseableMatTable);
