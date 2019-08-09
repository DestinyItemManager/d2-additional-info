const { writeFile, getMostRecentManifest } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

const intrinsicPerks = [];

const test = {};
Object.keys(inventoryItem).forEach(function(key) {
  const hash = inventoryItem[key].hash;
  inventoryItem[key].itemCategoryHashes = inventoryItem[key].itemCategoryHashes || [];
  if (
    inventoryItem[key].itemCategoryHashes.includes(1) &&
    !inventoryItem[key].itemCategoryHashes.includes(3109687656) && // not dummies
    inventoryItem[key].sockets
  ) {
    const weaponType =
      inventoryItem[key].itemCategoryHashes[inventoryItem[key].itemCategoryHashes.length - 1];

    const rpm = getRPM(inventoryItem[key], weaponType);

    if (test[weaponType] && test[weaponType][rpm]) {
      test[weaponType][rpm].push(inventoryItem[key].sockets.socketEntries[0].singleInitialItemHash);
    } else {
      test[weaponType] = {};
      test[weaponType][rpm] = [inventoryItem[key].sockets.socketEntries[0].singleInitialItemHash];
    }
  }
});

const cleanIntrinsicPerks = [...new Set(intrinsicPerks)];
const intrinsic = {};
console.log(test);

writeFile('./output/intrinsic-perk-lookup', test);

function getRPM(inventoryItem, weaponType) {
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
