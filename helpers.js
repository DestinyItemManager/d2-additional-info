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
  }
};
