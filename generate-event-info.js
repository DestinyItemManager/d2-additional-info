const { writeFilePretty, getMostRecentManifest, getSourceBlacklist } = require('./helpers.js');
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const dawning = require('./data/events/dawning.json');
const crimsondays = require('./data/events/crimsondays.json');
const solstice = require('./data/events/solstice.json');
const fotl = require('./data/events/fotl.json');
const revelry = require('./data/events/revelry.json');

const eventBlacklist = require('./data/events/blacklist.json');

const vendors = mostRecentManifestLoaded.DestinyVendorDefinition;
const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

// we don't need event info for these i guess
const sourcedItems = getSourceBlacklist();

const eventItemsLists = {};

const itemHashBlacklist = eventBlacklist;

const itemHashWhitelist = {
  1: dawning,
  2: crimsondays,
  3: solstice,
  4: fotl,
  5: revelry
};

const events = {
  Dawning: 1,
  'Crimson Days': 2,
  Solstice: 3,
  'Festival of the Lost': 4,
  Revelry: 5
};

// don't include things with these categories
const categoryBlacklist = [
  16, // Quest Step
  18, // Currencies
  34, // Engrams
  40, // Materials
  152608020, // Sparrow Mods
  268598612, // Packages
  1742617626, // Ornaments
  1784235469, // Bounties
  2253669532, // Treasure Maps
  3109687656 // Dummies
];

const eventDetector = new RegExp(Object.keys(events).join('|'));

eventItems = Object.values(inventoryItems).filter(function(item) {
  if (eventDetector.test(item.displayProperties.description)) {
    return true;
  }
});

Object.values(eventItems).forEach(function(item) {
  const eventID = events[item.displayProperties.description.match(eventDetector)[0]];
  if (
    // it already has an event source
    sourcedItems.includes(item.collectibleHash && collectibles[item.collectibleHash].sourceHash) ||
    // it's a category we don't include
    (item.itemCategoryHashes &&
      categoryBlacklist.filter((hash) => item.itemCategoryHashes.includes(hash)).length) ||
    // it's in another engram as well
    itemHashBlacklist.includes(item.hash) ||
    // it has no name
    !(item.displayProperties && item.displayProperties.name) ||
    // it is a superset of items
    item.gearset ||
    // no categories
    (item.itemCategoryHashes && item.itemCategoryHashes.length === 0)
  ) {
    return;
  }
  eventItemsLists[item.hash] = eventID;
});

// collection of event engrams
eventEngrams = Object.values(vendors).filter(function(vendor) {
  // bail out if:
  if (
    // - we are missing basic data
    !(vendor && vendor.displayProperties && vendor.displayProperties.description) ||
    // - it's not an engram
    !vendor.displayProperties.name.includes('Engram')
  ) {
    return false;
  }

  // if it matches an event string, include it!
  if (eventDetector.test(vendor.displayProperties.description)) {
    return true;
  }

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

    // various blacklist reasons to skip including this item
    if (
      // it already has an event source
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
      // it is a superset of items
      item.gearset ||
      // no categories
      (item.itemCategoryHashes && item.itemCategoryHashes.length === 0)
    ) {
      return;
    }

    // add this item to the event's list
    eventItemsLists[item.hash] = eventID;
  });
});

// add items that can not be programmatically added via whitelist
Object.entries(itemHashWhitelist).forEach(function([eventID, itemList]) {
  itemList.forEach(function(itemHash) {
    eventItemsLists[itemHash] = Number(eventID);
  });
});

writeFilePretty('./output/events.json', eventItemsLists);
