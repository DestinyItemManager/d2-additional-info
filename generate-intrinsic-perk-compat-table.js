const { writeFile, getMostRecentManifest } = require('./helpers.js');

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
    intrinsic[weaponType][rpm] = [...new Set(intrinsic[weaponType][rpm])]; // unique the array
  }
});

console.log(intrinsic);

writeFile('./output/intrinsic-perk-lookup.json', intrinsic);

function getRPMorEQ(inventoryItem, weaponType) {
  // or equivalent per weaponType
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
      return inventoryItem.stats.stats[4284893193].value; //rpm
      break;
    case 9: // fusion rifle
    case 1504945536: // lfr
      return inventoryItem.stats.stats[2961396640].value; // charge time
      break;
    case 54: //sword
      return inventoryItem.stats.stats[2837207746].value; //swing speed
      break;
    case 3317538576: // bows
      return inventoryItem.stats.stats[447667954].value; // draw time
  }
}
