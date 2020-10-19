import { getAll, loadLocal } from '@d2api/manifest/node';
import { writeFile } from './helpers';

loadLocal();

/**
 * Build a table of armor energy mods by energy type.
 */

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const result: { [key: number]: number[] } = {};

for (const item of inventoryItems) {
  if (!item.plug?.energyCapacity) {
    continue;
  }

  result[item.plug.energyCapacity.energyType] ??= [];
  result[item.plug.energyCapacity.energyType][item.plug.energyCapacity.capacityValue - 1] =
    item.hash;
}

writeFile('./output/energy-mods.json', result);
