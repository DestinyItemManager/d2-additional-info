const { writeFile, getMostRecentManifest, uniqAndSortArray } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

const intrinsic = {};

Object.keys(inventoryItem).forEach(function(key) {
  const itemCategoryHashes = inventoryItem[key].itemCategoryHashes || [];
  if (
    itemCategoryHashes.includes(1) && // weapons only
    !itemCategoryHashes.includes(3109687656) && // not dummies
    inventoryItem[key].sockets
  ) {
    const weaponType = itemCategoryHashes[itemCategoryHashes.length - 1]; // last in the array is the specific weapon type
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
      intrinsic[weaponType][rpm] = uniqAndSortArray(intrinsic[weaponType][rpm]);
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
    case 3317538576: // bows
      rpm = inventoryItem.stats.stats[447667954].value; // draw time
      break;
    default:
      rpm = 0;
  }
  return rpm;
}
