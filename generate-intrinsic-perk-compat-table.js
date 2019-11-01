const { writeFile, getMostRecentManifest, uniqAndSortArray } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

const intrinsic = {};

const itemCategoryHashBlackList = [
  1, // Weapon
  2, // Kinetic Weapon
  3, // Energy Weapon
  4, // Power Weapon
  964228942, // Breaker: Disruption
  1793728308, // Breaker: Piercing
  2906646562 // Breaker: Stagger
];

Object.keys(inventoryItem).forEach(function(key) {
  const itemCategoryHashes = inventoryItem[key].itemCategoryHashes || [];
  if (
    itemCategoryHashes.includes(1) && // weapons only
    !itemCategoryHashes.includes(3109687656) && // not dummies
    inventoryItem[key].sockets
  ) {
    const weaponTypeWide = ArrayDiff(itemCategoryHashes, itemCategoryHashBlackList);
    const weaponType = NarrowWeaponType(weaponTypeWide);

    const rpm = getRPMorEQ(inventoryItem[key], weaponType);
    if (rpm > 0 || inventoryItem[key].inventory.tierType === 6) {
      // remove purples with weird stats
      if (intrinsic[weaponType]) {
        if (intrinsic[weaponType][rpm]) {
          intrinsic[weaponType][rpm].push(
            inventoryItem[key].sockets.socketEntries[0].singleInitialItemHash
          );
        } else {
          intrinsic[weaponType][rpm] = [
            inventoryItem[key].sockets.socketEntries[0].singleInitialItemHash
          ];
        }
      } else {
        intrinsic[weaponType] = {};
        intrinsic[weaponType][rpm] = [
          inventoryItem[key].sockets.socketEntries[0].singleInitialItemHash
        ];
      }
      intrinsic[weaponType][rpm] = uniqAndSortArray(intrinsic[weaponType][rpm]).sort(
        (rpmHash) => !inventoryItem[rpmHash].displayProperties.name.includes('Frame')
      );
    }
  }
});

writeFile('./output/intrinsic-perk-lookup.json', intrinsic);

function getRPMorEQ(inventoryItem, weaponType) {
  // or equivalent per weaponType
  let rpm;
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
      rpm = inventoryItem.stats.stats[4284893193].value; //rpm
      break;
    case 9: // fusion rifle
    case 1504945536: // lfr
      rpm = inventoryItem.stats.stats[2961396640].value; // charge time
      break;
    case 54: //sword
      rpm = inventoryItem.stats.stats[2837207746].value; // swing speed
      break;
    case 3317538576: // bow
      rpm = inventoryItem.stats.stats[447667954].value; // draw time
      break;
    default:
      rpm = 0;
  }

  // hash workaround for https://github.com/Bungie-net/api/issues/1131
  const workAroundHashes = [
    3524313097, // eriana's vow: 90rpm
    1891561814, // whisper: 72rpm
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

function ArrayDiff(array1, array2) {
  let array_difference = [];

  // difference will contain duplicates
  array_difference = array1.filter(function(x) {
    if (array2.indexOf(x) == -1) return true;
    else return false;
  });

  // create Set to eliminate duplicates
  // convert Set to array using spread
  return (filtered_array_difference = [...new Set(array_difference)]);
}

function NarrowWeaponType(array1) {
  let weaponType;
  if (array1.length > 1) {
    if (array1.includes(1504945536)) {
      weaponType = 1504945536;
    }
  } else {
    weaponType = array1[0];
  }
  return weaponType;
}
