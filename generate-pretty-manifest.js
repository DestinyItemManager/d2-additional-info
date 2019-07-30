const { getMostRecentManifest, writeFile } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

Object.entries(mostRecentManifestLoaded).forEach(function([table, tableData]) {
  table = table.replace('Destiny', '').replace('Definition', '');
  writeFile(
    `./manifest_tables/${table}.json`,
    mostRecentManifestLoaded[`Destiny${table}Definition`]
  );
});

writeFile('./manifest_tables/all.json', mostRecentManifestLoaded);
