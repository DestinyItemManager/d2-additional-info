import { getAll, loadLocal } from '@d2api/manifest-node';
import _ from 'lodash';
import stringifyObject from 'stringify-object';
import { getCurrentSeason } from '../data/seasons/d2-season-info.js';
import { annotate, writeFile } from './helpers.js';

loadLocal();

const itemList = getAll('DestinyInventoryItemDefinition')
  .map((i) => {
    const seasonNumber = JSON.stringify(i).match(/expir[^"]+season (?<seasonnumber>\d+)\b/i)?.groups
      ?.seasonnumber;
    return [i.hash, seasonNumber ? Number(seasonNumber) : 0];
  })
  .filter((e) => e[1]);

const recordList = getAll('DestinyRecordDefinition')
  .map((r) => {
    const seasonNumber = JSON.stringify(r).match(/expir[^"]+season (?<seasonnumber>\d+)\b/i)?.groups
      ?.seasonnumber;
    return [r.hash, seasonNumber ? Number(seasonNumber) : 0];
  })
  .filter((e) => e[1]);

const seasonsByHash = Object.fromEntries([...itemList, ...recordList]);

const output = _.groupBy(
  [...itemList, ...recordList].map((e) => e[0]),
  (h) => seasonsByHash[h]
);

const currentSeason = getCurrentSeason();
for (const seasonNumber in output) {
  const numeric = Number(seasonNumber);
  if (numeric < currentSeason) {
    delete output[seasonNumber];
  }
}

const pretty = `
const expirationInfo: Record<string | number, number[] | undefined> = ${stringifyObject(output, {
  indent: '  ',
})};\n\nexport default expirationInfo;`;

writeFile('./output/expiration-info.ts', annotate(pretty));
