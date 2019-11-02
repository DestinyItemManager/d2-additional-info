const { writeFile, getMostRecentManifest, uniqAndSortArray, diffArrays } = require('./helpers.js');
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);
const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const intrinsic = {};
let exoticIntrinsicList = [];

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

Object.keys(inventoryItem).forEach(function(key) {
  const itemCategoryHashes = inventoryItem[key].itemCategoryHashes || [];
  if (
    itemCategoryHashes.includes(1) && // weapons only
    !itemCategoryHashes.includes(3109687656) && // not dummies
    inventoryItem[key].sockets
  ) {
    const intrinsicPerkHash = inventoryItem[key].sockets.socketEntries[0].singleInitialItemHash;
    const isExotic = inventoryItem[key].inventory.tierType === 6;
    const weaponType = getWeaponType(itemCategoryHashes, inventoryItem[key].hash);
    const rpm = getRPM(inventoryItem[key], weaponType);
    if (rpm || isExotic) {
      // remove purples with weird stats
      if (isExotic) {
        // build a list of exotic intrinsic perks
        exoticIntrinsicList.push(intrinsicPerkHash);
      }
      if (intrinsic[weaponType]) {
        intrinsic[weaponType][rpm]
          ? intrinsic[weaponType][rpm].push(intrinsicPerkHash)
          : (intrinsic[weaponType][rpm] = [intrinsicPerkHash]);
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

function getRPM(inventoryItem, weaponType) {
  // or equivalent per weaponType
  const stats = inventoryItem.stats.stats;
  const hash = inventoryItem.hash;

  const weapons = {
    rpm: {
      hashes: [5, 6, 7, 8, 10, 11, 12, 13, 14, 153950757, 2489664120, 3954685534], // all other guns and launchers
      stat: 4284893193 // rpm
    },
    charge: { hashes: [9, 1504945536], stat: 2961396640 }, // fusion & lfr; chargeTime
    swing: { hashes: [54], stat: 2837207746 }, // sword; swingSpeed
    draw: { hashes: [3317538576], stat: 447667954 } // bow; drawTime
  };

  const rpm = weapons.rpm.hashes.includes(weaponType)
    ? stats[weapons.rpm.stat].value
    : weapons.charge.hashes.includes(weaponType)
    ? stats[weapons.charge.stat].value
    : weapons.swing.hashes.includes(weaponType)
    ? stats[weapons.swing.stat].value
    : weapons.draw.hashes.includes(weaponType)
    ? stats[weapons.draw.stat].value
    : 0;

  // hash workaround for https://github.com/Bungie-net/api/issues/1131
  const workAroundHashes = {
    1852863732: 1000, // Wavesplitter: 1000rpm
    1891561814: 72, // Whisper: 72rpm
    2069224589: 1000, // 1kv: 1000ms
    3524313097: 90, // Eriana's Vow: 90rpm
    4103414242: 1000 // Divinity: 1000rpm
  };

  return workAroundHashes[hash] ? workAroundHashes[hash] : rpm;
}

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
