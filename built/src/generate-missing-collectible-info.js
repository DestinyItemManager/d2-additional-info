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
var __spread =
  (this && this.__spread) ||
  function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
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
var helpers_js_1 = require('./helpers.js');
node_1.loadLocal();
var inventoryItems = node_1.getAll('DestinyInventoryItemDefinition');
var collectibles = node_1.getAll('DestinyCollectibleDefinition');
var stringifyObject = require('stringify-object');
var missingCollectibleHashes = {};
// Every Inventory Item without a collectible hash
var nonCollectibleItems = inventoryItems.filter(function (item) {
  return !item.collectibleHash;
});
// Every Inventory Item with a collectible hash
var collectibleItems = inventoryItems.filter(function (item) {
  return item.collectibleHash;
});
collectibleItems.forEach(function (collectibleItem) {
  var itemsWithSameName = nonCollectibleItems.filter(function (nonCollectibleItem) {
    return (
      collectibleItem.displayProperties.name === nonCollectibleItem.displayProperties.name &&
      JSON.stringify(collectibleItem.itemCategoryHashes.sort()) ===
        JSON.stringify(nonCollectibleItem.itemCategoryHashes.sort())
    );
  });
  itemsWithSameName.forEach(function (nonCollectibleItem) {
    collectibles.filter(function (collectible) {
      var _a;
      if (collectibleItem.collectibleHash === collectible.hash) {
        missingCollectibleHashes[collectible.sourceHash] =
          (_a = missingCollectibleHashes[collectible.sourceHash]) !== null && _a !== void 0
            ? _a
            : [];
        missingCollectibleHashes[collectible.sourceHash].push(nonCollectibleItem.hash);
      }
    });
  });
});
var sourcesInfo = {};
var D2Sources = {}; // converts search field short source tags to item & source hashes
var newSourceInfo = {};
// sourcesInfo built from manifest collectibles
collectibles.forEach(function (collectible) {
  if (collectible.sourceHash) {
    sourcesInfo[collectible.sourceHash] = collectible.sourceString;
  }
});
// loop through categorization rules
Object.entries(categories_json_1['default'].sources).forEach(function (_a) {
  var _b = __read(_a, 2),
    sourceTag = _b[0],
    matchRule = _b[1];
  // string match this category's source descriptions
  D2Sources[sourceTag] = objectSearchValues(sourcesInfo, matchRule);
  if (!D2Sources[sourceTag].length) {
    console.log('no matching sources for: ' + matchRule);
  }
  Object.entries(D2Sources).forEach(function (_a) {
    var _b = __read(_a, 2),
      sourceTag = _b[0],
      sourceHashes = _b[1];
    Object.entries(missingCollectibleHashes).forEach(function (_a) {
      var _b = __read(_a, 2),
        sourceHash = _b[0],
        items = _b[1];
      if (sourceHashes.includes(Number(sourceHash))) {
        newSourceInfo[sourceTag] = items;
      }
    });
    newSourceInfo[sourceTag] = helpers_js_1.uniqAndSortArray(newSourceInfo[sourceTag]);
  });
  // lastly add aliases and copy info
  var alias = categories_json_1['default'].sources[sourceTag].alias;
  if (alias) {
    newSourceInfo[alias] = newSourceInfo[sourceTag];
  }
});
// sort the object after adding in the aliases
var D2SourcesSorted = helpers_1.sortObject(newSourceInfo);
var pretty =
  'const missingSources: { [key: string]: number[] } = ' +
  stringifyObject(D2SourcesSorted, {
    indent: '  ',
  }) +
  ';\n\nexport default missingSources;';
// annotate the file with sources or item names next to matching hashes
var annotated = pretty.replace(/(\d{2,}),?/g, function (match, submatch) {
  if (sourcesInfo[submatch]) {
    return Number(submatch) + ', // ' + sourcesInfo[submatch];
  }
  if (inventoryItems[submatch]) {
    return Number(submatch) + ', // ' + inventoryItems[submatch].displayProperties.name;
  }
  console.log('unable to find information for hash ' + submatch);
  return Number(submatch) + ', // could not identify hash';
});
helpers_1.writeFile('./output/missing-source-info.ts', annotated);
// searches haystack (collected manifest source strings) to match against needleInfo (a categories.json match rule)
// returns a list of source hashes
function objectSearchValues(haystack, needleInfo) {
  var searchResults = Object.entries(haystack); // [[hash, string],[hash, string],[hash, string]]
  // filter down to only search results that match conditions
  searchResults = searchResults.filter(function (_a) {
    var _b = __read(_a, 2),
      sourceString = _b[1];
    var _c, _d;
    // do inclusion strings match this sourceString?
    return (
      ((_c = needleInfo.includes) === null || _c === void 0
        ? void 0
        : _c.filter(function (searchTerm) {
            return sourceString.toLowerCase().includes(searchTerm.toLowerCase());
          }).length) &&
      // not any excludes or not any exclude matches
      !((_d =
        // do exclusion strings match this sourceString?
        needleInfo.excludes) === null || _d === void 0
        ? void 0
        : _d.filter(function (searchTerm) {
            return sourceString.toLowerCase().includes(searchTerm.toLowerCase());
          }).length)
    );
  });
  // extracts key 0 (sourcehash) from searchResults
  return __spread(
    new Set(
      searchResults.map(function (result) {
        return result[0];
      })
    )
  );
}
exports.objectSearchValues = objectSearchValues;
