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
var helpers_1 = require('./helpers');
var categories_json_1 = __importDefault(require('../data/sources/categories.json'));
var generate_missing_collectible_info_1 = require('./generate-missing-collectible-info');
var stringify_object_1 = __importDefault(require('stringify-object'));
node_1.loadLocal();
var inventoryItems = node_1.getAll('DestinyInventoryItemDefinition');
var collectibles = node_1.getAll('DestinyCollectibleDefinition');
/*================================================================================================================================*\
||
|| categorizeSources()
|| converts manifest's sourceHashes and sourceStrings into DIM filters according to categories.json rules
||
\*================================================================================================================================*/
var newSource = {};
collectibles.forEach(function (collectible) {
  var hash = collectible.sourceHash;
  var sourceName = collectible.sourceString
    ? collectible.sourceString
    : collectible.displayProperties.description;
  if (hash) {
    // Only add sources that have an existing hash (eg. no classified items)
    newSource[hash] = sourceName;
  }
});
helpers_1.writeFile('./output/sources.json', newSource);
categorizeSources();
function categorizeSources() {
  var sourcesInfo = {};
  var D2Sources = {}; // converts search field short source tags to item & source hashes
  // sourcesInfo built from manifest collectibles
  collectibles.forEach(function (collectible) {
    if (collectible.sourceHash) {
      sourcesInfo[collectible.sourceHash] = collectible.sourceString;
    }
  });
  // add any manual source strings from categories.json
  categories_json_1['default'].exceptions.forEach(function (_a) {
    var _b = __read(_a, 2),
      sourceHash = _b[0],
      sourceString = _b[1];
    sourcesInfo[sourceHash] = sourceString;
  });
  // loop through categorization rules
  Object.entries(categories_json_1['default'].sources).forEach(function (_a) {
    var _b = __read(_a, 2),
      sourceTag = _b[0],
      matchRule = _b[1];
    var _c;
    // initialize this source's object
    D2Sources[sourceTag] = {
      itemHashes: [],
      sourceHashes: [],
    };
    // string match this category's source descriptions
    D2Sources[sourceTag].sourceHashes = generate_missing_collectible_info_1.objectSearchValues(
      sourcesInfo,
      matchRule
    );
    if (!D2Sources[sourceTag].sourceHashes.length) {
      console.log('no matching sources for: ' + matchRule);
    }
    // add individual items if available for this category
    if (categories_json_1['default'].sources[sourceTag].items) {
      (_c = categories_json_1['default'].sources[sourceTag].items) === null || _c === void 0
        ? void 0
        : _c.forEach(function (itemNameOrHash) {
            Object.entries(inventoryItems).forEach(function (_a) {
              var _b = __read(_a, 2),
                itemHash = _b[0],
                itemProperties = _b[1];
              if (
                itemNameOrHash == itemHash ||
                itemProperties.displayProperties.name == itemNameOrHash
              ) {
                D2Sources[sourceTag].itemHashes.push(Number(itemHash));
              }
            });
            D2Sources[sourceTag].itemHashes = helpers_1.uniqAndSortArray(
              D2Sources[sourceTag].itemHashes
            );
          });
    }
    // lastly add aliases and copy info
    var alias = categories_json_1['default'].sources[sourceTag].alias;
    if (alias) {
      D2Sources[alias] = D2Sources[sourceTag];
    }
  });
  // sort the object after adding in the aliases
  var D2SourcesSorted = helpers_1.sortObject(D2Sources);
  var pretty =
    'const D2Sources: { [key: string]: { itemHashes: number[]; sourceHashes: number[] } } = ' +
    stringify_object_1['default'](D2SourcesSorted, {
      indent: '  ',
    }) +
    ';\n\nexport default D2Sources;';
  // annotate the file with sources or item names next to matching hashes
  var annotated = pretty.replace(/'(\d{2,})',?/g, function (match, submatch) {
    if (sourcesInfo[submatch]) {
      return Number(submatch) + ', // ' + sourcesInfo[submatch];
    }
    if (inventoryItems[submatch]) {
      return Number(submatch) + ', // ' + inventoryItems[submatch].displayProperties.name;
    }
    console.log('unable to find information for hash ' + submatch);
    return Number(submatch) + ', // could not identify hash';
  });
  helpers_1.writeFile('./output/source-info.ts', annotated);
}
