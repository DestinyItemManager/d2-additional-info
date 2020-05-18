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
var e_1, _a, e_2, _b;
exports.__esModule = true;
var node_1 = require('destiny2-manifest/node');
var helpers_1 = require('./helpers');
node_1.loadLocal();
var inventoryItems = node_1.getAll('DestinyInventoryItemDefinition');
// known mods specifically corresponding to seasons that i hope won't somehow change
var seasonNumberByExampleMod = {
  'Taken Armaments': 4,
  'Fallen Armaments': 5,
  'Hive Armaments': 7,
  'Relay Defender': 8,
  'Stacks on Stacks': 9,
  'Blessing of Rasputin': 10,
};
// anyway,
var modMetadataBySlotTag = {};
/** converts season number into example plugCategoryHash */
var modTypeExampleHashesBySeason = {};
// since i don't want to assume item hashes won't change, we look for some specific (y3-style) mods by name
inventoryItems.forEach(function (item) {
  if (
    item.collectibleHash && // having a collectibleHash excludes the consumable (y2) mods
    isSpecialtyMod(item) &&
    item.displayProperties.name in seasonNumberByExampleMod // looking for only the specific mods listed above
  ) {
    var modSeason = seasonNumberByExampleMod[item.displayProperties.name];
    if (!modTypeExampleHashesBySeason[modSeason])
      modTypeExampleHashesBySeason[modSeason] = item.plug.plugCategoryHash;
  }
});
// the point of the above was to get an example compatibility hash for each Season (4, 5, 7, 8, 9, etc)
// this way we can identify the gathered compatibility hashes by season, to do the whole
// "one season before, one season after" thing
// /////////////////
// the goal is to index our final output by "empty slot" hash,
// but the thing they all have in common is itemTypeDisplayName
// so we index by that temporarily
// and later swap keys (itemTypeDisplayName) for emptySlotItemHash
inventoryItems.forEach(function (item) {
  if (isSpecialtyMod(item)) {
    var displayName = modShortName(item);
    if (!(displayName in modMetadataBySlotTag)) {
      modMetadataBySlotTag[displayName] = {
        season: 0,
        tag: modShortName(item),
        compatibleTags: [],
        thisSlotPlugCategoryHashes: [],
        compatiblePlugCategoryHashes: [],
        emptyModSocketHashes: [],
      };
    }
    if (
      !modMetadataBySlotTag[displayName].thisSlotPlugCategoryHashes.includes(
        item.plug.plugCategoryHash
      )
    ) {
      modMetadataBySlotTag[displayName].thisSlotPlugCategoryHashes.push(item.plug.plugCategoryHash);
    }
    // we do special processing if one of the mods we looped through is an "empty slot" plug.
    // from this mod's description, we can determine the "also compatible" seasons
    // we need to finish collecting all hashes before we resolves seasons into groups of hashes,
    // so for now, we stick season numbers instead of mod hashes, into compatiblePlugCategoryHashes
    if (item.displayProperties.name === 'Empty Mod Socket') {
      // generate extra compatible seasons info
      var matches = item.displayProperties.description.match(/\b\d+\b/g);
      if (matches)
        modMetadataBySlotTag[displayName].compatiblePlugCategoryHashes = matches.map(function (n) {
          return Number(n);
        });
    }
    if (
      item.displayProperties.name === 'Empty Mod Socket' ||
      item.displayProperties.name === "Riven's Curse"
    ) {
      // generate initial mod info
      if (!modMetadataBySlotTag[displayName].emptyModSocketHashes.includes(item.hash))
        modMetadataBySlotTag[displayName].emptyModSocketHashes.push(item.hash);
    }
    // if it's one of those example mods from earlier, we can now insert the season number into the metadata object
    if (item.collectibleHash && item.displayProperties.name in seasonNumberByExampleMod)
      modMetadataBySlotTag[displayName].season = Number(
        Object.entries(modTypeExampleHashesBySeason).find(function (_a) {
          var _b = __read(_a, 2),
            pch = _b[1];
          return pch === item.plug.plugCategoryHash;
        })[0]
      );
  }
});
// after this, we are done treating modMetadataBySlotTag like an object, accesing it by itemTypeDisplayName
// and want to loop over its values and do stuff to them, so we turn into into an array and sort it by season
var modMetadataBySlotTagV2 = Object.values(modMetadataBySlotTag).sort(function (a, b) {
  return a.season - b.season;
});
var _loop_1 = function (modMetadataEntry) {
  var allCompatibleSlotHashes = [];
  modMetadataEntry.compatiblePlugCategoryHashes.forEach(function (seasonNumber) {
    var modMetadataForThisSeasonNumber = Object.values(modMetadataBySlotTag).find(function (
      singleModMetadata
    ) {
      return singleModMetadata.thisSlotPlugCategoryHashes.includes(
        modTypeExampleHashesBySeason[seasonNumber]
      );
    });
    var modTypesForThisSeasonNumber =
      modMetadataForThisSeasonNumber && modMetadataForThisSeasonNumber.thisSlotPlugCategoryHashes;
    if (modTypesForThisSeasonNumber)
      allCompatibleSlotHashes = __spread(allCompatibleSlotHashes, modTypesForThisSeasonNumber);
  });
  modMetadataEntry.compatiblePlugCategoryHashes = allCompatibleSlotHashes;
};
try {
  // we loop back through all the compatiblePlugCategoryHashes and turn their season #s into that season's compatibility hashes
  for (
    var modMetadataBySlotTagV2_1 = __values(modMetadataBySlotTagV2),
      modMetadataBySlotTagV2_1_1 = modMetadataBySlotTagV2_1.next();
    !modMetadataBySlotTagV2_1_1.done;
    modMetadataBySlotTagV2_1_1 = modMetadataBySlotTagV2_1.next()
  ) {
    var modMetadataEntry = modMetadataBySlotTagV2_1_1.value;
    _loop_1(modMetadataEntry);
  }
} catch (e_1_1) {
  e_1 = { error: e_1_1 };
} finally {
  try {
    if (
      modMetadataBySlotTagV2_1_1 &&
      !modMetadataBySlotTagV2_1_1.done &&
      (_a = modMetadataBySlotTagV2_1['return'])
    )
      _a.call(modMetadataBySlotTagV2_1);
  } finally {
    if (e_1) throw e_1.error;
  }
}
var _loop_2 = function (modMetadataEntry) {
  modMetadataEntry.compatibleTags = Object.values(modMetadataBySlotTag)
    .filter(function (singleModMetadata) {
      return singleModMetadata.compatiblePlugCategoryHashes.some(function (compat) {
        return modMetadataEntry.thisSlotPlugCategoryHashes.includes(compat);
      });
    })
    .map(function (singleModMetadata) {
      return singleModMetadata.tag;
    });
};
try {
  // fill in compatibleTags
  for (
    var modMetadataBySlotTagV2_2 = __values(modMetadataBySlotTagV2),
      modMetadataBySlotTagV2_2_1 = modMetadataBySlotTagV2_2.next();
    !modMetadataBySlotTagV2_2_1.done;
    modMetadataBySlotTagV2_2_1 = modMetadataBySlotTagV2_2.next()
  ) {
    var modMetadataEntry = modMetadataBySlotTagV2_2_1.value;
    _loop_2(modMetadataEntry);
  }
} catch (e_2_1) {
  e_2 = { error: e_2_1 };
} finally {
  try {
    if (
      modMetadataBySlotTagV2_2_1 &&
      !modMetadataBySlotTagV2_2_1.done &&
      (_b = modMetadataBySlotTagV2_2['return'])
    )
      _b.call(modMetadataBySlotTagV2_2);
  } finally {
    if (e_2) throw e_2.error;
  }
}
helpers_1.writeFile('./output/specialty-modslot-metadata.json', modMetadataBySlotTag);
function isSpecialtyMod(item) {
  return (
    item.itemCategoryHashes &&
    item.itemCategoryHashes.includes(59) &&
    item.plug &&
    (item.plug.plugCategoryIdentifier.includes('enhancements.season_') ||
      item.plug.plugCategoryIdentifier.includes('enhancements.rivens_curse') ||
      item.plug.plugCategoryIdentifier.includes('enhancements.activity'))
  );
}
function modShortName(item) {
  return item.itemTypeDisplayName.toLowerCase().split(' ')[0];
}
