const {
  writeFilePretty,
  writeFile,
  getMostRecentManifest,
  getSourceBlacklist,
  prettier
} = require('./helpers.js');
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

const eventInfo = {
  1: { name: 'The Dawning', shortname: 'dawning', sources: [], engram: [] },
  2: { name: 'Crimson Days', shortname: 'crimsondays', sources: [], engram: [] },
  3: { name: 'Solstice of Heroes', shortname: 'solstice', sources: [], engram: [] },
  4: { name: 'Festival of the Lost', shortname: 'fotl', sources: [], engram: [] },
  5: { name: 'The Revelry', shortname: 'revelry', sources: [], engram: [] }
};

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
  eventInfo[eventID].engram.push(engram.hash);
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

const allSources = require('./output/sources.json');

Object.entries(allSources).forEach(function([source, sourceString]) {
  source = Number(source);
  sourceString = sourceString.toLowerCase();
  Object.entries(eventInfo).forEach(function([eventNumber, eventAttrs]) {
    if (sourceString.includes(eventAttrs.name.replace('The ', '').toLowerCase())) {
      eventInfo[eventNumber].sources.push(source);
    }
  });
});
/*===================================================================================*\
||
||    Generate d2-event-info.ts
||
\*===================================================================================*/
let D2EventEnum = '';
let D2EventPredicateLookup = '';
let D2SourcesToEvent = '';
let D2EventInfo = '';

Object.entries(eventInfo).forEach(function([eventNumber, eventAttrs]) {
  const enumName = eventAttrs.name
    .replace('The ', '')
    .toUpperCase()
    .split(' ')
    .join('_');

  D2EventEnum += eventNumber === '1' ? `${enumName} = 1,\n` : `${enumName},\n`;

  D2EventInfo += `${eventNumber}: {
      name: '${eventAttrs.name}',
      shortname: '${eventAttrs.shortname}',
      sources: [${eventAttrs.sources}],
      engram: [${eventAttrs.engram}]
    },
    `;

  D2EventPredicateLookup += `${eventAttrs.shortname}: D2EventEnum.${enumName},\n`;

  eventAttrs.sources.forEach(function(source) {
    D2SourcesToEvent += `${source}: D2EventEnum.${enumName},\n`;
  });
});

eventData = `export const enum D2EventEnum {
  ${D2EventEnum}
}

export const D2EventInfo = {
  ${D2EventInfo}
}

export const D2EventPredicateLookup = {
  ${D2EventPredicateLookup}
}

export const D2SourcesToEvent = {
  ${D2SourcesToEvent}
}`;

writeFile('./output/d2-event-info.ts', eventData);
prettier('./output/d2-event-info.ts');
