import { getAll, loadLocal } from '@d2api/manifest/node';
import { writeFile } from './helpers';

/**
 * Adept weapons have conditional stats that should be shown on their
 * masterwork sockets. Other items also have these conditional stats
 * but those should not be shown. This collects all the hashes that
 * we allow those conditional stats to be added when masterworked.
 */

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');
const adeptWeaponHashes = inventoryItems
  .filter((i) => i.displayProperties.name.trim().endsWith('(Adept)'))
  .map((i) => i.hash);

writeFile('./output/adept-weapon-hashes.json', adeptWeaponHashes);
