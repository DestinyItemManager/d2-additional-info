const { writeFilePretty, getMostRecentManifest } = require('./helpers.js');
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);
const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

const { matchTable, requirements } = require('./data/bounty-config.js');

const debug = true;

// acceptable item categories
const categoryWhitelist = [
  //16, // Quest Steps
  //53, // Quests
  1784235469 // Bounties
  //2005599723, // Prophecy Offerings
];

const matchtypes = ['name', 'desc'];
const definitiontypes = ['Place', 'ActivityType', 'Activity'];

// collects definition->bounty associations
const toBounty = {};

// collects bounty->definition associations
const bounties = {};

definitiontypes.forEach((definitiontype) => {
  toBounty[definitiontype] = {};
});

// loop through the manifest's bounties
Object.values(inventoryItems).forEach(function(inventoryItem) {
  // itemCategoryHashes may be missing on classified objects
  inventoryItem.itemCategoryHashes = inventoryItem.itemCategoryHashes || [];

  // filter loops through acceptable categories -- includes loops through item's hashes
  if (
    categoryWhitelist.filter((findhash) => inventoryItem.itemCategoryHashes.includes(findhash))
      .length === 0
  )
    return;

  // normalize bounty's available data

  let thisBounty = {};
  definitiontypes.forEach((definitiontype) => {
    thisBounty[definitiontype] = [];
  });

  // loop through matching conditions
  matchTable.forEach((ruleset) => {
    // match against strings or regexes
    matchtypes.forEach((matchtype) => {
      let matchkey = matchtype === 'desc' ? 'description' : matchtype;

      if (ruleset[matchtype])
        ruleset[matchtype].forEach((match) => {
          // convert regex||string to regex. add case insensitivity
          match = new RegExp(match, 'i');

          // and run the regex
          if (match.test(inventoryItem.displayProperties[matchkey])) {
            Object.entries(ruleset.assign).forEach(([assignTo, assignValues]) => {
              // add these values to the bounty's attributes
              thisBounty[assignTo] = [...new Set(thisBounty[assignTo].concat(assignValues))];

              // add this bounty hash to the appropriate lookup tables
              if (!assignValues.forEach) {
                console.log(assignValues);
                console.log(assignTo);
              }
              assignValues.forEach(
                (assignValue) =>
                  (toBounty[assignTo][assignValue] || (toBounty[assignTo][assignValue] = [])) &&
                  (toBounty[assignTo][assignValue] = [
                    ...new Set(toBounty[assignTo][assignValue].concat([inventoryItem.hash]))
                  ])
              );
            });
          }
        });
    });
    // match against vendorHashes
    //if (ruleset.vendorHashes)
    //  ruleset.vendorHashes.forEach((findhash) => {
    //    if (inventoryItem.sourceData.vendorSources[0] && inventoryItem.sourceData.vendorSources[0].vendorHash == findhash)
    //      Object.entries(ruleset.assign).forEach(([assignTo, assignValue]) => {
    //        thisBounty[assignTo][assignValue] = true;
    //      });
    //  });

    //    // match against categoryHashes
    //    if (ruleset.categoryHashes)
    //      ruleset.categoryHashes.forEach((findhash) => {
    //        if (inventoryItem.itemCategoryHashes.includes(findhash))
    //          Object.entries(ruleset.assign).forEach(([assignTo, assignValue]) => {
    //            thisBounty[assignTo][assignValue] = true;
    //          });
    //      });
    //  });

    // convert objects to arrays
    //  Object.entries(thisBounty).forEach(([key, value]) => {
    //    if (typeof value == 'object') thisBounty[key] = Object.keys(value);
    //  });

    // add debug string
    //if (debug)
    //  thisBounty = {
    //    input: `${inventoryItem.displayProperties.name} - ${inventoryItem.displayProperties.description}`,
    //    output:
    //      (thisBounty.location.length ? 'location: ' + thisBounty.location.join(',') + '  ' : '') +
    //      (thisBounty.damageType.length
    //        ? 'damageType: ' + thisBounty.damageType.join(',') + '  '
    //        : '') +
    //      (thisBounty.enemyType.length ? 'enemyType: ' + thisBounty.enemyType.join(',') + '  ' : '') +
    //      (thisBounty.weaponType.length
    //        ? 'weaponType: ' + thisBounty.weaponType.join(',') + '  '
    //        : '') +
    //      (thisBounty.eventType.length ? 'eventType: ' + thisBounty.eventType.join(',') + '  ' : '') +
    //      (thisBounty.requiredItems.length
    //        ? 'requiredItems: ' + thisBounty.requiredItems.join(',') + '  '
    //        : '')
    //  };

    // inject requiredItems array. unsure why do instead of leaving a reference string
    //  if (!debug && thisBounty.requiredItems[0])
    //    thisBounty.requiredItems = requirements[thisBounty.requiredItems[0]];
    //console.log(inventoryItem.hash);
    //console.log(thisBounty);
    bounties[inventoryItem.hash] = thisBounty;
  });
});

const allfile = { InventoryItem: bounties };

//writeFilePretty('./output/relationships-by-inventoryitem.json', bounties);
definitiontypes.forEach((definitiontype) => {
  //writeFilePretty(`./output/inventoryitems-by-${definitiontype.toLowerCase()}.json`, toBounty[definitiontype]);
  allfile[definitiontype] = toBounty[definitiontype];
});

writeFilePretty('./output/inventoryitem-relationships.json', allfile);
