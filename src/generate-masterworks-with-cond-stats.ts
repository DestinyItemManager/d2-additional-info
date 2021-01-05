/**
 * Collect all the masterwork plug hashes that have conditional
 * stats associated with them.
 */

import { getAll, loadLocal } from '@d2api/manifest/node';
import { writeFile } from './helpers';

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');
const masterworkPlugsWithCondStats = inventoryItems
  .filter(
    (i) =>
      i.displayProperties.name === 'Masterwork' &&
      i.investmentStats.some((s) => s.isConditionallyActive)
  )
  .map((i) => i.hash);

writeFile('./output/masterworks-with-cond-stats.json', masterworkPlugsWithCondStats);
