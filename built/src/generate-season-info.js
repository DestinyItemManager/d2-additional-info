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
var seasons_master_json_1 = __importDefault(require('../data/seasons/seasons_master.json'));
var d2_season_info_1 = __importDefault(require('../data/seasons/d2-season-info'));
node_1.loadLocal();
var inventoryItems = node_1.getAll('DestinyInventoryItemDefinition');
var calculatedSeason = helpers_1.getCurrentSeason();
inventoryItems.forEach(function (inventoryItem) {
  var hash = inventoryItem.hash;
  // Only add items not currently in db
  if (!seasons_master_json_1['default'][hash]) {
    seasons_master_json_1['default'][hash] = calculatedSeason;
  }
});
helpers_1.writeFile('./data/seasons/seasons_master.json', seasons_master_json_1['default']);
var seasonTags = Object.values(d2_season_info_1['default'])
  .filter(function (seasonInfo) {
    return seasonInfo.season <= calculatedSeason;
  })
  .map(function (seasonInfo) {
    return [seasonInfo.seasonTag, seasonInfo.season];
  })
  .reduce(function (acc, _a) {
    var _b = __read(_a, 2),
      tag = _b[0],
      num = _b[1];
    return (acc[tag] = num), acc;
  }, {});
helpers_1.writeFile('./output/season-tags.json', seasonTags);
