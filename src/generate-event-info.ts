import { get, getAll, loadLocal } from 'destiny2-manifest/node';

import allSources from '../output/sources.json';
import crimsondays from '../data/events/crimsondays.json';
import dawning from '../data/events/dawning.json';
import eventDenyList from '../data/events/deny-list.json';
import fotl from '../data/events/fotl.json';
import games from '../data/events/guardian_games.json';
import revelry from '../data/events/revelry.json';
import solstice from '../data/events/solstice.json';
import { writeFile } from './helpers';

loadLocal();
const inventoryItems = getAll('DestinyInventoryItemDefinition');
const vendors = getAll('DestinyVendorDefinition');

const eventInfo: Record<
  number,
  { name: string; shortname: string; sources: number[]; engram: number[] }
> = {
  1: { name: 'The Dawning', shortname: 'dawning', sources: [], engram: [] },
  2: { name: 'Crimson Days', shortname: 'crimsondays', sources: [], engram: [] },
  3: { name: 'Solstice of Heroes', shortname: 'solstice', sources: [], engram: [] },
  4: { name: 'Festival of the Lost', shortname: 'fotl', sources: [], engram: [] },
  5: { name: 'The Revelry', shortname: 'revelry', sources: [], engram: [] },
  6: { name: 'Guardian Games', shortname: 'games', sources: [], engram: [] },
};

Object.entries(allSources).forEach(([sourceHash, sourceString]) => {
  sourceString = sourceString.toLowerCase();
  Object.values(eventInfo).forEach((eventAttrs) => {
    if (sourceString.includes(eventAttrs.name.replace('The ', '').toLowerCase())) {
      eventAttrs.sources.push(Number(sourceHash));
    }
  });
});

// we don't need event info for these i guess, since they already have a source
const sourcedItems = Object.values(eventInfo).flatMap((e) => e.sources);

const eventItemsLists: Record<string, number> = {};

const itemHashDenyList = eventDenyList;

const itemHashAllowList = {
  1: dawning,
  2: crimsondays,
  3: solstice,
  4: fotl,
  5: revelry,
  6: games,
};

const events: Record<string, number> = {
  Dawning: 1,
  'Crimson Days': 2,
  Solstice: 3,
  'Festival of the Lost': 4,
  Revelry: 5,
  Games: 6,
};

// don't include things with these categories
const categoryDenyList = [
  16, // Quest Step
  18, // Currencies
  34, // Engrams
  40, // Materials
  152608020, // Sparrow Mods
  268598612, // Packages
  1742617626, // Ornaments
  1784235469, // Bounties
  2253669532, // Treasure Maps
  3109687656, // Dummies
];

const eventDetector = new RegExp(Object.keys(events).join('|'));

inventoryItems.forEach((item) => {
  // we know it will match because we just filtered for this
  const eventName = item.displayProperties.description.match(eventDetector)?.[0];
  if (!eventName) {
    return;
  }
  const eventID = events[eventName];
  const collectibleHash =
    get('DestinyCollectibleDefinition', item.collectibleHash)?.sourceHash ?? -99999999;

  // skip this item if
  if (
    // it already has an event source
    sourcedItems.includes(collectibleHash) ||
    // it's a category we don't include
    categoryDenyList.some((hash) => item.itemCategoryHashes?.includes(hash)) ||
    // it's in another engram as well
    itemHashDenyList.includes(item.hash) ||
    // it has no name
    !item.displayProperties?.name ||
    // it is a superset of items
    item.gearset ||
    // no categories
    item.itemCategoryHashes?.length === 0
  ) {
    return;
  }
  eventItemsLists[item.hash] = eventID;
});

// collection of event engrams
vendors
  .filter((engramVendor) => {
    // bail out if
    if (
      // - we are missing basic data
      !engramVendor.displayProperties?.description ||
      // - it's not an engram
      !engramVendor.displayProperties?.name.includes('Engram')
    ) {
      return false;
    }

    // if it matches an event string, include it!
    if (eventDetector.test(engramVendor.displayProperties?.description)) {
      return true;
    }

    // if we're here, it's not an event engram. add its contents to the deny list
    engramVendor.itemList.forEach((item) => {
      itemHashDenyList.push(item.itemHash);
    });
    return;
  })
  .forEach((engram) => {
    // we know this will find a match because of earlier filtering

    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const eventID = events[engram.displayProperties?.description.match(eventDetector)![0]];
    eventInfo[eventID].engram.push(engram.hash);
    // for each item this event engram contains
    Object.values(engram.itemList).forEach(function (listItem) {
      // fetch its inventory
      const item = get('DestinyInventoryItemDefinition', listItem.itemHash)!;

      // various deny list reasons to skip including this item
      if (
        // it already has an event source
        sourcedItems.includes(
          get('DestinyCollectibleDefinition', item.collectibleHash)?.sourceHash ?? -99999999
        ) ||
        // it's a category we don't include
        (item.itemCategoryHashes &&
          categoryDenyList.filter((hash) => item.itemCategoryHashes?.includes(hash)).length) ||
        // it's in another engram as well
        itemHashDenyList.includes(item.hash) ||
        // it has no name
        !item.displayProperties?.name ||
        // it is a superset of items
        item.gearset ||
        // no categories
        item.itemCategoryHashes?.length === 0
      ) {
        return;
      }

      // add this item to the event's list
      eventItemsLists[item.hash] = eventID;
    });
  });

// add items that can not be programmatically added via AllowList
Object.entries(itemHashAllowList).forEach(function ([eventID, itemList]) {
  itemList.forEach(function (itemHash) {
    eventItemsLists[itemHash] = Number(eventID);
  });
});

writeFile('./output/events.json', eventItemsLists);

/*===================================================================================*\
||
||    Generate d2-event-info.ts
||
\*===================================================================================*/
let D2EventEnum = '';
let D2EventPredicateLookup = '';
let D2SourcesToEvent = '';
let D2EventInfo = '';

Object.entries(eventInfo).forEach(function ([eventNumber, eventAttrs]) {
  const enumName = eventAttrs.name.replace('The ', '').toUpperCase().split(' ').join('_');

  D2EventEnum += eventNumber === '1' ? `${enumName} = 1,\n` : `${enumName},\n`;

  D2EventInfo += `${eventNumber}: {
      name: '${eventAttrs.name}',
      shortname: '${eventAttrs.shortname}',
      sources: [${eventAttrs.sources}],
      engram: [${eventAttrs.engram}]
    },
    `;

  D2EventPredicateLookup += `${eventAttrs.shortname}: D2EventEnum.${enumName},\n`;

  eventAttrs.sources.forEach(function (source) {
    D2SourcesToEvent += `${source}: D2EventEnum.${enumName},\n`;
  });
});

const eventData = `export const enum D2EventEnum {
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
