const { writeFile, getMostRecentManifest, uniqAndSortArray } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

const intrinsic = {};

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
  2906646562 // Breaker: Stagger
];

let exoticIntrinsicList = [];

Object.keys(inventoryItem).forEach(function(key) {
  const itemCategoryHashes = inventoryItem[key].itemCategoryHashes || [];
  if (
    itemCategoryHashes.includes(1) && // weapons only
    !itemCategoryHashes.includes(3109687656) && // not dummies
    inventoryItem[key].sockets
  ) {
    const intrinsicPerkHash = inventoryItem[key].sockets.socketEntries[0].singleInitialItemHash;

    const weaponType = getWeaponType(
      diffArrays(itemCategoryHashes, itemCategoryHashExclusion),
      inventoryItem[key].hash
    );

    const rpm = getRPMorEQ(inventoryItem[key], weaponType);
    if (rpm > 0 || inventoryItem[key].inventory.tierType === 6) {
      // remove purples with weird stats
      if (inventoryItem[key].inventory.tierType === 6) {
        // build a list of exotic intrinsic perks
        exoticIntrinsicList.push(intrinsicPerkHash);
      }
      if (intrinsic[weaponType]) {
        if (intrinsic[weaponType][rpm]) {
          intrinsic[weaponType][rpm].push(intrinsicPerkHash);
        } else {
          intrinsic[weaponType][rpm] = [intrinsicPerkHash];
        }
      } else {
        intrinsic[weaponType] = {};
        intrinsic[weaponType][rpm] = [intrinsicPerkHash];
      }
      intrinsic[weaponType][rpm] = uniqAndSortArray(intrinsic[weaponType][rpm]).sort(
        (rpmHash) => !inventoryItem[rpmHash].displayProperties.name.includes('Frame')
      );
    }
  }
});

exoticIntrinsicList = uniqAndSortArray(exoticIntrinsicList);

writeFile('./output/intrinsic-perk-lookup.json', intrinsic);

function getRPMorEQ(inventoryItem, weaponType) {
  // or equivalent per weaponType
  let rpm;
  const stats = inventoryItem.stats.stats;

  const hashes = {
    rpm: 4284893193,
    chargeTime: 2961396640,
    swingSpeed: 2837207746,
    drawTime: 447667954
  };

  const weaponTypeStatLookup = {
    5: stats[hashes.rpm], // auto rifle
    6: stats[hashes.rpm], // hand cannon
    7: stats[hashes.rpm], // pulse
    8: stats[hashes.rpm], // scout
    9: stats[hashes.chargeTime], // fusion rifle
    10: stats[hashes.rpm], // sniper
    11: stats[hashes.rpm], // shotgun
    12: stats[hashes.rpm], // machine gun
    13: stats[hashes.rpm], // rocket launcher
    14: stats[hashes.rpm], // sidearm
    54: stats[hashes.swingSpeed], // sword
    153950757: stats[hashes.rpm], // grenade launcher
    2489664120: stats[hashes.rpm], // trace rifle
    3954685534: stats[hashes.rpm], // smg
    1504945536: stats[hashes.chargeTime], // linear fusion rifle
    3317538576: stats[hashes.drawTime] // bow
  };

  rpm = weaponTypeStatLookup[weaponType].value || 0;

  // hash workaround for https://github.com/Bungie-net/api/issues/1131
  const workAroundHashes = {
    1852863732: 1000, // Wavesplitter: 1000rpm
    1891561814: 72, // Whisper: 72rpm
    2069224589: 1000, // 1kv: 1000ms
    3524313097: 90, // Eriana's Vow: 90rpm
    4103414242: 1000 // Divinity: 1000rpm
  };

  if (workAroundHashes[inventoryItem.hash]) {
    rpm = workAroundHashes[inventoryItem.hash];
  }

  return rpm;
}

function diffArrays(all, exclude) {
  let difference = [];
  difference = all.filter(function(x) {
    if (!exclude.includes(x)) {
      return true;
    } else {
      return false;
    }
  });
  return [...new Set(difference)];
}

function getWeaponType(itemCategoryHashes, hash) {
  let weaponType;
  const lfrHash = 1504945536;
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
