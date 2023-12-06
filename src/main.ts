import { load, setApiKey } from '@d2api/manifest-node';
import { spawnSync } from 'child_process';
import { readdirSync } from 'fs';
import fse from 'fs-extra';
import path, { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { registerWriteHook } from './helpers.js';

const { copyFileSync } = fse;

setApiKey(process.env.API_KEY);
await load();

const scriptRegex = /generate-([a-zA-Z\\-]+)\.ts/;

const defaultExcludedScripts = ['pretty-manifest', 'font-glyph-enums'];

// These scripts generate data needed by other scripts,
// so they need to run first in this order
const prioritizedScripts = ['enums', 'season-info', 'source-info', 'watermark-info'];
// If a script outputs one of these files, compile it
const toCompileOutputs = ['generated-enums.ts', 'd2-font-glyphs.ts', 'seasons_unfiltered.json'];
const outputDirectories = ['data', 'output'];
// These files should be copied verbatim from data/ to output/
const copyDataToOutput = ['legacy-triumphs.json', 'd2-font-glyphs.ts', 'generated-enums.ts'];

// Read all `generate-` files
const scriptsDir = dirname(fileURLToPath(import.meta.url));
const projectRootDir = path.join(scriptsDir, '..', '..');
const sourceDir = path.join(projectRootDir, 'src');

const argvScripts = process.argv.length > 2 ? process.argv.slice(2) : [];

let tsFiles = readdirSync(sourceDir).filter((file) => {
  const match = basename(file).match(scriptRegex);
  // let user run any script they desire
  return match && (argvScripts.length || !defaultExcludedScripts.includes(match[1]));
});
// The user can restrict the scripts that should run via the command line
if (argvScripts.length) {
  tsFiles = tsFiles.filter((script) => argvScripts.some((pattern) => script.includes(pattern)));
}

// Sort files so that prioritized files are in the order they appear in `prioritizedScripts`,
// and everything else comes alphabetically after
tsFiles.sort((fileA, fileB) => {
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
  if (
    toCompileOutputs.includes(basename(fileName)) &&
    outputDirectories.includes(basename(dirname(fileName)))
  ) {
    const t = process.hrtime();
    const result = spawnSync(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['build'], {
      cwd: projectRootDir,
      stdio: 'inherit',
    });
    if (result.error) {
      throw result.error;
    }
    const [s, ns] = process.hrtime(t);
    totalTscRuntime += s + ns / 1e9;
  }
});

// Keep track of the runtime of individual scripts to identify performance problems
const runtime: { [scriptName: string]: number } = {};

for (const tsFile of tsFiles) {
  const jsFile = path.parse(tsFile).name + '.js';
  const t = process.hrtime();
  // Our files are individual scripts, so importing already
  // has the side effect of running their contents.
  await import('./' + jsFile);
  const [s, ns] = process.hrtime(t);
  runtime[tsFile] = s + ns / 1e9;
}

for (const toCopyFile of copyDataToOutput) {
  copyFileSync(`./data/${toCopyFile}`, `./output/${toCopyFile}`);
}

const runtimes = Object.entries(runtime).sort((a, b) => b[1] - a[1]);
console.table(runtimes);
console.log('total tsc runtime', totalTscRuntime);
