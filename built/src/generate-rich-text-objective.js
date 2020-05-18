'use strict';
exports.__esModule = true;
var node_1 = require('destiny2-manifest/node');
var helpers_1 = require('./helpers');
node_1.loadLocal();
var objectives = node_1.getAll('DestinyObjectiveDefinition');
var perks = node_1.getAll('DestinySandboxPerkDefinition');
var iconFinder = /(\[[^\]]+\]|[\uE000-\uF8FF])/g;
var richTexts = {};
objectives.forEach(function (objective) {
  var match = objective.progressDescription && objective.progressDescription.match(iconFinder);
  if ((match === null || match === void 0 ? void 0 : match.length) === 1 && !richTexts[match[0]]) {
    richTexts[match[0]] = objective.hash;
  }
});
perks.forEach(function (perk) {
  var match =
    perk.displayProperties.description && perk.displayProperties.description.match(iconFinder);
  if ((match === null || match === void 0 ? void 0 : match.length) === 1 && !richTexts[match[0]]) {
    richTexts[match[0]] = perk.hash;
  }
});
helpers_1.writeFile('./output/objective-richTexts.json', helpers_1.sortObject(richTexts));
