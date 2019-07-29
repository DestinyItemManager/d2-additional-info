/*================================================================================================================================*\
||
|| Helper Functions
||
||
\*================================================================================================================================*/
const seasonInfo = require('./data/seasons/d2-season-info.js');
const eventInfo = require('./data/events/d2-event-info.js');
const fs = require('fs');
const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

var self = (module.exports = {
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
  writeFilePretty: function(filename, obj) {
    const content = JSON.stringify(obj, null, 2);
    fs.writeFileSync(filename, content + '\n', 'utf8', function(err) {
      if (err) {
        return console.log(err);
      }
    });
    console.log(`${filename} saved.`);
    self.prettier(filename);
  },
  writeFile: function(filename, obj) {
    fs.writeFileSync(filename, obj + '\n', 'utf8', function(err) {
      if (err) {
        return console.log(err);
      }
    });
    console.log(`${filename} saved.`);
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
  getSourceBlacklist: function() {
    let sourceBlacklist = [];
    Object.keys(eventInfo.D2EventInfo).forEach(function(key) {
      sourceBlacklist = sourceBlacklist.concat(eventInfo.D2EventInfo[key].sources);
    });
    return sourceBlacklist;
  },
  prettier: function(filename) {
    execSync(`yarn prettier -c "${filename}" --write`);
  }
});
