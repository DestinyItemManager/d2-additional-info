import { getAll, loadLocal } from '@d2api/manifest/node';
import { PlugAvailabilityMode } from 'bungie-api-ts/destiny2';
import { writeFile } from './helpers';

loadLocal();

/**
 * Build a table of armor energy mods by energy type. energy-mods are the mods required to upgrade
 * within an energy type, while energy-mods-change are the mods required to change to a different
 * energy type.
 */

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const result: { [key: number]: number[] } = {};
const changeResult: { [key: number]: number[] } = {};

for (const item of inventoryItems) {
  if (!item.plug?.energyCapacity) {
    continue;
  }

  if (
    item.plug.plugAvailability ===
    PlugAvailabilityMode.AvailableIfSocketContainsMatchingPlugCategory
  ) {
    // Note: there's no item to upgrade to 1 energy, since all items start with at least 1 energy
    result[item.plug.energyCapacity.energyType] ??= [];
    result[item.plug.energyCapacity.energyType][item.plug.energyCapacity.capacityValue - 1] =
      item.hash;
  } else {
    // Changing to a different element costs all the resources require to build back up
    changeResult[item.plug.energyCapacity.energyType] ??= [];
    changeResult[item.plug.energyCapacity.energyType][item.plug.energyCapacity.capacityValue - 1] =
      item.hash;
  }
}

writeFile('./output/energy-mods.json', result);
writeFile('./output/energy-mods-change.json', changeResult);
