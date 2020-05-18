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
var __values =
  (this && this.__values) ||
  function (o) {
    var s = typeof Symbol === 'function' && Symbol.iterator,
      m = s && o[s],
      i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === 'number')
      return {
        next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        },
      };
    throw new TypeError(s ? 'Object is not iterable.' : 'Symbol.iterator is not defined.');
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
var e_1, _a;
exports.__esModule = true;
var node_1 = require('destiny2-manifest/node');
var helpers_1 = require('./helpers');
var seasons_master_json_1 = __importDefault(require('../data/seasons/seasons_master.json'));
node_1.loadLocal();
var inventoryItems = node_1.getAll('DestinyInventoryItemDefinition');
var collectibles = node_1.getAll('DestinyCollectibleDefinition');
var calculatedSeason = helpers_1.getCurrentSeason();
// init an array in seasonNumbers for each season
var seasonNumbers = __spread(Array(calculatedSeason + 1).keys()).slice(1);
var seasonToSource = {};
seasonNumbers.forEach(function (num) {
  return (seasonToSource[num] = []);
});
var itemSource = {};
// loop through collectibles
inventoryItems.forEach(function (item) {
  var sourceHash = item.collectibleHash ? collectibles[item.collectibleHash].sourceHash : null;
  var season = seasons_master_json_1['default'][item.hash];
  if (sourceHash && season) {
    seasonToSource[season].push(sourceHash);
    itemSource[item.hash] = sourceHash;
  }
});
// uniq each season's collectibles
seasonNumbers.forEach(function (season) {
  return (seasonToSource[season] = __spread(new Set(seasonToSource[season])));
});
// Now to verify there are no intersections; if intersections remove source from seasonToSource
// notSeasonallyUnique contains sourceHashes which correspond to items in more than 1 season
var notSeasonallyUnique = [];
seasonNumbers.forEach(function (season_a) {
  seasonNumbers.forEach(function (season_b) {
    if (season_a < season_b)
      notSeasonallyUnique = notSeasonallyUnique.concat(
        seasonToSource[season_a].filter(function (hash) {
          return seasonToSource[season_b].includes(hash);
        })
      );
  });
});
notSeasonallyUnique = __spread(new Set(notSeasonallyUnique));
// remove entries in notSeasonallyUnique from seasonToSource
seasonNumbers.forEach(function (season) {
  seasonToSource[season].sort(function (a, b) {
    return a - b;
  });
  seasonToSource[season] = seasonToSource[season].filter(function (hash) {
    return !notSeasonallyUnique.includes(hash);
  });
});
var categoryBlacklist = [
  18,
  34,
  40,
  58,
  268598612,
  303512563,
  444756050,
  945330047,
  1334054322,
  1449602859,
  1576735337,
  1709863189,
  2005599723,
  2076918099,
  2150402250,
  2237038328,
  2250046497,
  2253669532,
  2411768833,
  2423200735,
  3055157023,
  3072652064,
  3085181971,
  3109687656,
  3360831066,
  3708671066,
  3836367751,
  3866509906,
  4184407433,
];
var sources = {};
for (var season in seasonToSource) {
  try {
    for (
      var _b = ((e_1 = void 0), __values(seasonToSource[season])), _c = _b.next();
      !_c.done;
      _c = _b.next()
    ) {
      var source = _c.value;
      sources[source] = Number(season);
    }
  } catch (e_1_1) {
    e_1 = { error: e_1_1 };
  } finally {
    try {
      if (_c && !_c.done && (_a = _b['return'])) _a.call(_b);
    } finally {
      if (e_1) throw e_1.error;
    }
  }
}
var seasonToSourceOutput = {
  categoryBlacklist: categoryBlacklist,
  sources: sources,
};
helpers_1.writeFile('./output/seasonToSource.json', seasonToSourceOutput);
var seasons = {};
inventoryItems.forEach(function (item) {
  var categoryHashes = item.itemCategoryHashes || [];
  var seasonBlacklisted = categoryBlacklist.filter(function (hash) {
    return categoryHashes.includes(hash);
  }).length;
  if (
    (notSeasonallyUnique.includes(itemSource[item.hash]) || !itemSource[item.hash]) &&
    !seasonBlacklisted &&
    (item.itemTypeDisplayName || categoryHashes.length)
  ) {
    seasons[item.hash] = seasons_master_json_1['default'][item.hash];
  }
});
var seasonsClean = removeItemsNoLongerInManifest(seasons);
helpers_1.writeFile('./output/seasons.json', seasonsClean);
function removeItemsNoLongerInManifest(seasons) {
  var hashesManifest = [];
  var hashesSeason = [];
  var deleted = 0;
  var matches = 0;
  Object.values(inventoryItems).forEach(function (item) {
    hashesManifest.push(String(item.hash));
  });
  Object.keys(seasons).forEach(function (hash) {
    hashesSeason.push(hash);
  });
  hashesSeason.forEach(function (hash) {
    if (hashesManifest.includes(hash)) {
      matches++;
    } else {
      deleted++;
      delete seasons[Number(hash)];
    }
  });
  console.log(matches + ' matches out of ' + hashesSeason.length + ' hashes.');
  console.log('Deleted ' + deleted + ' items.');
  return seasons;
}
