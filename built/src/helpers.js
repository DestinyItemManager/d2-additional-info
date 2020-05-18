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
exports.__esModule = true;
/*================================================================================================================================*\
||
|| Helper Functions
||
||
\*================================================================================================================================*/
var child_process_1 = require('child_process');
var d2_season_info_js_1 = __importDefault(require('../data/seasons/d2-season-info.js'));
var fs_1 = require('fs');
function getCurrentSeason() {
  var seasonDate;
  var maxSeasons = Object.keys(d2_season_info_js_1['default']).length;
  var today = new Date(Date.now());
  for (var i = maxSeasons; i > 0; i--) {
    seasonDate = new Date(
      d2_season_info_js_1['default'][i].releaseDate +
        'T' +
        d2_season_info_js_1['default'][i].resetTime
    );
    seasonDate.setDate(seasonDate.getDate() - 1);
    if (today >= seasonDate) {
      return d2_season_info_js_1['default'][i].season;
    }
  }
  return 0;
}
exports.getCurrentSeason = getCurrentSeason;
// export function getMostRecentManifest() {
//   const isDirectory = (source:string) => lstatSync(source).isDirectory();
//   const getDirectories = (source:string) =>
//     readdirSync(source)
//       .map((name) => join(source, name))
//       .filter(isDirectory);
//   const getFiles = (source:string) => readdirSync(source).map((name) => join(source, name));
//   let manifestDirs = getDirectories('./manifests');
//   let latest = manifestDirs[manifestDirs.length - 1];
//   let manifest = getFiles(latest);
//   return manifest[manifest.length - 1];
// }
function writeFile(filename, data, pretty) {
  if (pretty === void 0) {
    pretty = true;
  }
  if (typeof data === 'object') {
    data = JSON.stringify(data, null, 2);
  }
  fs_1.writeFileSync(filename, data + '\n', 'utf8');
  if (pretty) {
    child_process_1.execSync('yarn prettier -c "' + filename + '" --write');
  }
  console.log(filename + ' saved.');
}
exports.writeFile = writeFile;
function uniqAndSortArray(array) {
  return __spread(new Set(array)).sort();
}
exports.uniqAndSortArray = uniqAndSortArray;
function diffArrays(all, exclude) {
  return __spread(
    new Set(
      all.filter(function (x) {
        if (!exclude.includes(x)) {
          return true;
        } else {
          return false;
        }
      })
    )
  );
}
exports.diffArrays = diffArrays;
function sortObject(o) {
  var e_1, _a;
  var sorted = {};
  var a = Object.keys(o).sort();
  try {
    for (var a_1 = __values(a), a_1_1 = a_1.next(); !a_1_1.done; a_1_1 = a_1.next()) {
      var key = a_1_1.value;
      sorted[key] = o[key];
    }
  } catch (e_1_1) {
    e_1 = { error: e_1_1 };
  } finally {
    try {
      if (a_1_1 && !a_1_1.done && (_a = a_1['return'])) _a.call(a_1);
    } finally {
      if (e_1) throw e_1.error;
    }
  }
  return sorted;
}
exports.sortObject = sortObject;
