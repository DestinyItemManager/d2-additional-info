import { get, getAll, loadLocal } from '@d2api/manifest/node';
import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2';
import { ItemCategoryHashes, StatHashes } from '../data/generated-enums';
import { writeFile } from './helpers';
import { diffArrays, uniqAndSortArray } from './helpers.js';

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const ONLY_EXOTICS = -99999999; // all other hashes are positive, so this is definitely ours

const itemCategoryHashExclusion = [
  ItemCategoryHashes.Weapon,
  ItemCategoryHashes.KineticWeapon,
  ItemCategoryHashes.EnergyWeapon,
  ItemCategoryHashes.PowerWeapon,
  ItemCategoryHashes.Warlock,
  ItemCategoryHashes.Titan,
  ItemCategoryHashes.Hunter,
  ItemCategoryHashes.BreakerDisruption,
  ItemCategoryHashes.BreakerPiercing,
  ItemCategoryHashes.BreakerStagger,
];

const weaponCategoryHashesToStat: Record<number, number> = {
  5: StatHashes.RoundsPerMinute, // auto rifle
  6: StatHashes.RoundsPerMinute, // hand cannon
  7: StatHashes.RoundsPerMinute, // pulse rifle
  8: StatHashes.RoundsPerMinute, // scout rifle
  9: StatHashes.ChargeTime, // fusion rifle
  10: StatHashes.RoundsPerMinute, // sniper rifle
  11: StatHashes.RoundsPerMinute, // shotgun
  12: StatHashes.RoundsPerMinute, // machine gun
  13: StatHashes.RoundsPerMinute, // rocket launcher
  14: StatHashes.RoundsPerMinute, // sidearm
  54: StatHashes.SwingSpeed, // sword
  153950757: StatHashes.RoundsPerMinute, // grenade launcher
  1504945536: StatHashes.ChargeTime, // linear fusion rifle
  2489664120: StatHashes.RoundsPerMinute, // trace rifle
  3317538576: StatHashes.DrawTime, // bow
  3954685534: StatHashes.RoundsPerMinute, // submachine gun
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
    itemCategoryHashes.includes(ItemCategoryHashes.Weapon) &&
    !itemCategoryHashes.includes(ItemCategoryHashes.Dummies) &&
    inventoryItem.sockets
  ) {
    const intrinsicPerkHash = inventoryItem.sockets.socketEntries[0].singleInitialItemHash;
    const isExotic = inventoryItem.inventory!.tierType === 6;
    const weaponType = getWeaponType(itemCategoryHashes, inventoryItem.hash);
    const stat =
      workAroundBadStats[itemName] ??
      inventoryItem.stats?.stats[weaponCategoryHashesToStat[weaponType]]?.value;

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

function getWeaponType(
  itemCategoryHashes: DestinyInventoryItemDefinition['itemCategoryHashes'],
  hash: number
) {
  let weaponType = -99999999;
  itemCategoryHashes = diffArrays(itemCategoryHashes ?? [], itemCategoryHashExclusion);

  if (itemCategoryHashes.length > 1) {
    if (itemCategoryHashes.includes(ItemCategoryHashes.LinearFusionRifles)) {
      weaponType = ItemCategoryHashes.LinearFusionRifles;
    } else {
      console.log(`Error! Too many itemCategoryHashes on hash ${hash}: ${itemCategoryHashes}`);
    }
  } else {
    weaponType = itemCategoryHashes[0];
  }
  return weaponType;
}
