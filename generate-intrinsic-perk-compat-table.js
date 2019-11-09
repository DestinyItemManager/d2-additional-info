const { writeFile, getMostRecentManifest, uniqAndSortArray, diffArrays } = require('./helpers.js');
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);
const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

const WEAPON_CATEGORY_HASH = 1;
const DUMMY_CATEGORY_HASH = 3109687656;
const RPM_HASH = 4284893193;
const DRAW_HASH = 447667954;
const CHARGE_HASH = 2961396640;
const SWING_HASH = 2837207746;
const ONLY_EXOTICS = -99999999; // all other hashes are positive, so this is definitely ours
const IMPACT_HASH = 4043523819;

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

const weaponCategoryHashesToStat = {
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
  3954685534: RPM_HASH // submachine gun
};

// workaround for https://github.com/Bungie-net/api/issues/1131
const workAroundBadImpact = {
  Wavesplitter: 6,
  Divinity: 6
};

const workAroundBadROF = {
  Divinity: 1000,
  "Eriana's Vow": 90,
  'Go Figure': 450,
  'One Thousand Voices': 1000,
  Wavesplitter: 1000,
  'Whisper of the Worm': 72
};

const intrinsic = {};

Object.keys(inventoryItem).forEach(function(key) {
  const itemCategoryHashes = inventoryItem[key].itemCategoryHashes || [];
  if (
    itemCategoryHashes.includes(WEAPON_CATEGORY_HASH) &&
    !itemCategoryHashes.includes(DUMMY_CATEGORY_HASH) &&
    inventoryItem[key].sockets
  ) {
    const intrinsicPerkHash = inventoryItem[key].sockets.socketEntries[0].singleInitialItemHash;
    const frame = inventoryItem[intrinsicPerkHash].displayProperties.name;
    const isExotic = inventoryItem[key].inventory.tierType === 6;
    const weaponType = getWeaponType(itemCategoryHashes, inventoryItem[key].hash);

    const impactOrRPM = workAroundBadImpact[inventoryItem[key].displayProperties.name]
      ? workAroundBadImpact[inventoryItem[key].displayProperties.name]
      : (inventoryItem[key].stats.stats[IMPACT_HASH] &&
          inventoryItem[key].stats.stats[IMPACT_HASH].value) ||
        (inventoryItem[key].stats.stats[RPM_HASH] &&
          inventoryItem[key].stats.stats[RPM_HASH].value);

    const rof = workAroundBadROF[inventoryItem[key].displayProperties.name]
      ? workAroundBadROF[inventoryItem[key].displayProperties.name]
      : inventoryItem[key].stats.stats[weaponCategoryHashesToStat[weaponType]].value;

    if (impactOrRPM || isExotic) {
      // remove purples with weird stats
      if (intrinsic[weaponType] && intrinsic[weaponType][frame]) {
        intrinsic[weaponType][frame].hashes
          ? intrinsic[weaponType][frame].hashes.push(intrinsicPerkHash)
          : (intrinsic[weaponType][frame].hashes = [intrinsicPerkHash]);
        intrinsic[weaponType][frame].impact
          ? intrinsic[weaponType][frame].impact.push(impactOrRPM)
          : (intrinsic[weaponType][frame].impact = [impactOrRPM]);
        intrinsic[weaponType][frame].rof
          ? intrinsic[weaponType][frame].rof.push(rof)
          : (intrinsic[weaponType][frame].rof = [rof]);
        intrinsic[weaponType][frame].isExotic = isExotic;
        intrinsic[weaponType][frame].isFrame =
          !isExotic &&
          !frame.includes('Omolon Adaptive Frame') &&
          (frame.includes('Frame') || frame.includes('Aggressive Burst'));
      } else {
        intrinsic[weaponType] ? null : (intrinsic[weaponType] = {});
        intrinsic[weaponType][frame] ? null : (intrinsic[weaponType][frame] = {});
        intrinsic[weaponType][frame].hashes = [intrinsicPerkHash];
        intrinsic[weaponType][frame].impact = [impactOrRPM];
        intrinsic[weaponType][frame].rof = [rof];
        intrinsic[weaponType][frame].isExotic = isExotic;
        intrinsic[weaponType][frame].isFrame =
          !isExotic &&
          !frame.includes('Omolon Adaptive Frame') && // Omolon Adaptive Frame is compatible with Adaptive Frame
          (frame.includes('Frame') || frame.includes('Aggressive Burst')); // Aggressive Burst is 4-shot pulse not compatible with any other pulse frames
      }
      intrinsic[weaponType][frame].hashes = uniqAndSortArray(intrinsic[weaponType][frame].hashes);
      intrinsic[weaponType][frame].impact = uniqAndSortArray(intrinsic[weaponType][frame].impact);
      intrinsic[weaponType][frame].rof = uniqAndSortArray(intrinsic[weaponType][frame].rof);
    }
  }
});

compatTable = {
  5: {}, // auto rifle
  6: {}, // hand cannon
  7: {}, // pulse rifle
  8: {}, // scout rifle
  9: {}, // fusion rifle
  10: {}, // sniper rifle
  11: {}, // shotgun
  12: {}, // machine gun
  13: {}, // rocket launcher
  14: {}, // sidearm
  54: {}, // sword
  153950757: {}, // grenade launcher
  1504945536: {}, // linear fusion rifle
  2489664120: {}, // trace rifle
  3317538576: {}, // bow
  3954685534: {} // submachine gun
};

// now search through intrinsic for isExotic = true and isFrame = false, and put them with compatible intrinsic perks based off of impact.
// once all perks are grouped, if an intrinsic perk is by itself it is only compatible with itself, otherwise make an
// array such that all element become a key containing an array of all compatible perks into compatTable.
// e.g. 6: { ... "hashes": [895140517, 918679156, 1636108362] ... } becomes
// 6: {
//    ...
//    895140517: [895140517, 918679156, 1636108362],
//    918679156: [895140517, 918679156, 1636108362];
//    1636108362: [895140517, 918679156, 1636108362];
//    ...
// },

Object.entries(intrinsic).forEach(function(weaponType) {
  console.log(weaponType);
  // lost here
  //Object.values(weaponType).forEach(function(frames) {
  // console.log(frames);
  //});
});

writeFile('./output/intrinsic-perk-lookupV2.json', intrinsic);

function getWeaponType(itemCategoryHashes, hash) {
  let weaponType;
  const lfrHash = 1504945536; // lfr return as both lfr and fusion rifle
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
