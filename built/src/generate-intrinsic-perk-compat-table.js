'use strict';
exports.__esModule = true;
var helpers_js_1 = require('./helpers.js');
var node_1 = require('destiny2-manifest/node');
var helpers_1 = require('./helpers');
node_1.loadLocal();
var inventoryItems = node_1.getAll('DestinyInventoryItemDefinition');
var WEAPON_CATEGORY_HASH = 1;
var DUMMY_CATEGORY_HASH = 3109687656;
var RPM_HASH = 4284893193;
var DRAW_HASH = 447667954;
var CHARGE_HASH = 2961396640;
var SWING_HASH = 2837207746;
var ONLY_EXOTICS = -99999999; // all other hashes are positive, so this is definitely ours
var itemCategoryHashExclusion = [1, 2, 3, 4, 21, 22, 23, 964228942, 1793728308, 2906646562];
var weaponCategoryHashesToStat = {
  5: RPM_HASH,
  6: RPM_HASH,
  7: RPM_HASH,
  8: RPM_HASH,
  9: CHARGE_HASH,
  10: RPM_HASH,
  11: RPM_HASH,
  12: RPM_HASH,
  13: RPM_HASH,
  14: RPM_HASH,
  54: SWING_HASH,
  153950757: RPM_HASH,
  1504945536: CHARGE_HASH,
  2489664120: RPM_HASH,
  3317538576: DRAW_HASH,
  3954685534: RPM_HASH,
};
// workaround for https://github.com/Bungie-net/api/issues/1131
var workAroundBadStats = {
  Divinity: 1000,
  "Eriana's Vow": 90,
  'Go Figure': 450,
  'One Thousand Voices': 1000,
  Wavesplitter: 1000,
  'Whisper of the Worm': 72,
};
var intrinsic = {};
var exoticIntrinsicList = [];
inventoryItems.forEach(function (inventoryItem) {
  var _a, _b, _c, _d;
  var itemCategoryHashes = inventoryItem.itemCategoryHashes || [];
  var itemName = inventoryItem.displayProperties.name;
  if (
    itemCategoryHashes.includes(WEAPON_CATEGORY_HASH) &&
    !itemCategoryHashes.includes(DUMMY_CATEGORY_HASH) &&
    inventoryItem.sockets
  ) {
    var intrinsicPerkHash = inventoryItem.sockets.socketEntries[0].singleInitialItemHash;
    var isExotic = inventoryItem.inventory.tierType === 6;
    var weaponType = getWeaponType(itemCategoryHashes, inventoryItem.hash);
    var stat =
      (_a = workAroundBadStats[itemName]) !== null && _a !== void 0
        ? _a
        : (_b = inventoryItem.stats.stats[weaponCategoryHashesToStat[weaponType]]) === null ||
          _b === void 0
        ? void 0
        : _b.value;
    if (stat || isExotic) {
      // remove purples with weird stats
      if (isExotic) {
        // build a list of exotic intrinsic perks
        exoticIntrinsicList.push(intrinsicPerkHash);
      }
      intrinsic[weaponType] = (_c = intrinsic[weaponType]) !== null && _c !== void 0 ? _c : {};
      intrinsic[weaponType][stat] =
        (_d = intrinsic[weaponType][stat]) !== null && _d !== void 0 ? _d : [];
      intrinsic[weaponType][stat].push(intrinsicPerkHash);
      intrinsic[weaponType][stat] = helpers_js_1
        .uniqAndSortArray(intrinsic[weaponType][stat])
        .sort(function (statHash) {
          var _a, _b;
          return (
            (_b =
              (_a = node_1.get('DestinyInventoryItemDefinition', statHash)) === null ||
              _a === void 0
                ? void 0
                : _a.displayProperties) === null || _b === void 0
              ? void 0
              : _b.name.includes('Frame')
          )
            ? 1
            : -1;
        });
    }
  }
});
exoticIntrinsicList = helpers_js_1.uniqAndSortArray(exoticIntrinsicList);
Object.values(intrinsic).forEach(function (weaponType) {
  Object.values(weaponType).forEach(function (intrinsicList) {
    var onlyExotics = helpers_js_1.diffArrays(intrinsicList, exoticIntrinsicList).length === 0;
    if (onlyExotics) {
      intrinsicList.splice(0, 0, ONLY_EXOTICS); // insert hash so we know this list only contains exotic perks
    }
  });
});
helpers_1.writeFile('./output/intrinsic-perk-lookup.json', intrinsic);
var lfrHash = 1504945536; // lfr return as both lfr and fusion rifle
function getWeaponType(itemCategoryHashes, hash) {
  var weaponType = -99999999;
  itemCategoryHashes = helpers_js_1.diffArrays(itemCategoryHashes, itemCategoryHashExclusion);
  if (itemCategoryHashes.length > 1) {
    if (itemCategoryHashes.includes(lfrHash)) {
      weaponType = lfrHash;
    } else {
      console.log('Error! Too many itemCategoryHashes on hash ' + hash + ': ' + itemCategoryHashes);
    }
  } else {
    weaponType = itemCategoryHashes[0];
  }
  return weaponType;
}
