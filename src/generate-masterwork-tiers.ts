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

const masterworkTiers: Record<number, number> = {};

masterworkPlugs.forEach((masterworkPlug) => {
  switch (masterworkPlug.displayProperties.name) {
    case 'Tier 1 Weapon':
      masterworkTiers[masterworkPlug.hash] = 1;
      break;
    case 'Tier 2 Weapon':
      masterworkTiers[masterworkPlug.hash] = 2;
      break;
    case 'Tier 3 Weapon':
      masterworkTiers[masterworkPlug.hash] = 3;
      break;
    case 'Tier 4 Weapon':
      masterworkTiers[masterworkPlug.hash] = 4;
      break;
    case 'Tier 5 Weapon':
      masterworkTiers[masterworkPlug.hash] = 5;
      break;
    case 'Tier 6 Weapon':
      masterworkTiers[masterworkPlug.hash] = 6;
      break;
    case 'Tier 7 Weapon':
      masterworkTiers[masterworkPlug.hash] = 7;
      break;
    case 'Tier 8 Weapon':
      masterworkTiers[masterworkPlug.hash] = 8;
      break;
    case 'Tier 9 Weapon':
      masterworkTiers[masterworkPlug.hash] = 9;
      break;
    case 'Masterwork':
      masterworkTiers[masterworkPlug.hash] = 10;
      break;
    default:
      masterworkTiers[masterworkPlug.hash] = 0;
  }
});

Object.values(catalystsPlugs).forEach((catalyst) => {
  masterworkTiers[catalyst.hash] = 10;
});

writeFile('./output/masterwork-tiers.json', masterworkTiers);
