import { allManifest, load } from '@d2api/manifest-node';
import { makeDirIfMissing, writeFile } from './helpers.js';

await load();

const dir = './manifest_tables';

if (allManifest) {
  makeDirIfMissing(dir);

  Object.entries(allManifest).forEach(function ([table, tableData]) {
    writeFile(`${dir}/${table}.json`, tableData);
  });

  writeFile(`${dir}/all.json`, allManifest);
}
