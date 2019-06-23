/*================================================================================================================================*\
||
|| Helper Functions
||
||
\*================================================================================================================================*/
const seasonInfo = require('./data/d2-season-info.js');
const fs = require('fs');
const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');
const mkdirp = require('mkdirp');

module.exports = {
  getCurrentSeason: function() {
    let seasonDate;
    const maxSeasons = Object.keys(seasonInfo.D2SeasonInfo).length;
    const today = new Date(Date.now());
    for (let i = maxSeasons; i > 0; i--) {
      seasonDate = new Date(
        `${seasonInfo.D2SeasonInfo[i].releaseDate}T${seasonInfo.D2SeasonInfo[i].resetTime}`
      );
      if (today >= seasonDate) {
        return seasonInfo.D2SeasonInfo[i].season;
      }
    }
    return 0;
  },
  writeFile: function(obj, filename, stringify = true) {
    const content = stringify ? JSON.stringify(obj, null, 2) : obj;
    fs.writeFile(filename, content, 'utf8', function(err) {
      if (err) {
        return console.log(err);
      }
    });
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
  storeManifest: function() {
    var todayDate = new Date();
    todayDate.setMinutes(todayDate.getMinutes() - todayDate.getTimezoneOffset());
    const today = todayDate.toISOString().slice(0, 10);

    mkdirp.sync(`./manifests/${today}`, function(err) {
      if (err) console.error(err);
    });

    fs.rename(`./${filename}`, `./manifests/${today}/${filename}`, (err) => {
      if (err) throw err;
    });
  }
};
