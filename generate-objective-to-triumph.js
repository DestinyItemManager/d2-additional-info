const { writeFilePretty, getMostRecentManifest } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const records = mostRecentManifestLoaded.DestinyRecordDefinition;

// e.g. 'Complete Crucible Triumph The Stuff of Myth.';

const objectiveToTriumphHash = {};

Object.values(inventoryItems).forEach(function(item) {
  const objectiveHash = item.hash;
  const description = item.displayProperties.description;
  var match;
  if (
    /complet.+triumph/i.test(description) && // instructs you to complete a triumph
    (match = description.match(/"\W*(\w[^"]+\w)\W*"/)) && // proceed if a triumph name was matched
    item.objectives // make sure this is an item with objectives b/c emblem descriptions also mention triumphs
  ) {
    const triumphName = match[1];
    console.log(`found \`${triumphName}\``);
    Object.values(records).forEach(function(triumph) {
      if (triumphName === triumph.displayProperties.name) {
        objectiveToTriumphHash[objectiveHash] = triumph.hash;
      }
    });
  }
});

writeFilePretty('./output/objective-triumph.json', objectiveToTriumphHash);
