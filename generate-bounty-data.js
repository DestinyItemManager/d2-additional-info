const { writeFilePretty, getMostRecentManifest } = require('./helpers.js');
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);
const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

const bounties = {};

Object.keys(inventoryItem).forEach(function(key) {
  const hash = inventoryItem[key].hash;
  const categoryHashes = inventoryItem[key].itemCategoryHashes || [];
  const description =
    inventoryItem[key].displayProperties &&
    inventoryItem[key].displayProperties.description.toLowerCase();
  const name =
    inventoryItem[key].displayProperties && inventoryItem[key].displayProperties.name.toLowerCase();
  const vendorHash =
    inventoryItem[key].sourceData &&
    inventoryItem[key].sourceData.vendorSources &&
    inventoryItem[key].sourceData.vendorSources[0] &&
    inventoryItem[key].sourceData.vendorSources[0].vendorHash;

  //console.log(vendorHash);
  switch (vendorHash) {
    case 3603221665:
      location = 'Crucible';
      break;
    case 3982706173:
      location = 'Io';
      break;
    case 1841717884:
      location = 'Dreaming City';
      break;
    default:
      location = '';
  }

  if (location === '') {
    if (description.search('mars') > 0 || description.search('latent memories') > 0) {
      location = 'Mars';
    } else if (description.search('nessus') >= 0) {
      location = 'Nessus';
    } else if (description.search('mercury') >= 0) {
      location = 'Mercury';
    } else if (description.search('edz') >= 0) {
      location = 'EDZ';
    } else if (description.search('titan') >= 0) {
      location = 'Titan';
    } else if (description.search('io.') >= 0 || description.search(' io ') >= 0) {
      location = 'Io';
    } else if (description.search('crucible') >= 0 || description.search('control') >= 0) {
      location = 'Crucible';
    } else if (description.search('gambit') >= 0) {
      location = 'Gambit';
    } else if (description.search('strike') >= 0) {
      location = 'Strike';
    } else if (description.search('tower') >= 0 || description.search('annex') >= 0) {
      location = 'Tower';
    } else if (description.search('haunted forest') >= 0) {
      location = 'Haunted Forest';
    } else if (description.search('verdant forest') >= 0) {
      location = 'Verdant Forest';
    } else {
      location = '';
    }
  }

  if (categoryHashes.includes(2588263708)) {
    location = 'Gambit';
  }

  if (description.search('arc') >= 0) {
    damageType = 'arc';
  } else if (description.search('void') >= 0) {
    damageType = 'void';
  } else if (description.search('solar') >= 0) {
    damageType = 'solar';
  } else {
    damageType = '';
  }

  if (description.search('taken') >= 0) {
    enemyType = 'Taken';
  } else if (description.search('cabal') >= 0) {
    enemyType = 'Cabal';
  } else if (description.search('fallen') >= 0) {
    enemyType = 'Fallen';
  } else if (description.search('scorn') >= 0) {
    enemyType = 'Scorn';
  } else if (description.search('vex') >= 0) {
    enemyType = 'Vex';
  } else if (description.search('hive') >= 0) {
    enemyType = 'Hive';
  } else {
    enemyType = '';
  }

  if (description.search('pulse rifle') >= 0) {
    weaponType = 'Pulse Rifle';
  } else if (description.search('auto rifle') >= 0) {
    weaponType = 'Auto Rifle';
  } else if (description.search('linear fusion rifle') >= 0) {
    weaponType = 'Linear Fusion Rifle';
  } else if (description.search('fusion rifle') >= 0) {
    weaponType = 'Fusion Rifle';
  } else if (description.search('trace rifle') >= 0) {
    weaponType = 'Trace Rifle';
  } else if (description.search('rocker launcher') >= 0) {
    weaponType = 'Rocket Launcher';
  } else if (description.search('bow') >= 0) {
    weaponType = 'Bow';
  } else if (description.search('scout rifle') >= 0) {
    weaponType = 'Scout Rifle';
  } else if (description.search('hand cannon') >= 0) {
    weaponType = 'Hand Cannon';
  } else if (description.search('shotgun') >= 0) {
    weaponType = 'Shotgun';
  } else if (description.search('sniper rifle') >= 0) {
    weaponType = 'Sniper Rifle';
  } else if (description.search('rocker launcher') >= 0) {
    weaponType = 'Rocket Launcher';
  } else if (description.search('smg') >= 0) {
    weaponType = 'SMG';
  } else if (description.search('sidearm') >= 0) {
    weaponType = 'Sidearm';
  } else if (description.search('grenade launcher') >= 0) {
    weaponType = 'Grenade Launcher';
  } else if (description.search('grenade') >= 0) {
    weaponType = 'Grenade';
  } else if (description.search('headshot') >= 0) {
    weaponType = 'headshot';
  } else if (description.search('sword') >= 0) {
    weaponType = 'Sword';
  } else if (description.search('machine gun') >= 0) {
    weaponType = 'Machine Gun';
  } else {
    weaponType = '';
  }

  /*if (name.search('Eververse') > 0) {
    location = 'Eververse';
  } else if (name.search('Meditations') > 0) {
    location = 'Tower';
  }*/

  const categoryWhitelist = [
    //16, // Quest Steps
    //53, // Quests
    1784235469 // Bounties
    //2005599723 // Prophecy Offerings
  ];
  const bountyWhitelisted = Boolean(
    categoryWhitelist.filter((hash) => categoryHashes.includes(hash)).length
  );

  if (bountyWhitelisted) {
    bounties[hash] = {};
    bounties[hash].location = location;
    bounties[hash].damageType = damageType;
    bounties[hash].enemyType = enemyType;
    bounties[hash].weaponType = weaponType;
  }
});

writeFilePretty('./output/bounties.json', bounties);
