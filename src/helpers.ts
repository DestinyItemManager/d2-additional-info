import { get, loadLocal } from 'destiny2-manifest/node';

/*================================================================================================================================*\
||
|| Helper Functions
||
||
\*================================================================================================================================*/
import { execSync } from 'child_process';
import { D2SeasonInfo, D2SeasonEnum } from '../data/seasons/d2-season-info.js';
import fse from 'fs-extra';

const { writeFileSync, copyFileSync } = fse;

loadLocal();

export function getCurrentSeason() {
  let seasonDate: Date;
  const today = new Date(Date.now());
  for (let i = D2SeasonEnum.__LENGTH__ - 1; i > 0; i--) {
    seasonDate = new Date(`${D2SeasonInfo[i].releaseDate}T${D2SeasonInfo[i].resetTime}`);
    seasonDate.setDate(seasonDate.getDate() - 1);
    if (today >= seasonDate) {
      return D2SeasonInfo[i].season;
    }
  }
  return 0;
}

export function writeFile(filename: string, data: any, pretty = true) {
  if (typeof data === 'object') {
    data = JSON.stringify(data, null, 2);
  }

  writeFileSync(filename, data + '\n', 'utf8');

  if (pretty) {
    execSync(`yarn prettier "${filename}" --write`);
  }

  console.log(`${filename} saved.`);
}

export function copyFile(filename: string, filename2: string) {
  copyFileSync(filename, filename2);
  console.log(`${filename} copied to ${filename2} .`);
}

export function uniqAndSortArray<T>(array: T[]): T[] {
  const uniq = [...new Set(array)];
  return uniq.every(isNumberlike) ? uniq.sort((a, b) => Number(a) - Number(b)) : uniq.sort();
}

function isNumberlike(x: any): x is number | string {
  return typeof x === 'number' || (typeof x === 'string' && /^\d+$/.test(x));
}

export function diffArrays(all: any[], exclude: any[]) {
  return [
    ...new Set(
      all.filter(function (x) {
        if (!exclude.includes(x)) {
          return true;
        } else {
          return false;
        }
      })
    ),
  ];
}

export function sortObject<T extends Record<string, any>>(o: T): T {
  const sorted: Record<string, any> = {};
  const a = Object.keys(o).sort();

  for (const key of a) {
    sorted[key] = o[key];
  }

  return sorted as T;
}

export function annotate(fileString: string, table?: Record<number, string>) {
  // 2+ digits, indented, maybe surrounded by quotes,
  // then maybe a comma, then maybe some space, then EOL
  const maybeHash = /^( *)['"]?(\d{2,})['"]?(,?) *$/gm;

  return fileString.replace(maybeHash, (_, prefix, hash, suffix) => {
    const comment =
      table?.[hash] ?? get('DestinyInventoryItemDefinition', hash)?.displayProperties.name;

    if (!comment) console.log(`unable to find information for hash ${hash}`);
    return `${prefix}${hash}${suffix} // ${comment ?? 'could not identify hash'}`;
  });
}
