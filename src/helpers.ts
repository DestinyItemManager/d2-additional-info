/*================================================================================================================================*\
||
|| Helper Functions
||
||
\*================================================================================================================================*/
import { getAllDefs, getDef } from '@d2api/manifest-node';
import { execSync } from 'child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFile as writeFileFS,
  writeFileSync,
} from 'node:fs';
import { promisify } from 'util';
import { matchTable } from '../data/sources/category-config.js';
import { infoLog, warnLog } from './log.js';

const TAG = 'UTILS';

type WriteHook = (fileName: string) => void;
const writeHooks: WriteHook[] = [];

export function registerWriteHook(hook: WriteHook) {
  writeHooks.push(hook);
}

export function writeFile(filename: string, data: any, pretty = false) {
  if (typeof data === 'object') {
    data = JSON.stringify(data, null, 2);
  }

  writeFileSync(filename, data + '\n', 'utf8');

  if (pretty || filename.endsWith('.ts')) {
    execSync(`pnpm prettier "${filename}" --write`);
  }

  infoLog(TAG, `${filename} saved.`);

  for (const hook of writeHooks) {
    hook(filename);
  }
}

export function copyFile(filename: string, filename2: string) {
  if (existsSync(filename)) {
    copyFileSync(filename, filename2);
    infoLog(TAG, `${filename} copied to ${filename2} .`);
  } else {
    warnLog(TAG, `ERROR: ${filename} does not exist!`);
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
      }),
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
      getDef('InventoryItem', hash)?.displayProperties.name ??
      ''
    ).replace(/\n/gm, '\\n');

    if (!comment) {
      warnLog(TAG, `unable to find information for hash ${hash}`);
    }
    return `${prefix}${hash}${suffix} // ${comment ?? 'could not identify hash'}`;
  });
}

export const writeFilePromise = promisify(writeFileFS);

/**
 * Reads and parses a JSON file at runtime, bypassing Node.js module caching.
 * Use this for JSON files that are written during the same generate-data run.
 */
export function readJsonFile<T = Record<string, number>>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

export function downloadFile(url: string, outputPath: string) {
  return fetch(url)
    .then((x) => x.arrayBuffer())
    .then((x) => writeFilePromise(outputPath, Buffer.from(x)));
}

export function uriToFileName(uri: string) {
  return uri.substring(uri.lastIndexOf('/') + 1);
}

export function makeDirIfMissing(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
}

export function applySourceStringRules(
  haystack: Record<number, string>,
  sourceStringRules: (typeof matchTable)[number],
): number[] {
  const { desc, excludes } = sourceStringRules;

  return (
    Object.entries(haystack)
      // filter down to only search results that match these sourceStringRules
      .filter(
        ([, sourceString]) =>
          // do inclusion strings match this sourceString?
          desc?.filter((searchTerm) =>
            sourceString.toLowerCase().includes(searchTerm.toLowerCase()),
          ).length &&
          // not any excludes or not any exclude matches
          !// do exclusion strings match this sourceString?
          excludes?.filter((searchTerm) =>
            sourceString.toLowerCase().includes(searchTerm.toLowerCase()),
          ).length,
      )
      // keep the sourceHash and discard the sourceString.
      // convert them back from object keys (strings) to numbers.
      .map(([sourceHash]) => Number(sourceHash))
  );
}

export function getCurrentSeason() {
  // Sort Seasons backwards and return the first (most recent) season without "Redacted" in its name
  const seasonDefs = getAllDefs('Season').sort((a, b) =>
    a.seasonNumber > b.seasonNumber ? 1 : -1,
  );
  for (let season = seasonDefs.length - 1; season > 0; season--) {
    const seasonName = seasonDefs[season].displayProperties.name ?? '';
    const validSeason = seasonName && !seasonName.toLowerCase().includes('redacted');

    if (!validSeason) {
      continue;
    }
    return seasonDefs[season].seasonNumber;
  }
  return 0;
}

export function getComposedRegex(...regexes: RegExp[]) {
  return new RegExp(regexes.map((regex) => regex.source).join('|'));
}

export function sortWithoutArticles(a: string, b: string) {
  const aTitle = removeArticles(a.toLowerCase());
  const bTitle = removeArticles(b.toLowerCase());

  if (aTitle > bTitle) {
    return 1;
  }
  if (aTitle < bTitle) {
    return -1;
  }
  return 0;
}

function removeArticles(str: string) {
  const articles = ['a', 'an', 'the'];
  const words = str.split(' ');
  if (words.length <= 1) {
    return str;
  }
  if (articles.includes(words[0])) {
    return words.splice(1).join(' ');
  }
  return str;
}
