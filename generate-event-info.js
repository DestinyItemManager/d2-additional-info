const { writeFilePretty, getMostRecentManifest, getSourceBlacklist } = require('./helpers.js');

const newEvent = {};
const itemHashBlacklist = [];
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const vendors = mostRecentManifestLoaded.DestinyVendorDefinition;

allEngrams = Object.values(vendors).filter(function(vendor) {
  if (vendor && vendor.displayProperties && vendor.displayProperties.description) {
    if (vendor.displayProperties.name.includes('Engram')) {
      if (
        !vendor.displayProperties.description.includes('Dawning') &&
        !vendor.displayProperties.description.includes('Crimson Days') &&
        !vendor.displayProperties.description.includes('Solstice') &&
        !vendor.displayProperties.description.includes('Festival of the Lost') &&
        !vendor.displayProperties.description.includes('Revelry')
      ) {
        return vendor;
      }
    }
  }
});

Object.values(allEngrams).forEach(function(engram) {
  Object.values(engram.itemList).forEach(function(key) {
    itemHashBlacklist.push(key.itemHash);
  });
});

eventEngrams = Object.values(vendors).filter(function(vendor) {
  if (vendor && vendor.displayProperties && vendor.displayProperties.description) {
    if (
      vendor.displayProperties.description.includes('Dawning') ||
      vendor.displayProperties.description.includes('Crimson Days') ||
      vendor.displayProperties.description.includes('Solstice') ||
      vendor.displayProperties.description.includes('Festival of the Lost') ||
      vendor.displayProperties.description.includes('Revelry')
    ) {
      return vendor;
    }
  }
});

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

Object.values(eventEngrams).forEach(function(engram) {
  let event;
  if (engram.displayProperties.description.includes('Dawning')) {
    event = 1;
  } else if (engram.displayProperties.description.includes('Crimson Days')) {
    event = 2;
  } else if (engram.displayProperties.description.includes('Solstice')) {
    event = 3;
  } else if (engram.displayProperties.description.includes('Festival of the Lost')) {
    event = 4;
  } else if (engram.displayProperties.description.includes('Revelry')) {
    event = 5;
  }
  Object.values(engram.itemList).forEach(function(key) {
    const item = inventoryItem[key.itemHash];
    if (key.itemHash === 167651268) {
      console.log('Found');
    }
    if (item.displayProperties && item.displayProperties.name) {
      //console.log(item.displayProperties.name, event);
      newEvent[key.itemHash] = event;
    }
  });
});

const sourcedItems = getSourceBlacklist();

const categoryBlacklist = [
  16, // Quest Steps
  18, // Currencies
  34, // Engrams
  40, // Material
  53, // Quests
  58, // Clan Banner
  268598612, // Packages
  303512563, // Bonus Mods
  444756050, // Weapon Mods: Bow strings
  945330047, // Weapon Mods: Gameplay
  1334054322, // Weapon Mods: Batteries
  1449602859, // Ghost Mods
  1576735337, // Clan Banner: Perks
  1709863189, // Weapon Mods: Sword Blades
  1784235469, // Bounties
  2005599723, // Prophecy Offerings
  2076918099, // Weapon Mods: Launch Tubes
  2150402250, // Gags
  2237038328, // Weapon Mods: Intrinsic
  2250046497, // Prophecy Tablets
  2253669532, // Treasure Maps
  2411768833, // Weapon Mods: Scopes
  2423200735, // Item Sets
  3055157023, // Weapon Mods: Stocks
  3072652064, // Weapon Mods: Sword Guards
  3085181971, // Weapon Mods: Barrels
  3109687656, // Dummies
  3360831066, // Weapon Mods: Arrows
  3708671066, // Weapon Mods: Frames
  3836367751, // Weapon Mods: Grips
  3866509906, // Weapon Mods: Sights
  4184407433 // Weapon Mods: Magazines
];

Object.keys(inventoryItem).forEach(function(key) {
  const hash = inventoryItem[key].hash;
  const categoryHashes = inventoryItem[key].itemCategoryHashes || [];
  const sourceHash = inventoryItem[key].collectibleHash
    ? collectibles[inventoryItem[key].collectibleHash].sourceHash
    : null;

  const sourcedItem = sourcedItems.includes(sourceHash);
  const blacklisted = categoryBlacklist.filter((hash) => categoryHashes.includes(hash)).length;
  if (
    sourcedItem ||
    blacklisted ||
    inventoryItem[key].gearset ||
    itemHashBlacklist.includes(hash)
  ) {
    delete newEvent[hash];
  }
});

writeFilePretty('./output/events.json', newEvent);
