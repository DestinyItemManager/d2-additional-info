/**
 * Collect all the masterwork plug hashes that have conditional
 * stats associated with them.
 */

import { getAllDefs, loadLocal } from '@d2api/manifest-node';
import { writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAllDefs('InventoryItem');
const masterworkPlugsWithCondStats = inventoryItems
  .filter(
    (i) =>
      i.displayProperties.name.startsWith('Masterworked: ') &&
      i.investmentStats.some((s) => s.isConditionallyActive)
  )
  .map((i) => i.hash);

writeFile('./output/masterworks-with-cond-stats.json', masterworkPlugsWithCondStats);
