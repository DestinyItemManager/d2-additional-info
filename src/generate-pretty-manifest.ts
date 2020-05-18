const { getMostRecentManifest, writeFile } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

Object.entries(mostRecentManifestLoaded).forEach(function([table, tableData]) {
  const shortName = table.match(/^Destiny(\w+)Definition$/)[1];
  writeFile(`./manifest_tables/${shortName}.json`, tableData);
});

writeFile('./manifest_tables/all.json', mostRecentManifestLoaded);
