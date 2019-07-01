const { writeFilePretty, getMostRecentManifest } = require('./helpers.js');
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);
const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

const bounties = {};

const arcSubclassHashes = [1334959255, 1751782730, 2958378809];
const solarSubclassHashes = [3105935002, 3481861797, 3635991036];
const voidSubclassHashes = [3225959819, 3382391785, 3887892656];

const blackArmoryWeaponHashes = [
  603242241,
  93253474,
  1449922174,
  2575506895,
  421573768,
  3843477312,
  3704653637,
  3211806999,
  3588934839,
  417164956
];

const FotLMaskHashes = [
  1138577659,
  1138577658,
  1441415180,
  1441415182,
  1441415178,
  1441415181,
  1441415179,
  1441415175,
  1441415177,
  1441415174,
  1441415176,
  1441415183
];

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

  location = [];
  //console.log(vendorHash);
  switch (vendorHash) {
    //case 3603221665:
    // location.push('Crucible');
    //  break;
    case 3982706173:
      location.push('Io');
      break;
    case 1841717884:
      location.push('Dreaming City');
      break;
    default:
  }

  if (
    (description.includes('edz') || description.includes('european dead zone')) &&
    !location.includes('EDZ')
  ) {
    location.push('EDZ');
  }
  if (
    (description.includes('mars') || description.includes('latent memories')) &&
    !location.includes('Mars')
  ) {
    location.push('Mars');
  }
  if (description.includes('mercury') && !location.includes('Mercury')) {
    location.push('Mercury');
  }
  if (description.includes('titan') && !location.includes('Titan')) {
    location.push('Titan');
  }
  if (description.includes('nessus') && !location.includes('Nessus')) {
    location.push('Nessus');
  }
  if (
    (description.includes('io.') || description.includes('from io')) &&
    !location.includes('Io')
  ) {
    location.push('Io');
  }
  if (description.includes('tangled shore') && !location.includes('Tangled Shore')) {
    location.push('Tangled Shore');
  }
  if (description.includes('dreaming city') && !location.includes('Dreaming City')) {
    location.push('Dreaming City');
  }
  if (
    (description.includes('crucible') || description.includes('control')) &&
    !location.includes('Crucible')
  ) {
    location.push('Crucible');
  }
  if (description.includes('gambit') && !location.includes('Gambit')) {
    location.push('Gambit');
  }
  if (description.includes('strike') && !location.includes('Strike')) {
    location.push('Strike');
  }
  if (
    (description.includes('tower') || description.includes('annex')) &&
    !location.includes('Tower')
  ) {
    location.push('Tower');
  }
  if (description.includes('haunted forest') && !location.includes('Haunted Forest')) {
    location.push('Haunted Forest');
  }
  if (description.includes('verdant forest') && !location.includes('Verdant Forest')) {
    location.push('Verdant Forest');
  }
  if (description.includes('shattered throne') && !location.includes('The Shattered Throne')) {
    location.push('The Shattered Throne');
  }

  if (categoryHashes.includes(2588263708) && !location.includes('Gambit')) {
    location.push('Gambit');
  }

  damageType = [];
  if (
    description.includes('arc') &&
    !description.includes('arcadian') &&
    !damageType.includes('arc')
  ) {
    damageType.push('arc');
  }
  if (description.includes('void') && !damageType.includes('void')) {
    damageType.push('void');
  }
  if (description.includes('solar') && !damageType.includes('solar')) {
    damageType.push('solar');
  }
  if (description.includes('kinetic') && !damageType.includes('kinetic')) {
    damageType.push('kinetic');
  }
  if (description.includes('multikills') && !damageType.includes('multikills')) {
    damageType.push('multikills');
  }

  enemyType = [];
  if ((description.includes('taken') || name.includes('taken')) && !enemyType.includes('Taken')) {
    enemyType.push('Taken');
  }
  if ((description.includes('cabal') || name.includes('cabal')) && !enemyType.includes('Cabal')) {
    enemyType.push('Cabal');
  }
  if (
    (description.includes('fallen') || name.includes('fallen')) &&
    !enemyType.includes('Fallen')
  ) {
    enemyType.push('Fallen');
  }
  if ((description.includes('scorn') || name.includes('scorn')) && !enemyType.includes('Scorn')) {
    enemyType.push('Scorn');
  }
  if ((description.includes('vex') || name.includes('vex')) && !enemyType.includes('Vex')) {
    enemyType.push('Vex');
  }
  if ((description.includes('hive') || name.includes('hive')) && !enemyType.includes('Hive')) {
    enemyType.push('Hive');
  }
  if (description.includes('guardians') && !enemyType.includes('Guardians')) {
    enemyType.push('Guardians');
  }
  if (description.includes('minibosses') && !enemyType.includes('Minibosses')) {
    enemyType.push('Minibosses');
  }
  if (description.includes('bosses') && !enemyType.includes('Bosses')) {
    enemyType.push('Bosses');
  }

  weaponType = [];
  if (description.includes('pulse rifle')) {
    weaponType.push('Pulse Rifle');
  }
  if (description.includes('auto rifle')) {
    weaponType.push('Auto Rifle');
  }
  if (description.includes('linear fusion rifle')) {
    weaponType.push('Linear Fusion Rifle');
  }
  if (description.includes('fusion rifle')) {
    weaponType.push('Fusion Rifle');
  }
  if (description.includes('trace rifle')) {
    weaponType.push('Trace Rifle');
  }
  if (description.includes('rocker launcher')) {
    weaponType.push('Rocket Launcher');
  }
  if (description.includes('bow')) {
    weaponType.push('Bow');
  }
  if (description.includes('scout rifle')) {
    weaponType.push('Scout Rifle');
  }
  if (description.includes('hand cannon')) {
    weaponType.push('Hand Cannon');
  }
  if (description.includes('shotgun')) {
    weaponType.push('Shotgun');
  }
  if (description.includes('sniper rifle')) {
    weaponType.push('Sniper Rifle');
  }
  if (description.includes('rocker launcher') || description.includes('rocket launcher')) {
    weaponType.push('Rocket Launcher');
  }
  if (description.includes('smg') || description.includes('submachine gun')) {
    weaponType.push('SMG');
  }
  if (description.includes('sidearm')) {
    weaponType.push('Sidearm');
  }
  if (description.includes('grenade launcher')) {
    weaponType.push('Grenade Launcher');
  } else if (description.includes('grenade')) {
    weaponType.push('Grenade');
  }
  if (description.includes('headshot') || description.includes('precision')) {
    weaponType.push('Headshot');
  }
  if (description.includes('sword')) {
    weaponType.push('Sword');
  }
  if (description.includes(' machine gun')) {
    weaponType.push('Machine Gun');
  }
  if (description.includes('melee')) {
    weaponType.push('Melee');
  }
  if (description.includes('power weapons') || description.includes('power weapon')) {
    weaponType.push('Power Weapons');
  }
  if (description.includes('close range')) {
    weaponType.push('Close Range');
  }
  if (description.includes('explosion')) {
    weaponType.push('Explosion');
  }
  if (description.includes('orbs of light')) {
    weaponType.push('Orbs');
  }
  if (description.includes('super')) {
    weaponType.push('Super');
  }

  eventType = [];
  if (description.includes('patrol')) {
    eventType.push('Patrol');
  }
  if (description.includes('public event')) {
    eventType.push('Public Event');
  }
  if (description.includes('forge ignition')) {
    eventType.push('Forge');
  }
  if (description.includes('adventure')) {
    eventType.push('Adventure');
  }
  if (description.includes('lost sector')) {
    eventType.push('Lost Sector');
  }
  if (description.includes('story')) {
    eventType.push('Story');
  }
  if (description.includes('harvest')) {
    eventType.push('Harvest');
  }

  requiredItems = [];
  if (description.includes('one black armory weapon equipped')) {
    requiredItems.push(blackArmoryWeaponHashes);
  }
  if (description.includes('wearing a festival of the lost mask')) {
    requiredItems.push(FotLMaskHashes);
  }
  if (description.includes('solar subclass equipped')) {
    requiredItems.push(solarSubclassHashes);
  }
  if (description.includes('arc subclass equipped')) {
    requiredItems.push(arcSubclassHashes);
  }
  if (description.includes('void subclass equipped')) {
    requiredItems.push(voidSubclassHashes);
  }

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
    bounties[hash].description = description;
    bounties[hash].name = name;
    bounties[hash].location = location;
    bounties[hash].damageType = damageType;
    bounties[hash].enemyType = enemyType;
    bounties[hash].weaponType = weaponType;
    bounties[hash].eventType = eventType;
    bounties[hash].requiredItems = requiredItems;
  }
});

writeFilePretty('./output/bounties.json', bounties);
