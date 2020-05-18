'use strict';
exports.__esModule = true;
var node_1 = require('destiny2-manifest/node');
var helpers_1 = require('./helpers');
node_1.loadLocal();
var inventoryItems = node_1.getAll('DestinyInventoryItemDefinition');
var records = node_1.getAll('DestinyRecordDefinition');
var debug = false || process.env.CI;
// e.g. 'Complete Crucible Triumph "The Stuff of Myth."';
var objectiveToTriumphHash = {};
Object.values(inventoryItems).forEach(function (item) {
  var objectiveHash = item.hash;
  var description = item.displayProperties.description;
  var match;
  if (
    item.itemCategoryHashes &&
    item.itemCategoryHashes.includes(16) && // make sure this is a quest step bc some emblems track objectives as well (2868525743)
    /complet.+triumph/i.test(description) && // instructs you to complete a triumph
    (match = description.match(/"\W*(\w[^"]+\w)\W*"/)) // proceed if a triumph name was matched
  ) {
    var triumphName_1 = match[1];
    if (debug) {
      console.log('found `' + triumphName_1 + '`');
    }
    Object.values(records).forEach(function (triumph) {
      if (triumphName_1 === triumph.displayProperties.name) {
        objectiveToTriumphHash[objectiveHash] = triumph.hash;
      }
    });
  }
});
helpers_1.writeFile('./output/objective-triumph.json', objectiveToTriumphHash);
