'use strict';
var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === 'function' && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i['return'])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
exports.__esModule = true;
var node_1 = require('destiny2-manifest/node');
var sources_json_1 = __importDefault(require('../output/sources.json'));
var crimsondays_json_1 = __importDefault(require('../data/events/crimsondays.json'));
var dawning_json_1 = __importDefault(require('../data/events/dawning.json'));
var blacklist_json_1 = __importDefault(require('../data/events/blacklist.json'));
var fotl_json_1 = __importDefault(require('../data/events/fotl.json'));
var guardian_games_json_1 = __importDefault(require('../data/events/guardian_games.json'));
var revelry_json_1 = __importDefault(require('../data/events/revelry.json'));
var solstice_json_1 = __importDefault(require('../data/events/solstice.json'));
var helpers_1 = require('./helpers');
node_1.loadLocal();
var inventoryItems = node_1.getAll('DestinyInventoryItemDefinition');
var vendors = node_1.getAll('DestinyVendorDefinition');
var eventInfo = {
  1: { name: 'The Dawning', shortname: 'dawning', sources: [], engram: [] },
  2: { name: 'Crimson Days', shortname: 'crimsondays', sources: [], engram: [] },
  3: { name: 'Solstice of Heroes', shortname: 'solstice', sources: [], engram: [] },
  4: { name: 'Festival of the Lost', shortname: 'fotl', sources: [], engram: [] },
  5: { name: 'The Revelry', shortname: 'revelry', sources: [], engram: [] },
  6: { name: 'Guardian Games', shortname: 'games', sources: [], engram: [] },
};
Object.entries(sources_json_1['default']).forEach(function (_a) {
  var _b = __read(_a, 2),
    sourceHash = _b[0],
    sourceString = _b[1];
  sourceString = sourceString.toLowerCase();
  Object.values(eventInfo).forEach(function (eventAttrs) {
    if (sourceString.includes(eventAttrs.name.replace('The ', '').toLowerCase())) {
      eventAttrs.sources.push(Number(sourceHash));
    }
  });
});
// we don't need event info for these i guess, since they already have a source
var sourcedItems = Object.values(eventInfo).flatMap(function (e) {
  return e.sources;
});
var eventItemsLists = {};
var itemHashBlacklist = blacklist_json_1['default'];
var itemHashWhitelist = {
  1: dawning_json_1['default'],
  2: crimsondays_json_1['default'],
  3: solstice_json_1['default'],
  4: fotl_json_1['default'],
  5: revelry_json_1['default'],
  6: guardian_games_json_1['default'],
};
var events = {
  Dawning: 1,
  'Crimson Days': 2,
  Solstice: 3,
  'Festival of the Lost': 4,
  Revelry: 5,
  Games: 6,
};
// don't include things with these categories
var categoryBlacklist = [
  16,
  18,
  34,
  40,
  152608020,
  268598612,
  1742617626,
  1784235469,
  2253669532,
  3109687656,
];
var eventDetector = new RegExp(Object.keys(events).join('|'));
inventoryItems.forEach(function (item) {
  var _a, _b, _c, _d, _e;
  // we know it will match because we just filtered for this
  var eventName =
    (_a = item.displayProperties.description.match(eventDetector)) === null || _a === void 0
      ? void 0
      : _a[0];
  if (!eventName) return;
  var eventID = events[eventName];
  var collectibleHash =
    (_c =
      (_b = node_1.get('DestinyCollectibleDefinition', item.collectibleHash)) === null ||
      _b === void 0
        ? void 0
        : _b.sourceHash) !== null && _c !== void 0
      ? _c
      : -99999999;
  // skip this item if
  if (
    // it already has an event source
    sourcedItems.includes(collectibleHash) ||
    // it's a category we don't include
    categoryBlacklist.some(function (hash) {
      var _a;
      return (_a = item.itemCategoryHashes) === null || _a === void 0 ? void 0 : _a.includes(hash);
    }) ||
    // it's in another engram as well
    itemHashBlacklist.includes(item.hash) ||
    // it has no name
    !((_d = item.displayProperties) === null || _d === void 0 ? void 0 : _d.name) ||
    // it is a superset of items
    item.gearset ||
    // no categories
    ((_e = item.itemCategoryHashes) === null || _e === void 0 ? void 0 : _e.length) === 0
  ) {
    return;
  }
  eventItemsLists[item.hash] = eventID;
});
// collection of event engrams
vendors
  .filter(function (engramVendor) {
    var _a, _b, _c;
    // bail out if
    if (
      // - we are missing basic data
      !((_a = engramVendor.displayProperties) === null || _a === void 0
        ? void 0
        : _a.description) ||
      // - it's not an engram
      !((_b = engramVendor.displayProperties) === null || _b === void 0
        ? void 0
        : _b.name.includes('Engram'))
    ) {
      return false;
    }
    // if it matches an event string, include it!
    if (
      eventDetector.test(
        (_c = engramVendor.displayProperties) === null || _c === void 0 ? void 0 : _c.description
      )
    ) {
      return true;
    }
    // if we're here, it's not an event engram. add its contents to the blacklist
    engramVendor.itemList.forEach(function (item) {
      itemHashBlacklist.push(item.itemHash);
    });
    return;
  })
  .forEach(function (engram) {
    var _a;
    // we know this will find a match because of earlier filtering
    var eventID =
      events[
        ((_a = engram.displayProperties) === null || _a === void 0
          ? void 0
          : _a.description.match(eventDetector))[0]
      ];
    eventInfo[eventID].engram.push(engram.hash);
    // for each item this event engram contains
    Object.values(engram.itemList).forEach(function (listItem) {
      var _a, _b;
      // fetch its inventory
      var item = inventoryItems[listItem.itemHash];
      // various blacklist reasons to skip including this item
      if (
        // it already has an event source
        sourcedItems.includes(
          (_b =
            (_a = node_1.get('DestinyCollectibleDefinition', item.collectibleHash)) === null ||
            _a === void 0
              ? void 0
              : _a.sourceHash) !== null && _b !== void 0
            ? _b
            : -99999999
        ) ||
        // it's a category we don't include
        (item.itemCategoryHashes &&
          categoryBlacklist.filter(function (hash) {
            return item.itemCategoryHashes.includes(hash);
          }).length) ||
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
Object.entries(itemHashWhitelist).forEach(function (_a) {
  var _b = __read(_a, 2),
    eventID = _b[0],
    itemList = _b[1];
  itemList.forEach(function (itemHash) {
    eventItemsLists[itemHash] = Number(eventID);
  });
});
helpers_1.writeFile('./output/events.json', eventItemsLists);
/*===================================================================================*\
||
||    Generate d2-event-info.ts
||
\*===================================================================================*/
var D2EventEnum = '';
var D2EventPredicateLookup = '';
var D2SourcesToEvent = '';
var D2EventInfo = '';
Object.entries(eventInfo).forEach(function (_a) {
  var _b = __read(_a, 2),
    eventNumber = _b[0],
    eventAttrs = _b[1];
  var enumName = eventAttrs.name.replace('The ', '').toUpperCase().split(' ').join('_');
  D2EventEnum += eventNumber === '1' ? enumName + ' = 1,\n' : enumName + ',\n';
  D2EventInfo +=
    eventNumber +
    ": {\n      name: '" +
    eventAttrs.name +
    "',\n      shortname: '" +
    eventAttrs.shortname +
    "',\n      sources: [" +
    eventAttrs.sources +
    '],\n      engram: [' +
    eventAttrs.engram +
    ']\n    },\n    ';
  D2EventPredicateLookup += eventAttrs.shortname + ': D2EventEnum.' + enumName + ',\n';
  eventAttrs.sources.forEach(function (source) {
    D2SourcesToEvent += source + ': D2EventEnum.' + enumName + ',\n';
  });
});
var eventData =
  'export const enum D2EventEnum {\n  ' +
  D2EventEnum +
  '\n}\n\nexport const D2EventInfo = {\n  ' +
  D2EventInfo +
  '\n}\n\nexport const D2EventPredicateLookup = {\n  ' +
  D2EventPredicateLookup +
  '\n}\n\nexport const D2SourcesToEvent = {\n  ' +
  D2SourcesToEvent +
  '\n}';
helpers_1.writeFile('./output/d2-event-info.ts', eventData);
// function updateSources(eventInfo, allSources) {
//   Object.entries(allSources).forEach(function ([source, sourceString]) {
//     source = Number(source);
//     sourceString = sourceString.toLowerCase();
//     Object.entries(eventInfo).forEach(function ([eventNumber, eventAttrs]) {
//       if (sourceString.includes(eventAttrs.name.replace('The ', '').toLowerCase())) {
//         eventInfo[eventNumber].sources.push(source);
//       }
//     });
//   });
// }
