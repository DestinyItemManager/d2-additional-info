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

  switch (weaponType) {
    case 5: // auto rifle
    case 6: // hand cannon
    case 7: // pulse
    case 8: // scout
    case 10: // sniper
    case 11: // shotgun
    case 12: // mg
    case 13: // rocket launcher
    case 14: // sidearm
    case 153950757: // grenade launcher
    case 2489664120: // trace rifle
    case 3954685534: // smg
      rpm = stats[hashes.rpm].value;
      break;
    case 9: // fusion rifle
    case 1504945536: // lfr
      rpm = stats[hashes.chargeTime].value;
      break;
    case 54: //sword
      rpm = stats[hashes.swingSpeed].value;
      break;
    case 3317538576: // bow
      rpm = stats[hashes.drawTime].value;
      break;
    default:
      rpm = 0;
  }

  // hash workaround for https://github.com/Bungie-net/api/issues/1131
  const workAroundHashes = [
    3524313097, // Eriana's Vow: 90rpm
    1891561814, // Whisper: 72rpm
    2069224589, // 1kv: 1000ms
    1852863732, // Wavesplitter: 1000rpm
    4103414242 // Divinity: 1000rpm
  ];

  if (workAroundHashes.includes(inventoryItem.hash)) {
    switch (inventoryItem.hash) {
      case 3524313097: // Eriana's Vow
        rpm = 90;
        break;
      case 1891561814: // Whisper
        rpm = 72;
        break;
      case 1852863732: // Wavesplitter
      case 2069224589: // 1KV
      case 4103414242: // Divinity
        rpm = 1000;
        break;
      default:
        rpm = 0;
    }
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
