import { getDef, loadLocal } from '@d2api/manifest-node';
import { DestinyClass } from 'bungie-api-ts/destiny2';
import universalOrnamentPlugSetHashes from '../output/universal-ornament-plugset-hashes.json' assert { type: 'json' };
import { writeFile } from './helpers.js';

loadLocal();

const setsByClassType: { [classType: number]: (string | RegExp)[] } = {
  [DestinyClass.Titan]: [/(Wrecked|Tattered) Titan/, 'Brave Titan'],
  [DestinyClass.Hunter]: [
    'Scorched Hunter',
    'Daring Hunter',
    /Sunlit [A-Za-z]+$/,
    /Sunlit [A-Za-z]+ \(Unkindled\)/,
  ],
  [DestinyClass.Warlock]: [/(Damaged|Shattered) Warlock/, 'Wise Warlock'],
};

const output: { [classType: number]: { [setKey: string]: number[] } } = {
  [DestinyClass.Titan]: {},
  [DestinyClass.Hunter]: {},
  [DestinyClass.Warlock]: {},
};

const allItems = universalOrnamentPlugSetHashes.flatMap((hash) =>
  getDef('PlugSet', hash)!.reusablePlugItems.map((item) =>
    getDef('InventoryItem', item.plugItemHash)
  )
);

for (const classType of [DestinyClass.Titan, DestinyClass.Hunter, DestinyClass.Warlock]) {
  for (const [idx, pattern] of setsByClassType[classType].entries()) {
    const itemHashes = allItems
      .filter((i) => i?.displayProperties.name.match(pattern) && i.classType === classType)
      .map((i) => i!.hash);
    output[classType][`aux-${idx}`] = itemHashes;
  }
}

writeFile('./output/universal-ornament-aux-sets.json', output);
