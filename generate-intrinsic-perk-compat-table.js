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
const DEBUG = false;

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

const weaponCategoryHashesToROF = {
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

const FRAME_EXCLUSION = ['Omolon Adaptive Frame'];
const FRAME_INCLUSION = ['Aggressive Burst'];
const intrinsic = {};

// work around for https://github.com/Bungie-net/api/issues/1148
const workAroundHash = {
  'Claws of the Wolf': 23 // Claws of the Wolf, missing impact
};

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

    const rof = inventoryItem[key].stats.stats[weaponCategoryHashesToROF[weaponType]].value;

    const impact = workAroundHash[inventoryItem[key].displayProperties.name]
      ? workAroundHash[inventoryItem[key].displayProperties.name]
      : (inventoryItem[key].stats.stats[IMPACT_HASH] &&
          inventoryItem[key].stats.stats[IMPACT_HASH].value) ||
        rof;

    const isFrame =
      !isExotic &&
      !FRAME_EXCLUSION.includes(frame) &&
      (frame.includes('Frame') || !(FRAME_INCLUSION.filter((s) => s.includes(frame)).length === 0));

    if (impact || rof || isExotic) {
      // remove purples with weird stats
      if (intrinsic[weaponType] && intrinsic[weaponType][frame]) {
        intrinsic[weaponType][frame].hashes
          ? intrinsic[weaponType][frame].hashes.push(intrinsicPerkHash)
          : (intrinsic[weaponType][frame].hashes = [intrinsicPerkHash]);
        intrinsic[weaponType][frame].impact
          ? intrinsic[weaponType][frame].impact.push(impact)
          : (intrinsic[weaponType][frame].impact = [impact]);
        intrinsic[weaponType][frame].rof
          ? intrinsic[weaponType][frame].rof.push(rof)
          : (intrinsic[weaponType][frame].rof = [rof]);
        intrinsic[weaponType][frame].isExotic = isExotic;
        intrinsic[weaponType][frame].isFrame = isFrame;
      } else {
        intrinsic[weaponType] ? null : (intrinsic[weaponType] = {});
        intrinsic[weaponType][frame] ? null : (intrinsic[weaponType][frame] = {});
        intrinsic[weaponType][frame].hashes = [intrinsicPerkHash];
        intrinsic[weaponType][frame].impact = [impact];
        intrinsic[weaponType][frame].rof = [rof];
        intrinsic[weaponType][frame].isExotic = isExotic;
        intrinsic[weaponType][frame].isFrame = isFrame;
      }
      intrinsic[weaponType][frame].hashes = uniqAndSortArray(intrinsic[weaponType][frame].hashes);
      intrinsic[weaponType][frame].impact = uniqAndSortArray(intrinsic[weaponType][frame].impact);
      intrinsic[weaponType][frame].rof = uniqAndSortArray(intrinsic[weaponType][frame].rof);
    }
  }
});

destination = {};

Object.entries(intrinsic).forEach(([weaponType, frameList]) => {
  tempUniqueID = {};

  Object.values(frameList).forEach((frame) => {
    uniqueID = `${frame.impact}`; // whatever you want to group by goes here
    tempUniqueID[uniqueID] =
      !frame.isFrame || frame.isExotic
        ? (tempUniqueID[uniqueID] || []).concat(frame.hashes)
        : frame.hashes.concat(tempUniqueID[uniqueID] || []);
  });

  destination[weaponType] = Object.values(tempUniqueID);
});

if (DEBUG) {
  writeFile('./output/intrinsic-perk-lookupV2.json', intrinsic);
}
writeFile('./output/intrinsic-perk-lookup-V2.json', destination);

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
