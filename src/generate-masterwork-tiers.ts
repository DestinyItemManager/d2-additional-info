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
  const tier = Number(masterworkPlug.displayProperties.name.match(/\d/g) ?? 10);
  masterworkTiers[masterworkPlug.hash] = tier;
});

Object.values(catalystsPlugs).forEach((catalyst) => {
  masterworkTiers[catalyst.hash] = 10;
});

writeFile('./output/masterwork-tiers.json', masterworkTiers);
