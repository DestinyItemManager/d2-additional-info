/*================================================================================================================================*\
||
|| Helper Functions
||
||
\*================================================================================================================================*/
import { get, loadLocal } from '@d2api/manifest-node';
import { execSync } from 'child_process';
import fetch from 'cross-fetch';
import { writeFile as writeFileFS } from 'fs';
import fse from 'fs-extra';
import { promisify } from 'util';

const { writeFileSync, copyFileSync } = fse;

loadLocal();

export function writeFile(filename: string, data: any, pretty = false) {
  if (typeof data === 'object') {
    data = JSON.stringify(data, null, 2);
  }

  writeFileSync(filename, data + '\n', 'utf8');

  if (pretty || filename.endsWith('.ts')) {
    execSync(`yarn prettier "${filename}" --write`);
  }

  console.log(`${filename} saved.`);
}

export function copyFile(filename: string, filename2: string) {
  if (fse.existsSync(filename)) {
    copyFileSync(filename, filename2);
    console.log(`${filename} copied to ${filename2} .`);
  } else {
    console.log(`ERROR: ${filename} does not exist!`);
  }
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
    const comment = (
      table?.[hash] ??
      get('DestinyInventoryItemDefinition', hash)?.displayProperties.name ??
      ''
    ).replace(/\n/gm, '\\n');

    if (!comment) {
      console.log(`unable to find information for hash ${hash}`);
    }
    return `${prefix}${hash}${suffix} // ${comment ?? 'could not identify hash'}`;
  });
}

export const writeFilePromise = promisify(writeFileFS);

export function downloadFile(url: string, outputPath: string) {
  return fetch(url)
    .then((x) => x.arrayBuffer())
    .then((x) => writeFilePromise(outputPath, Buffer.from(x)));
}

export function uriToFileName(uri: string) {
  return uri.substring(uri.lastIndexOf('/') + 1);
}

export function makeDirIfMissing(dir: string) {
  if (!fse.existsSync(dir)) {
    fse.mkdirSync(dir);
  }
}

const sourcesInfo: Record<number, string> = {};
export interface Categories {
  sources: Record<
    string, // a sourceTag. i.e. "adventures" or "deadorbit" or "zavala" or "crucible"
    {
      /**
       * list of strings. if a sourceString contains one of these,
       * it probably refers to this sourceTag
       */
      includes: string[];
      /**
       * list of strings. if a sourceString contains one of these,
       * it doesn't refer to this sourceTag
       */
      excludes?: string[];
      /** list of english item names or inventoryItem hashes */
      items?: (string | number)[];
      /** duplicate this category into another sourceTag */
      alias?: string[];
      /**
       * presentationNodes can contain a set of items (Collections).
       * we'll find presentation nodes by name or hash,
       * and include their children in this source
       */
      presentationNodes?: (string | number)[];
      searchString?: string[];
    }
  >;
  /** i don't really remember why this exists */
  exceptions: string[][];
}

export function applySourceStringRules(
  haystack: typeof sourcesInfo,
  sourceStringRules: Categories['sources'][string]
): number[] {
  const { includes, excludes } = sourceStringRules;

  return (
    Object.entries(haystack)
      // filter down to only search results that match these sourceStringRules
      .filter(
        ([, sourceString]) =>
          // do inclusion strings match this sourceString?
          includes?.filter((searchTerm) =>
            sourceString.toLowerCase().includes(searchTerm.toLowerCase())
          ).length &&
          // not any excludes or not any exclude matches
          !(
            // do exclusion strings match this sourceString?
            excludes?.filter((searchTerm) =>
              sourceString.toLowerCase().includes(searchTerm.toLowerCase())
            ).length
          )
      )
      // keep the sourceHash and discard the sourceString.
      // convert them back from object keys (strings) to numbers.
      .map(([sourceHash]) => Number(sourceHash))
  );
}
