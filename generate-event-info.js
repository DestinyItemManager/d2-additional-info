const { writeFilePretty, getMostRecentManifest, getSourceBlacklist } = require('./helpers.js');
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const vendors = mostRecentManifestLoaded.DestinyVendorDefinition;
const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

// we don't need event info for these i guess
const sourcedItems = getSourceBlacklist();

const eventItemsLists = {};
const itemHashBlacklist = [];

const events = {
  Dawning: 1,
  'Crimson Days': 2,
  Solstice: 3,
  'Festival of the Lost': 4,
  Revelry: 5
};

// don't include things with these categories
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

const eventDetector = new RegExp(Object.keys(events).join('|'));

// collection of event engrams
eventEngrams = Object.values(vendors).filter(function(vendor) {
  // bail out if:
  if (
    // - we are missing basic data
    !(vendor && vendor.displayProperties && vendor.displayProperties.description) ||
    // - it's not an engram
    !vendor.displayProperties.name.includes('Engram')
  )
    return false;

  // if it matches an event string, include it!
  if (eventDetector.test(vendor.displayProperties.description)) return true;

  // if we're here, it's not an event engram. add its contents to the blacklist
  vendor.itemList.forEach(function(item) {
    itemHashBlacklist.push(item.itemHash);
  });
  return false;
});

// loop through event engrams
Object.values(eventEngrams).forEach(function(engram) {
  // we know this will find a match because of earlier filtering
  const eventID = events[engram.displayProperties.description.match(eventDetector)[0]];

  // for each item this event engram contains
  Object.values(engram.itemList).forEach(function(listItem) {
    // fetch its inventory
    const item = inventoryItems[listItem.itemHash];

    //thinking.....
    //if (listItem.itemHash === 167651268) {
    //  console.log('Found');
    //}

    // various blacklist reasons to skip including this item
    if (
      // it already has a source
      sourcedItems.includes(
        item.collectibleHash && collectibles[item.collectibleHash].sourceHash
      ) ||
      // it's a category we don't include
      (item.itemCategoryHashes &&
        categoryBlacklist.filter((hash) => item.itemCategoryHashes.includes(hash)).length) ||
      // it's in another engram as well
      itemHashBlacklist.includes(item.hash) ||
      // it has no name
      !(item.displayProperties && item.displayProperties.name) ||
      // i don't understand this one
      item.gearset
    )
      return;

    // add this item to the event's list
    eventItemsLists[item.hash] = eventID;
  });
});

writeFilePretty('./output/events.json', eventItemsLists);
