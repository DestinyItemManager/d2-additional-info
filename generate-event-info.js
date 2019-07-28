const { writeFilePretty, getMostRecentManifest, getSourceBlacklist } = require('./helpers.js');
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const vendors = mostRecentManifestLoaded.DestinyVendorDefinition;
const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const collectibles = mostRecentManifestLoaded.DestinyCollectibleDefinition;

// we don't need event info for these i guess
const sourcedItems = getSourceBlacklist();

const eventItemsLists = {};

const itemHashBlacklist = [
  368640227,
  526091742,
  3205869477,
  1284563761,
  1871791700,
  1871791701,
  819191764,
  819191765,
  819191767,
  1590498252,
  1590498254,
  1590498255,
  2161167521,
  3230867320,
  3230867321,
  3230867322,
  3357307896,
  3514796977
];

const itemHashWhitelist = {
  1: [
    63024229,
    889413643,
    1028757552,
    1028757553,
    1028757554,
    1028757556,
    1028757557,
    1028757558,
    1028757552,
    1028757567,
    1423305584,
    1423305585,
    1423305586,
    1423305587,
    1423305587,
    1423305588,
    1423305589,
    1423305590,
    1423305591,
    1423305598,
    1423305599,
    1502135233,
    1502135240,
    1502135241,
    1502135242,
    1502135243,
    1502135246,
    1502135247,
    1873273984,
    2556098840,
    2593080269,
    2607476205,
    2607476206,
    2607476207,
    2799886702,
    3012249670,
    3012249671,
    3140833553,
    3140833554,
    3140833555,
    3140833556,
    3140833557,
    3140833558,
    3140833559,
    3287805174,
    3287805175,
    3287805176,
    3287805177,
    3287805178,
    3287805180,
    3287805181
  ],
  2: [263371515, 263371519],
  3: [
    980898608,
    980898609,
    980898610,
    980898611,
    980898614,
    2298896088,
    2298896090,
    2298896091,
    2298896092,
    2298896093,
    2298896094,
    2298896095,
    2919938481,
    3475074928
  ],
  4: [
    171748061,
    937162783,
    1473368760,
    1473368761,
    1473368764,
    1473368765,
    1473368766,
    1473368767,
    2277536120,
    2277536122,
    2277536123,
    2574262860,
    3665594271,
    4283023978,
    4283023979,
    4283023980,
    4283023981,
    4283023982,
    4283023983
  ],
  5: [
    2179603792,
    2179603793,
    2179603794,
    2179603795,
    2179603798,
    2179603799,
    2873996295,
    3035129091,
    3252358297,
    3252358302
  ]
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
  // 59, // Mods
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
