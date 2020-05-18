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
exports.__esModule = true;
var writeFile = require('./helpers.js').writeFile;
var node_1 = require('destiny2-manifest/node');
var bounty_config_1 = require('../data/bounties/bounty-config');
node_1.loadLocal();
var inventoryItems = node_1.getAll('DestinyInventoryItemDefinition');
var debug = false;
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
// acceptable item categories
var categoryWhitelist = [
  16,
  //53, // Quests
  27,
  1784235469,
];
// const definitionTypes = ['Place', 'ActivityMode', 'DamageType', 'ItemCategory']; //, 'Activity'];
// collects definition->bounty associations
// const toBounty:{[key:string]:{}} = {};
// collects bounty->definition associations
var bounties = {};
// definitionTypes.forEach((definitionType) => {
//   toBounty[definitionType] = {};
// });
var accessors = {
  name: function (item) {
    return item.displayProperties.name;
  },
  desc: function (item) {
    return item.displayProperties.description;
  },
  obj: function (item) {
    return (
      item.objectives &&
      item.objectives.objectiveHashes
        .map(function (o) {
          var _a;
          var obj = node_1.get('DestinyObjectiveDefinition', o);
          return (
            ((_a = obj === null || obj === void 0 ? void 0 : obj.displayProperties) === null ||
            _a === void 0
              ? void 0
              : _a.name) || (obj === null || obj === void 0 ? void 0 : obj.progressDescription)
          );
        })
        .join()
    );
  },
  type: function (item) {
    return item.itemTypeAndTierDisplayName;
  },
};
var matchTypes = ['name', 'desc', 'obj', 'type'];
function assign(ruleset, bounty) {
  Object.entries(ruleset.assign).forEach(function (_a) {
    var _b = __read(_a, 2),
      assignTo = _b[0],
      assignValues = _b[1];
    //:[keyof typeof ruleset,number[]]
    // add these values to the bounty's attributes
    bounty[assignTo] = __spread(new Set(__spread(bounty[assignTo], assignValues)));
  });
}
// loop through the manifest's bounties
inventoryItems.forEach(function (inventoryItem) {
  var _a, _b, _c, _d, _e, _f, _g;
  // filter loops through acceptable categories -- includes loops through item's hashes
  if (
    !categoryWhitelist.some(function (findHash) {
      var _a;
      return (_a = inventoryItem.itemCategoryHashes) === null || _a === void 0
        ? void 0
        : _a.includes(findHash);
    }) &&
    !((_b =
      (_a = inventoryItem.inventory) === null || _a === void 0 ? void 0 : _a.stackUniqueLabel) ===
      null || _b === void 0
      ? void 0
      : _b.includes('bounties'))
  ) {
    return;
  }
  // normalize bounty's available data
  var thisBounty = {};
  // loop through matching conditions
  bounty_config_1.matchTable.forEach(function (ruleset) {
    // match against strings or regexen
    matchTypes.forEach(function (matchType) {
      var _a;
      (_a = ruleset[matchType]) === null || _a === void 0
        ? void 0
        : _a.forEach(function (match) {
            // convert regex||string to regex
            match = match instanceof RegExp ? match : new RegExp(escapeRegExp(match));
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
    // if (ruleset.categoryHashes) {
    //   ruleset.categoryHashes.forEach((findHash) => {
    //     if (inventoryItem.itemCategoryHashes?.includes(findHash)) {
    //       assign(ruleset, thisBounty);
    //     }
    //   });
    // }
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
  // Manually fix up some crucible bounties
  if (
    !thisBounty.ActivityMode &&
    inventoryItem.inventory &&
    inventoryItem.inventory.stackUniqueLabel &&
    inventoryItem.inventory.stackUniqueLabel.includes('crucible.daily')
  ) {
    thisBounty.ActivityMode = [1164760504];
  }
  if (debug) {
    console.log({
      hash: inventoryItem.hash,
      name: inventoryItem.displayProperties.name,
      description: inventoryItem.displayProperties.description,
      objectives:
        (_c = inventoryItem.objectives) === null || _c === void 0
          ? void 0
          : _c.objectiveHashes.map(function (o) {
              var obj = node_1.get('DestinyObjectiveDefinition', o);
              (obj === null || obj === void 0 ? void 0 : obj.displayProperties.name) ||
                (obj === null || obj === void 0 ? void 0 : obj.progressDescription);
            }),
      type: inventoryItem.itemTypeAndTierDisplayName,
      places:
        (_d = thisBounty.Place) === null || _d === void 0
          ? void 0
          : _d.map(function (p) {
              var _a;
              var def =
                (_a = node_1.get('DestinyPlaceDefinition', p)) === null || _a === void 0
                  ? void 0
                  : _a.displayProperties.name;
            }),
      activities:
        (_e = thisBounty.ActivityMode) === null || _e === void 0
          ? void 0
          : _e.map(function (a) {
              var _a;
              var def =
                (_a = node_1.get('DestinyActivityModeDefinition', a)) === null || _a === void 0
                  ? void 0
                  : _a.displayProperties.name;
            }),
      dmg:
        (_f = thisBounty.DamageType) === null || _f === void 0
          ? void 0
          : _f.map(function (a) {
              var _a;
              var def =
                (_a = node_1.get('DestinyDamageTypeDefinition', a)) === null || _a === void 0
                  ? void 0
                  : _a.displayProperties.name;
            }),
      item:
        (_g = thisBounty.ItemCategory) === null || _g === void 0
          ? void 0
          : _g.map(function (a) {
              var _a;
              var def =
                (_a = node_1.get('DestinyItemCategoryDefinition', a)) === null || _a === void 0
                  ? void 0
                  : _a.displayProperties.name;
            }),
    });
  }
});
var allFile = bounties;
/*
//writeFile('./output/relationships-by-inventoryItem.json', bounties);
definitionTypes.forEach((definitionType) => {
  //writeFile(`./output/inventoryItems-by-${definitionType.toLowerCase()}.json`, toBounty[definitionType]);
  allFile[definitionType] = toBounty[definitionType];
});
*/
writeFile('./output/pursuits.json', allFile);
