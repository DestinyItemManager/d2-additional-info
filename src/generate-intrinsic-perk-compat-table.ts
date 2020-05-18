import { diffArrays, uniqAndSortArray } from './helpers.js';
import { get, getAll, loadLocal } from 'destiny2-manifest/node';

import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2';
import { writeFile } from './helpers';

loadLocal();
const inventoryItems = getAll('DestinyInventoryItemDefinition');

const WEAPON_CATEGORY_HASH = 1;
const DUMMY_CATEGORY_HASH = 3109687656;
const RPM_HASH = 4284893193;
const DRAW_HASH = 447667954;
const CHARGE_HASH = 2961396640;
const SWING_HASH = 2837207746;
const ONLY_EXOTICS = -99999999; // all other hashes are positive, so this is definitely ours

const itemCategoryHashExclusion = [
  1, // Weapon
  2, // Kinetic Weapon
  3, // Energy Weapon
  4, // Power Weapon
  21, // Warlock
  22, // Titan
  23, // Hunter
  964228942, // Breaker: Disruption
  1793728308, // Breaker: Piercing
  2906646562, // Breaker: Stagger
];

const weaponCategoryHashesToStat: Record<number, number> = {
  5: RPM_HASH, // auto rifle
  6: RPM_HASH, // hand cannon
  7: RPM_HASH, // pulse rifle
  8: RPM_HASH, // scout rifle
  9: CHARGE_HASH, // fusion rifle
  10: RPM_HASH, // sniper rifle
  11: RPM_HASH, // shotgun
  12: RPM_HASH, // machine gun
  13: RPM_HASH, // rocket launcher
  14: RPM_HASH, // sidearm
  54: SWING_HASH, // sword
  153950757: RPM_HASH, // grenade launcher
  1504945536: CHARGE_HASH, // linear fusion rifle
  2489664120: RPM_HASH, // trace rifle
  3317538576: DRAW_HASH, // bow
  3954685534: RPM_HASH, // submachine gun
};

// workaround for https://github.com/Bungie-net/api/issues/1131
const workAroundBadStats: Record<string, number> = {
  Divinity: 1000,
  "Eriana's Vow": 90,
  'Go Figure': 450,
  'One Thousand Voices': 1000,
  Wavesplitter: 1000,
  'Whisper of the Worm': 72,
};

const intrinsic: Record<number, Record<number, number[]>> = {};
let exoticIntrinsicList: number[] = [];

inventoryItems.forEach((inventoryItem) => {
  const itemCategoryHashes = inventoryItem.itemCategoryHashes || [];
  const itemName = inventoryItem.displayProperties.name;
  if (
    itemCategoryHashes.includes(WEAPON_CATEGORY_HASH) &&
    !itemCategoryHashes.includes(DUMMY_CATEGORY_HASH) &&
    inventoryItem.sockets
  ) {
    const intrinsicPerkHash = inventoryItem.sockets.socketEntries[0].singleInitialItemHash;
    const isExotic = inventoryItem.inventory.tierType === 6;
    const weaponType = getWeaponType(itemCategoryHashes, inventoryItem.hash);
    const stat =
      workAroundBadStats[itemName] ??
      inventoryItem.stats.stats[weaponCategoryHashesToStat[weaponType]]?.value;

    if (stat || isExotic) {
      // remove purples with weird stats
      if (isExotic) {
        // build a list of exotic intrinsic perks
        exoticIntrinsicList.push(intrinsicPerkHash);
      }

      intrinsic[weaponType] = intrinsic[weaponType] ?? {};
      intrinsic[weaponType][stat] = intrinsic[weaponType][stat] ?? [];
      intrinsic[weaponType][stat].push(intrinsicPerkHash);
      intrinsic[weaponType][stat] = uniqAndSortArray(intrinsic[weaponType][stat]).sort((statHash) =>
        get('DestinyInventoryItemDefinition', statHash)?.displayProperties?.name.includes('Frame')
          ? 1
          : -1
      );
    }
  }
});

exoticIntrinsicList = uniqAndSortArray(exoticIntrinsicList);

Object.values(intrinsic).forEach(function (weaponType) {
  Object.values(weaponType).forEach(function (intrinsicList) {
    const onlyExotics = diffArrays(intrinsicList, exoticIntrinsicList).length === 0;
    if (onlyExotics) {
      intrinsicList.splice(0, 0, ONLY_EXOTICS); // insert hash so we know this list only contains exotic perks
    }
  });
});

writeFile('./output/intrinsic-perk-lookup.json', intrinsic);

const lfrHash = 1504945536; // lfr return as both lfr and fusion rifle

function getWeaponType(
  itemCategoryHashes: DestinyInventoryItemDefinition['itemCategoryHashes'],
  hash: DestinyInventoryItemDefinition['itemCategoryHashes'][number]
) {
  let weaponType = -99999999;
  itemCategoryHashes = diffArrays(itemCategoryHashes, itemCategoryHashExclusion);

  if (itemCategoryHashes.length > 1) {
    if (itemCategoryHashes.includes(lfrHash)) {
      weaponType = lfrHash;
    } else {
      console.log(`Error! Too many itemCategoryHashes on hash ${hash}: ${itemCategoryHashes}`);
    }
  } else {
    weaponType = itemCategoryHashes[0];
  }
  return weaponType;
}
