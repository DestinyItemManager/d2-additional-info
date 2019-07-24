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

// this object collects the script output
const bounties = {};

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
  const vendorHash =
    inventoryItem.sourceData.vendorSources[0] &&
    inventoryItem.sourceData.vendorSources[0].vendorHash;

  // store values as object keys so we don't have to do duplication checks
  thisBounty = {
    location: {},
    damageType: {},
    enemyType: {},
    weaponType: {},
    eventType: {},
    requiredItems: {}
  };

  // loop through matching conditions
  matchTable.forEach((ruleset) => {
    // match against strings or regexes
    if (ruleset.matches)
      ruleset.matches.forEach((match) => {
        // convert regex||string to regex. add case insensitivity
        match = new RegExp(match, 'i');

        // and run the regex
        if (
          (ruleset.test.includes('desc') &&
            match.test(inventoryItem.displayProperties.description)) ||
          (ruleset.test.includes('name') && match.test(inventoryItem.displayProperties.name))
        )
          Object.entries(ruleset.assign).forEach(([assignTo, assignValue]) => {
            thisBounty[assignTo][assignValue] = true;
          });
      });

    // match against vendorHashes
    if (ruleset.vendorHashes)
      ruleset.vendorHashes.forEach((findhash) => {
        if (findhash == vendorHash)
          Object.entries(ruleset.assign).forEach(([assignTo, assignValue]) => {
            thisBounty[assignTo][assignValue] = true;
          });
      });

    // match against categoryHashes
    if (ruleset.categoryHashes)
      ruleset.categoryHashes.forEach((findhash) => {
        if (inventoryItem.itemCategoryHashes.includes(findhash))
          Object.entries(ruleset.assign).forEach(([assignTo, assignValue]) => {
            thisBounty[assignTo][assignValue] = true;
          });
      });
  });

  // convert objects to arrays
  Object.entries(thisBounty).forEach(([key, value]) => {
    if (typeof value == 'object') thisBounty[key] = Object.keys(value);
  });

  // add debug string
  if (debug)
    thisBounty = {
      input: `${inventoryItem.displayProperties.name} - ${inventoryItem.displayProperties.description}`,
      output:
        (thisBounty.location.length ? 'location: ' + thisBounty.location.join(',') + '  ' : '') +
        (thisBounty.damageType.length
          ? 'damageType: ' + thisBounty.damageType.join(',') + '  '
          : '') +
        (thisBounty.enemyType.length ? 'enemyType: ' + thisBounty.enemyType.join(',') + '  ' : '') +
        (thisBounty.weaponType.length
          ? 'weaponType: ' + thisBounty.weaponType.join(',') + '  '
          : '') +
        (thisBounty.eventType.length ? 'eventType: ' + thisBounty.eventType.join(',') + '  ' : '') +
        (thisBounty.requiredItems.length
          ? 'requiredItems: ' + thisBounty.requiredItems.join(',') + '  '
          : '')
    };

  // inject requiredItems array. unsure why do instead of leaving a reference string
  if (!debug && thisBounty.requiredItems[0])
    thisBounty.requiredItems = requirements[thisBounty.requiredItems[0]];

  bounties[inventoryItem.hash] = thisBounty;
});

writeFilePretty('./output/bounties.json', bounties);
