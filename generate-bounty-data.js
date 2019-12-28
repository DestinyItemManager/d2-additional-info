const { writeFile, getMostRecentManifest } = require('./helpers.js');
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);
const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

const { matchTable } = require('./data/bounties/bounty-config.js');

const debug = true;

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// acceptable item categories
const categoryWhitelist = [
  16, // Quest Steps
  //53, // Quests
  27, // More bounties??
  1784235469 // Bounties
  //2005599723, // Prophecy Offerings
];

const matchTypes = ['name', 'desc', 'obj'];
const definitionTypes = ['Place', 'ActivityMode', 'DamageType', 'ItemCategory']; //, 'Activity'];

// collects definition->bounty associations
const toBounty = {};

// collects bounty->definition associations
const bounties = {};

definitionTypes.forEach((definitionType) => {
  toBounty[definitionType] = {};
});

const accessors = {
  name: (item) => item.displayProperties.name,
  desc: (item) => item.displayProperties.description,
  obj: (item) =>
    item.objectives &&
    item.objectives.objectiveHashes.map(
      (o) =>
        mostRecentManifestLoaded.DestinyObjectiveDefinition[o].displayProperties.name ||
        mostRecentManifestLoaded.DestinyObjectiveDefinition[o].progressDescription
    )
};

function assign(ruleset, bounty) {
  Object.entries(ruleset.assign).forEach(([assignTo, assignValues]) => {
    // add these values to the bounty's attributes
    bounty[assignTo] = bounty[assignTo]
      ? [...new Set(bounty[assignTo].concat(assignValues))]
      : Array.from(assignValues);

    /*
    // add this bounty hash to the appropriate lookup tables
    assignValues.forEach(
      (assignValue) =>
        (toBounty[assignTo][assignValue] || (toBounty[assignTo][assignValue] = [])) &&
        (toBounty[assignTo][assignValue] = [
          ...new Set(toBounty[assignTo][assignValue].concat([inventoryItem.hash]))
        ])
    );
    */
  });
}

// loop through the manifest's bounties
Object.values(inventoryItems).forEach(function(inventoryItem) {
  // itemCategoryHashes may be missing on classified objects
  inventoryItem.itemCategoryHashes = inventoryItem.itemCategoryHashes || [];

  // filter loops through acceptable categories -- includes loops through item's hashes
  if (
    !categoryWhitelist.some((findHash) => inventoryItem.itemCategoryHashes.includes(findHash)) &&
    !(
      inventoryItem.inventory &&
      inventoryItem.inventory.stackUniqueLabel &&
      inventoryItem.inventory.stackUniqueLabel.includes('bounties')
    )
  ) {
    return;
  }

  // normalize bounty's available data

  let thisBounty = {};
  // loop through matching conditions
  matchTable.forEach((ruleset) => {
    // match against strings or regexen
    matchTypes.forEach((matchType) => {
      if (ruleset[matchType])
        ruleset[matchType].forEach((match) => {
          // convert regex||string to regex
          match = match instanceof RegExp ? match : new RegExp(escapeRegExp(match));

          // TODO: have functions that map to extractors
          // go through all the objectives
          // have a function for doing assign

          // and run the regex
          if (match.test(accessors[matchType](inventoryItem))) {
            assign(ruleset, thisBounty);
          }
        });
    });

    // TODO: go through vendor defs and see who sells what??
    // match against vendorHashes
    //if (ruleset.vendorHashes)
    //  ruleset.vendorHashes.forEach((findHash) => {
    //    if (inventoryItem.sourceData.vendorSources[0] && inventoryItem.sourceData.vendorSources[0].vendorHash == findHash)
    //      Object.entries(ruleset.assign).forEach(([assignTo, assignValue]) => {
    //        thisBounty[assignTo][assignValue] = true;
    //      });
    //  });

    // match against categoryHashes
    if (ruleset.categoryHashes) {
      ruleset.categoryHashes.forEach((findHash) => {
        if (inventoryItem.itemCategoryHashes.includes(findHash)) {
          assign(ruleset, thisBounty);
        }
      });
    }

    // convert objects to arrays
    //  Object.entries(thisBounty).forEach(([key, value]) => {
    //    if (typeof value == 'object') thisBounty[key] = Object.keys(value);
    //  });

    // add debug string

    // inject requiredItems array. unsure why do instead of leaving a reference string
    //  if (!debug && thisBounty.requiredItems[0])
    //    thisBounty.requiredItems = requirements[thisBounty.requiredItems[0]];
    //console.log(inventoryItem.hash);
    if (Object.keys(thisBounty).length > 0) {
      bounties[inventoryItem.hash] = thisBounty;
    }
  });

  if (debug) {
    console.log({
      name: inventoryItem.displayProperties.name,
      description: inventoryItem.displayProperties.description,
      objectives:
        inventoryItem.objectives &&
        inventoryItem.objectives.objectiveHashes.map(
          (o) =>
            mostRecentManifestLoaded.DestinyObjectiveDefinition[o].displayProperties.name ||
            mostRecentManifestLoaded.DestinyObjectiveDefinition[o].progressDescription
        ),
      places:
        thisBounty.Place &&
        thisBounty.Place.map(
          (p) =>
            mostRecentManifestLoaded.DestinyPlaceDefinition[p] &&
            mostRecentManifestLoaded.DestinyPlaceDefinition[p].displayProperties.name
        ),
      activities:
        thisBounty.ActivityMode &&
        thisBounty.ActivityMode.map(
          (a) =>
            mostRecentManifestLoaded.DestinyActivityModeDefinition[a] &&
            mostRecentManifestLoaded.DestinyActivityModeDefinition[a].displayProperties.name
        ),
      dmg:
        thisBounty.DamageType &&
        thisBounty.DamageType.map(
          (a) =>
            mostRecentManifestLoaded.DestinyDamageTypeDefinition[a] &&
            mostRecentManifestLoaded.DestinyDamageTypeDefinition[a].displayProperties.name
        ),
      item:
        thisBounty.ItemCategory &&
        thisBounty.ItemCategory.map(
          (a) =>
            mostRecentManifestLoaded.DestinyItemCategoryDefinition[a] &&
            mostRecentManifestLoaded.DestinyItemCategoryDefinition[a].displayProperties.name
        )
    });
  }
});

const allFile = bounties;

/*
//writeFile('./output/relationships-by-inventoryItem.json', bounties);
definitionTypes.forEach((definitionType) => {
  //writeFile(`./output/inventoryItems-by-${definitionType.toLowerCase()}.json`, toBounty[definitionType]);
  allFile[definitionType] = toBounty[definitionType];
});
*/

writeFile('./output/pursuits.json', allFile);
