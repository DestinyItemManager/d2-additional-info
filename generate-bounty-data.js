const { writeFilePretty, getMostRecentManifest } = require('./helpers.js');
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);
const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

const { matchTable, requirements } = require('./data/bounty-config.js');

const bounties = {};
const debug = true;

Object.keys(inventoryItem).forEach(function(key) {
  const hash = inventoryItem[key].hash;
  const categoryHashes = inventoryItem[key].itemCategoryHashes || [];
  const description =
    inventoryItem[key].displayProperties && inventoryItem[key].displayProperties.description;
  const name = inventoryItem[key].displayProperties && inventoryItem[key].displayProperties.name;
  const vendorHash =
    inventoryItem[key].sourceData &&
    inventoryItem[key].sourceData.vendorSources &&
    inventoryItem[key].sourceData.vendorSources[0] &&
    inventoryItem[key].sourceData.vendorSources[0].vendorHash;
  const categoryWhitelist = [
    //16, // Quest Steps
    //53, // Quests
    1784235469 // Bounties
    //2005599723, // Prophecy Offerings
  ];
  const bountyWhitelisted = Boolean(
    categoryWhitelist.filter((hash) => categoryHashes.includes(hash)).length
  );

  if (bountyWhitelisted) {
    thisBounty = {
      description: '',
      name: '',
      location: {},
      damageType: {},
      enemyType: {},
      weaponType: {},
      eventType: {},
      requiredItems: {}
    };

    //case 3603221665:
    // location.push('Crucible');   ??????
    //  break;

    // loop through matching conditions
    matchTable.forEach((ruleset) => {
      // match against strings or regexes
      if (ruleset.matches)
        ruleset.matches.forEach((match) => {
          // convert to regex if it isn't
          if (!match.test) match = new RegExp(match, 'i');

          // and run the regex
          if (
            (ruleset.test.includes('desc') && match.test(description)) ||
            (ruleset.test.includes('name') && match.test(name))
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
          if (categoryHashes.includes(findhash))
            Object.entries(ruleset.assign).forEach(([assignTo, assignValue]) => {
              thisBounty[assignTo][assignValue] = true;
            });
        });
    });

    Object.entries(thisBounty).forEach(([key, value]) => {
      if (typeof value == 'object') thisBounty[key] = Object.keys(value);
    });
    bounties[hash] = thisBounty;
    if (debug) {
      bounties[hash].description = description; // For Debugging Only
      bounties[hash].name = name; // For Debugging Only
    }
    //bounties[hash].location = location;
    //bounties[hash].damageType = damageType;
    //bounties[hash].enemyType = enemyType;
    //bounties[hash].weaponType = weaponType;
    //bounties[hash].eventType = eventType;
    if (bounties[hash].requiredItems[0])
      bounties[hash].requiredItems = requirements[bounties[hash].requiredItems[0]];
  }
});

writeFilePretty('./output/bounties.json', bounties);
