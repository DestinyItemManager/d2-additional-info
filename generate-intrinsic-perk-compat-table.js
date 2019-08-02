const { writeFile, getMostRecentManifest } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

const weaponHashes = [];
const intrinsicPerks = [];
const exoticPerks = [];
Object.keys(inventoryItem).forEach(function(key) {
  const hash = inventoryItem[key].hash;
  inventoryItem[key].itemCategoryHashes = inventoryItem[key].itemCategoryHashes || [];
  if (inventoryItem[key].itemCategoryHashes.includes(1) && inventoryItem[key].sockets) {
    weaponHashes.push(hash);
    if (inventoryItem[key].inventory.tierType !== 6) {
      intrinsicPerks.push(inventoryItem[key].sockets.socketEntries[0].singleInitialItemHash);
    } else {
      exoticPerks.push(inventoryItem[key].sockets.socketEntries[0].singleInitialItemHash);
    }
  }
});

const cleanIntrinsicPerks = [...new Set(intrinsicPerks)];
const intrinsic = {};

Object.keys(inventoryItem).forEach(function(key) {
  if (cleanIntrinsicPerks.includes(inventoryItem[key].hash)) {
    console.log(inventoryItem[key].displayProperties.name);
    if (
      intrinsic[inventoryItem[key].displayProperties.name] &&
      intrinsic[inventoryItem[key].displayProperties.name].hashes.length > 0
    ) {
      intrinsic[inventoryItem[key].displayProperties.name].hashes.push(inventoryItem[key].hash);
    } else {
      intrinsic[inventoryItem[key].displayProperties.name] = { hashes: [] };
      intrinsic[inventoryItem[key].displayProperties.name].hashes.push(inventoryItem[key].hash);
    }
  }
});

console.log(intrinsic);
