import { allManifest, loadLocal } from '@d2api/manifest-node';
import { makeDirIfMissing, writeFile } from './helpers.js';

loadLocal();

const dir = './manifest_tables';

makeDirIfMissing(dir);

Object.entries(allManifest!).forEach(function ([table, tableData]) {
  const shortName = table.match(/^Destiny(\w+)Definition$/)![1];
  writeFile(`${dir}/${shortName}.json`, tableData);
});

writeFile(`${dir}/all.json`, allManifest!);
