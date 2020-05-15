/*================================================================================================================================*\
||
|| Helper Functions
||
||
\*================================================================================================================================*/
const seasonInfo = require('./data/seasons/d2-season-info.js');
const fs = require('fs');
const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

module.exports = {
  getCurrentSeason: function() {
    let seasonDate;
    const maxSeasons = Object.keys(seasonInfo.D2SeasonInfo).length;
    const today = new Date(Date.now());
    for (let i = maxSeasons; i > 0; i--) {
      seasonDate = new Date(
        `${seasonInfo.D2SeasonInfo[i].releaseDate}T${seasonInfo.D2SeasonInfo[i].resetTime}`
      );
      seasonDate.setDate(seasonDate.getDate() - 1);
      if (today >= seasonDate) {
        return seasonInfo.D2SeasonInfo[i].season;
      }
    }
    return 0;
  },
  getMostRecentManifest: function() {
    const isDirectory = (source) => lstatSync(source).isDirectory();
    const getDirectories = (source) =>
      readdirSync(source)
        .map((name) => join(source, name))
        .filter(isDirectory);
    const getFiles = (source) => readdirSync(source).map((name) => join(source, name));

    let manifestDirs = getDirectories('./manifests');

    let latest = manifestDirs[manifestDirs.length - 1];
    let manifest = getFiles(latest);
    return manifest[manifest.length - 1];
  },
  writeFile: function(filename, data, pretty = true) {
    if (typeof data === 'object') {
      data = JSON.stringify(data, null, 2);
    }
    fs.writeFileSync(filename, data + '\n', 'utf8', function(err) {
      if (err) {
        return console.log(err);
      }
    });
    if (pretty) {
      execSync(`yarn prettier -c "${filename}" --write`);
    }
    console.log(`${filename} saved.`);
  },
  uniqAndSortArray: function(array) {
    temp = [...new Set(array)].sort(function(a, b) {
      return a - b;
    });
    return temp;
  },
  diffArrays: function(all, exclude) {
    let difference = [];
    difference = all.filter(function(x) {
      if (!exclude.includes(x)) {
        return true;
      } else {
        return false;
      }
    });
    return [...new Set(difference)];
  },
  sortObject: function(o) {
    const sorted = {};
    const a = [];

    Object.keys(o).forEach(function(key) {
      a.push(key);
    });

    a.sort();

    for (let key = 0; key < a.length; key++) {
      sorted[a[key]] = o[a[key]];
    }

    return sorted;
  },
  isEqual: function(value, other) {
    // https://gomakethings.com/check-if-two-arrays-or-objects-are-equal-with-javascript/
    // Get the value type
    var type = Object.prototype.toString.call(value);

    // If the two objects are not the same type, return false
    if (type !== Object.prototype.toString.call(other)) return false;

    // If items are not an object or array, return false
    if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

    // Compare the length of the length of the two items
    var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
    var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
    if (valueLen !== otherLen) return false;

    // Compare two items
    var compare = function(item1, item2) {
      // Get the object type
      var itemType = Object.prototype.toString.call(item1);

      // If an object or array, compare recursively
      if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
        if (!isEqual(item1, item2)) return false;
      }

      // Otherwise, do a simple comparison
      else {
        // If the two items are not the same type, return false
        if (itemType !== Object.prototype.toString.call(item2)) return false;

        // Else if it's a function, convert to a string and compare
        // Otherwise, just compare
        if (itemType === '[object Function]') {
          if (item1.toString() !== item2.toString()) return false;
        } else {
          if (item1 !== item2) return false;
        }
      }
    };

    // Compare properties
    if (type === '[object Array]') {
      for (var i = 0; i < valueLen; i++) {
        if (compare(value[i], other[i]) === false) return false;
      }
    } else {
      for (var key in value) {
        if (value.hasOwnProperty(key)) {
          if (compare(value[key], other[key]) === false) return false;
        }
      }
    }

    // If nothing failed, return true
    return true;
  }
};
