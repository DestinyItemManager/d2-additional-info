import { get, loadLocal } from 'destiny2-manifest/node';

/*================================================================================================================================*\
||
|| Helper Functions
||
||
\*================================================================================================================================*/
import { execSync } from 'child_process';
import fse from 'fs-extra';
import { writeFile as writeFileFS } from 'fs';
import { promisify } from 'util';
import fetch from 'cross-fetch';
import Jimp from 'jimp';

const { writeFileSync, copyFileSync } = fse;

loadLocal();

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

export const writeFilePromise = promisify(writeFileFS);

export async function imagesSame(filename1: string, filename2: string) {
  if (fse.existsSync(filename1) && fse.existsSync(filename2)) {
    const file1 = await Jimp.read(filename1);
    const file2 = await Jimp.read(filename2);
    return Jimp.diff(file1, file2).percent === 0 ? true : false;
  }
  return false;
}

export function downloadFile(url: string, outputPath: string) {
  return fetch(url)
    .then((x) => x.arrayBuffer())
    .then((x) => writeFilePromise(outputPath, Buffer.from(x)));
}
