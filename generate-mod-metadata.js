const { writeFile, getMostRecentManifest, uniqAndSortArray } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const perks = mostRecentManifestLoaded.DestinySandboxPerkDefinition;

const mods = {};

Object.values(inventoryItems).forEach((item) => {
  if (
    item.itemCategoryHashes &&
    item.itemCategoryHashes.includes(4104513227) &&
    item.plug &&
    item.perks.length
  ) {
    const name = item.displayProperties.name;
    const description = perks[item.perks[0].perkHash].displayProperties.description || '';
    const hash = item.hash;
    const enhanced = getEnhanced(name);
    const affinity = (item.plug.energyCost && item.plug.energyCost.energyType) || 0;
    const type = getType(name);
    const ich = getWeaponCategoryHash(name, description);
    const perk = getFrameRequiredByICH(name);

    mods[hash] = { affinity, enhanced, type, itemCategoryHashes: ich, perk };
  }
});

writeFile('./output/mod-metadata.json', mods);

function getEnhanced(name) {
  if (name.includes('Enhanced')) {
    return 1;
  } else if (name.includes('Supreme')) {
    return 2;
  } else {
    return 0;
  }
}

function getType(name) {
  let type = [];

  if (name.includes('Ammo Finder')) {
    type.push('finder');
  }
  if (name.includes('Loader')) {
    type.push('loader');
  }
  if (name.includes('Targeting')) {
    type.push('targeting');
  }
  if (name.includes('Reserves')) {
    type.push('reserves');
  }
  if (name.includes('Unflinching')) {
    type.push('unflinching');
  }
  if (name.includes('Scavenger')) {
    type.push('scavenger');
  }
  if (name.includes('Dexterity')) {
    type.push('dexterity');
  }
  if (name.includes('Primary')) {
    type.push('primary');
  }
  if (name.includes('Energy')) {
    type.push('energy');
  }
  if (name.includes('Heavy') && !name.includes('Heavy Lifting')) {
    type.push('heavy');
  }
  return type;
}

function getWeaponCategoryHash(name, description) {
  let ich = [];
  let perks = [];
  const itemCategoryHash = {
    KINETIC: 2, // kinetic weapon
    ENERGY: 3, // energy weapon
    POWER: 4, // power weapon
    AUTO_RIFLE: 5, // auto rifle
    HAND_CANNON: 6, // hand cannon
    PULSE_RIFLE: 7, // pulse rifle
    SCOUT_RIFLE: 8, // scout rifle
    FUSION_RIFLE: 9, // fusion rifle
    SNIPER_RIFLE: 10, // sniper rifle
    SHOTGUN: 11, // shotgun
    MACHINE_GUN: 12, // machine gun
    ROCKET_LAUNCHER: 13, // rocket launcher
    SIDEARM: 14, // sidearm
    SWORD: 54, // sword
    GRENADE_LAUNCHER: 153950757, // grenade launcher
    LINEAR_FUSION_RIFLE: 1504945536, // linear fusion rifle
    TRACE_RIFLE: 2489664120, // trace rifle
    BOW: 3317538576, // bow
    SMG: 3954685534 // submachine gun
  };

  if (name.includes('Auto Rifle')) {
    ich.push(itemCategoryHash.AUTO_RIFLE);
  }
  if (name.includes('Hand Cannon')) {
    ich.push(itemCategoryHash.HAND_CANNON);
  }
  if (name.includes('Pulse Rifle')) {
    ich.push(itemCategoryHash.PULSE_RIFLE);
  }
  if (name.includes('Scout Rifle')) {
    ich.push(itemCategoryHash.SCOUT_RIFLE);
  }
  if (name.includes('Fusion Rifle') && !name.includes('Linear')) {
    ich.push(itemCategoryHash.FUSION_RIFLE);
  }
  if (name.includes('Sniper Rifle') || name.includes('Sniper')) {
    ich.push(itemCategoryHash.SNIPER_RIFLE);
  }
  if (name.includes('Shotgun')) {
    ich.push(itemCategoryHash.SHOTGUN);
  }
  if (name.includes('Machine Gun')) {
    ich.push(itemCategoryHash.MACHINE_GUN);
  }
  if (name.includes('Rocket Launcher')) {
    ich.push(itemCategoryHash.ROCKET_LAUNCHER);
  }
  if (name.includes('Sidearm')) {
    ich.push(itemCategoryHash.SIDEARM);
  }
  if (name.includes('Sword')) {
    ich.push(itemCategoryHash.SWORD);
  }
  if (name.includes('Grenade Launcher')) {
    ich.push(itemCategoryHash.GRENADE_LAUNCHER);
  }
  if (name.includes('Linear Fusion Rifle')) {
    ich.push(itemCategoryHash.LINEAR_FUSION_RIFLE);
  }
  if (name.includes('Trace Rifle')) {
    ich.push(itemCategoryHash.TRACE_RIFLE);
  }
  if (name.includes('Bow')) {
    ich.push(itemCategoryHash.BOW);
  }
  if (name.includes('Submachine Gun')) {
    ich.push(itemCategoryHash.SMG);
  }
  if (name.includes('Precision Weapon')) {
    // and slug shotguns contain intrinsic perk precision frame hash: 918679156
    // see getFrameRequiredByICH()
    ich.push(
      itemCategoryHash.HAND_CANNON,
      itemCategoryHash.SCOUT_RIFLE,
      itemCategoryHash.TRACE_RIFLE,
      itemCategoryHash.BOW,
      itemCategoryHash.LINEAR_FUSION_RIFLE,
      itemCategoryHash.SNIPER_RIFLE,
      itemCategoryHash.SHOTGUN
    );
  }
  if (name.includes('Scatter Projectile')) {
    ich.push(
      itemCategoryHash.AUTO_RIFLE,
      itemCategoryHash.MACHINE_GUN,
      itemCategoryHash.SMG,
      itemCategoryHash.PULSE_RIFLE,
      itemCategoryHash.SIDEARM,
      itemCategoryHash.FUSION_RIFLE
    );
  }
  if (name.includes('Light Arms')) {
    ich.push(
      itemCategoryHash.HAND_CANNON,
      itemCategoryHash.SIDEARM,
      itemCategoryHash.SMG,
      itemCategoryHash.BOW
    );
  }
  if (description.includes('Rifle-class')) {
    // https://www.reddit.com/r/destiny2/comments/9kaivr/what_defines_rifleclass/e6xnlst
    ich.push(
      itemCategoryHash.AUTO_RIFLE,
      itemCategoryHash.PULSE_RIFLE,
      itemCategoryHash.SCOUT_RIFLE,
      itemCategoryHash.FUSION_RIFLE,
      itemCategoryHash.LINEAR_FUSION_RIFLE,
      itemCategoryHash.SNIPER_RIFLE
    );
  }
  if (
    name.includes('Large Weapon') ||
    name.includes('Large Arms') ||
    name.includes('Oversize Weapon')
  ) {
    ich.push(
      itemCategoryHash.ROCKET_LAUNCHER,
      itemCategoryHash.GRENADE_LAUNCHER,
      itemCategoryHash.SHOTGUN
    );
  }
  if (name.includes('Power Weapon')) {
    ich.push(itemCategoryHash.POWER);
  }
  if (name.includes('Energy Weapon')) {
    ich.push(itemCategoryHash.ENERGY);
  }
  if (name.includes('Kinetic Weapon')) {
    ich.push(itemCategoryHash.KINETIC);
  }
  return uniqAndSortArray(ich);
}

function getFrameRequiredByICH(name) {
  perk = [];
  // Slug shotguns are considered precision weapons
  if (name.includes('Precision Weapon')) {
    perk.push(918679156);
  }
  return perk;
}
