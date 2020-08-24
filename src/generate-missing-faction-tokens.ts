import { getAll, loadLocal } from 'destiny2-manifest/node';

import { writeFile, uniqAndSortArray } from './helpers';

loadLocal();
const inventoryItems = getAll('DestinyInventoryItemDefinition');
const factions = getAll('DestinyFactionDefinition');

const tokenHashes: any = [];
factions.forEach(({ tokenValues }) => {
  if (tokenValues) {
    tokenHashes.push(Object.keys(tokenValues));
  }
});

const allTokenHashes = uniqAndSortArray(tokenHashes.flat()).map(Number);
const missingTokenHashes: any = [];
allTokenHashes.forEach((hash) => {
  const item = inventoryItems.find((i) => i.hash === hash);
  if (!item) {
    missingTokenHashes.push(hash);
  }
});

writeFile('./output/missing-faction-tokens.json', missingTokenHashes);
