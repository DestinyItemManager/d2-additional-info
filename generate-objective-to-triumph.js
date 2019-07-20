const { writeFilePretty, getMostRecentManifest } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const records = mostRecentManifestLoaded.DestinyRecordDefinition;

// e.g. 'Complete Crucible Triumph The Stuff of Myth.';

const objectiveToTriumphHash = {};

Object.values(inventoryItems).forEach(function(item) {
  const objectiveHash = item.hash;
  const description = item.displayProperties.description;
  if (description.includes('Triumph "')) {
    const triumphName = description.match(/"([^"]+)."/)[1];
    Object.values(records).forEach(function(triumph) {
      if (triumphName === triumph.displayProperties.name) {
        objectiveToTriumphHash[objectiveHash] = triumph.hash;
      }
    });
  }
});

writeFilePretty('./output/objective-triumph.json', objectiveToTriumphHash);
