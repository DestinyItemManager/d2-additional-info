import { getAll, loadLocal } from '@d2api/manifest/node';
import { writeFile } from './helpers';

loadLocal();
const inventoryItems = getAll('DestinyInventoryItemDefinition');

const masterworkPlugs = inventoryItems.filter((item) =>
  item.plug?.plugCategoryIdentifier.includes('v400.plugs.weapons.masterworks.stat')
);

const catalystsPlugs = inventoryItems.filter(
  (item) =>
    item.plug?.plugCategoryIdentifier.includes('_masterwork') &&
    !item.itemCategoryHashes?.includes(3109687656) &&
    item.displayProperties.name !== 'Upgrade Masterwork'
);

const masterworkTiers = {
  1: [0],
  2: [0],
  3: [0],
  4: [0],
  5: [0],
  6: [0],
  7: [0],
  8: [0],
  9: [0],
  10: [0],
};

masterworkPlugs.forEach((masterworkPlug) => {
  switch (masterworkPlug.displayProperties.name) {
    case 'Tier 1 Weapon':
      masterworkTiers[1].push(masterworkPlug.hash);
      break;
    case 'Tier 2 Weapon':
      masterworkTiers[2].push(masterworkPlug.hash);
      break;
    case 'Tier 3 Weapon':
      masterworkTiers[3].push(masterworkPlug.hash);
      break;
    case 'Tier 4 Weapon':
      masterworkTiers[4].push(masterworkPlug.hash);
      break;
    case 'Tier 5 Weapon':
      masterworkTiers[5].push(masterworkPlug.hash);
      break;
    case 'Tier 6 Weapon':
      masterworkTiers[6].push(masterworkPlug.hash);
      break;
    case 'Tier 7 Weapon':
      masterworkTiers[7].push(masterworkPlug.hash);
      break;
    case 'Tier 8 Weapon':
      masterworkTiers[8].push(masterworkPlug.hash);
      break;
    case 'Tier 9 Weapon':
      masterworkTiers[9].push(masterworkPlug.hash);
      break;
    case 'Masterwork':
      masterworkTiers[10].push(masterworkPlug.hash);
      break;
  }
});

Object.values(masterworkTiers).forEach((tier) => {
  tier.shift();
});

Object.values(catalystsPlugs).forEach((catalyst) => {
  masterworkTiers[10].push(catalyst.hash);
});

writeFile('./output/masterwork-tiers.json', masterworkTiers);
