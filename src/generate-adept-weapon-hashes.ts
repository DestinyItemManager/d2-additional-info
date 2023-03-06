import { getAllDefs, loadLocal } from '@d2api/manifest-node';
import { DestinyItemType } from 'bungie-api-ts/destiny2';
import { writeFile } from './helpers.js';

/**
 * Adept weapons have conditional stats that should be shown on their
 * masterwork sockets. Other items also have these conditional stats
 * but those should not be shown. This collects all the hashes that
 * we allow those conditional stats to be added when masterworked.
 *
 * THIS INCLUDES TIMELOST WEAPONS as long as conditional stats are
 * the stated purpose of adept-weapon-hashes.json
 */

loadLocal();

const inventoryItems = getAllDefs('InventoryItem');
const adeptStrings = ['(Adept)', '(Timelost)', '(Harrowed)'];
const adeptWeaponHashes = inventoryItems
  .filter(
    (i) =>
      i.itemType === DestinyItemType.Weapon &&
      adeptStrings.some((adepts) => i.displayProperties.name.trim().endsWith(adepts))
  )
  .map((i) => i.hash);

writeFile('./output/adept-weapon-hashes.json', adeptWeaponHashes);
