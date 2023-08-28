import { loadLocal } from '@d2api/manifest-node';
import { spawnSync } from 'child_process';
import { readdirSync } from 'fs';
import fse from 'fs-extra';
import path, { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { registerWriteHook } from './helpers.js';

const { copyFileSync } = fse;

loadLocal();

const scriptRegex = /generate-([a-zA-Z\\-]+)\.js/;

const excludedScripts = ['pretty-manifest'];

// These scripts generate data needed by other scripts,
// so they need to run first in this order
const prioritizedScripts = [
  'enums',
  'season-info',
  'source-info',
  'watermark-info',
  'font-glyph-enums',
];
// If a script outputs one of these files, compile it
const toCompileOutputs = ['generated-enums.ts', 'd2-font-glyphs.ts'];
// These files should be copied verbatim from data/ to output/
const copyDataToOutput = ['legacy-triumphs.json', 'stat-effects.ts'];

// Read all `generate-` files
const scriptsDir = dirname(fileURLToPath(import.meta.url));

let files = readdirSync(scriptsDir).filter((file) => {
  const match = basename(file).match(scriptRegex);
  return match && !excludedScripts.includes(match[1]);
});
// The user can restrict the scripts that should run via the command line
if (process.argv.length > 2) {
  const argScriptPatterns = process.argv.slice(2);
  files = files.filter((script) => argScriptPatterns.some((pattern) => script.includes(pattern)));
}

// Sort files so that prioritized files are in the order they appear in `prioritizedScripts`,
// and everything else comes alphabetically after
files.sort((fileA, fileB) => {
  const matchA = fileA.match(scriptRegex);
  const matchB = fileB.match(scriptRegex);
  if (matchA && !matchB) {
    return -1;
  } else if (!matchA && matchB) {
    return 1;
  } else if (matchA && matchB) {
    let indexA = prioritizedScripts.indexOf(matchA[1]);
    let indexB = prioritizedScripts.indexOf(matchB[1]);
    if (indexA === -1) {
      indexA = Number.MAX_SAFE_INTEGER;
    }
    if (indexB === -1) {
      indexB = Number.MAX_SAFE_INTEGER;
    }
    if (indexA === indexB) {
      return fileA.localeCompare(fileB, 'en-US');
    }
    return indexA - indexB;
  }
  return fileA.localeCompare(fileB, 'en-US');
});

let totalTscRuntime = 0;

registerWriteHook((fileName) => {
  if (toCompileOutputs.includes(basename(fileName)) && basename(dirname(fileName)) === 'data') {
    const t = process.hrtime();
    const tscCwd = path.join(scriptsDir, '..', '..');
    const result = spawnSync(process.platform === 'win32' ? 'yarn.cmd' : 'yarn', ['tsc'], {
      cwd: tscCwd,
      stdio: 'inherit',
    });
    if (result.error) {
      throw result.error;
    }
    const [s, ns] = process.hrtime(t);
    totalTscRuntime += s + ns / 1e9;
  }
});

for (const toCopyFile of copyDataToOutput) {
  copyFileSync(`./data/${toCopyFile}`, `./output/${toCopyFile}`);
}

// Keep track of the runtime of individual scripts to identify performance problems
const runtime: { [scriptName: string]: number } = {};

for (const file of files) {
  const t = process.hrtime();
  // Our files are individual scripts, so importing already
  // has the side effect of running their contents.
  await import('./' + file);
  const [s, ns] = process.hrtime(t);
  runtime[file] = s + ns / 1e9;
}

const runtimes = Object.entries(runtime).sort((a, b) => b[1] - a[1]);
console.table(runtimes);
console.log('total tsc runtime', totalTscRuntime);
