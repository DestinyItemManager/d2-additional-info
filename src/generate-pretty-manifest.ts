import { allManifest, loadLocal } from 'destiny2-manifest/node';

import { writeFile } from './helpers';

loadLocal();

Object.entries(allManifest!).forEach(function ([table, tableData]) {
  const shortName = table.match(/^Destiny(\w+)Definition$/)![1];
  writeFile(`./manifest_tables/${shortName}.json`, tableData);
});

writeFile('./manifest_tables/all.json', allManifest!);
