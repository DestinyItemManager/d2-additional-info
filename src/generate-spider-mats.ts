import { get, loadLocal } from '@d2api/manifest/node';
import { writeFile } from './helpers';

loadLocal();

const spiderMatsWithIndex: {
  hash: number;
  index: number;
  itemName: string;
}[] = [];
const spiderMats: number[] = [];

const LEGENDARY_SHARDS_HASH = 1022552290;

const GLIMMER_HASHES = [3159615086, 3664001560];

const spider = get('DestinyVendorDefinition', 863940356);

spider?.itemList
  .flatMap((i) => {
    if (GLIMMER_HASHES.includes(i.itemHash)) {
      if (i.currencies[0].itemHash !== LEGENDARY_SHARDS_HASH) {
        const item = get('DestinyInventoryItemDefinition', i.currencies[0].itemHash);
        const hash = item!.hash;
        const name = item!.displayProperties.name;
        const index = item!.index;
        if (!spiderMatsWithIndex.some((j) => j.hash === hash)) {
          spiderMatsWithIndex.push({
            hash: hash,
            index:
              name.includes('Phaseglass Needle') || name.includes('Baryon Bough')
                ? index + 16
                : index,
            itemName: name,
          });
        }
        //return i.currencies[0].itemHash;
      }
    }
  })
  .filter((x) => x !== undefined);

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

spiderMatsWithIndex.sort((a, b) => (a.index > b.index ? 1 : -1));

Object.values(spiderMatsWithIndex).forEach((item) => {
  spiderMats.push(item.hash);
});

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

writeFile('./output/spider-mats.json', spiderMats);
writeFile('./output/spider-purchaseables-to-mats.json', purchaseableMatTable);
