'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
exports.__esModule = true;
var node_1 = require('destiny2-manifest/node');
var seasons_master_json_1 = __importDefault(require('../data/seasons/seasons_master.json'));
var helpers_1 = require('./helpers');
node_1.loadLocal();
var inventoryItems = node_1.getAll('DestinyInventoryItemDefinition');
var brightEngramExclusions = [
  'Crimson',
  'the Revelry',
  'Dawning',
  'Festival of the Lost',
  'Solstice',
];
var brightEngrams = {};
var engramCategoryHash = 34;
var hasTerm = function (string, terms) {
  return terms.some(function (term) {
    return string.includes(term);
  });
};
inventoryItems.forEach(function (inventoryItem) {
  var hash = inventoryItem.hash,
    itemTypeDisplayName = inventoryItem.itemTypeDisplayName;
  var _a = inventoryItem.displayProperties,
    description = _a.description,
    name = _a.name;
  var categoryHashes = inventoryItem.itemCategoryHashes || [];
  if (
    // if it's an engram
    categoryHashes.includes(engramCategoryHash) &&
    // and specifically a "Bright Engram"
    itemTypeDisplayName.includes('Bright Engram') &&
    // and the name & description don't include holiday terms
    !hasTerm(description, brightEngramExclusions) &&
    !hasTerm(name, brightEngramExclusions) &&
    // and there's a corresponding vendor table for this hash
    node_1.get('DestinyVendorDefinition', hash)
  ) {
    // get this specific item's season
    var season = seasons_master_json_1['default'][hash];
    // we found this season's Bright Engram
    brightEngrams[season] = hash;
  }
});
helpers_1.writeFile('./output/bright-engrams.json', brightEngrams);
