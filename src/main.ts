import { load, setApiKey } from '@d2api/manifest-node';
import { spawnSync } from 'child_process';
import { readdirSync, copyFileSync } from 'node:fs';
import path, { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { registerWriteHook } from './helpers.js';
import { infoLog, infoTable } from './log.js';

const TAG = 'MAIN';

setApiKey(process.env.API_KEY);
await load();

const scriptRegex = /generate-([a-zA-Z\\-]+)\.ts/;

const defaultExcludedScripts = ['pretty-manifest'];

// These scripts generate data needed by other scripts,
// so they need to run first in this order
const prioritizedScripts = ['enums', 'season-info', 'source-info', 'watermark-info'];
// If a script outputs one of these files, compile it
const toCompileOutputs = ['generated-enums.ts', 'seasons_unfiltered.json'];
const outputDirectories = ['data', 'output'];
// These files should be copied verbatim from data/ to output/
const copyDataToOutput = ['legacy-triumphs.json', 'generated-enums.ts'];

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
let totalJsRunTime = 0;

registerWriteHook((fileName) => {
  if (
    toCompileOutputs.includes(basename(fileName)) &&
    outputDirectories.includes(basename(dirname(fileName)))
  ) {
    const t = process.hrtime();
    const result = spawnSync(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['build'], {
      cwd: projectRootDir,
      stdio: 'inherit',
      shell: true,
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

// Helper to run a single script and track its runtime
async function runScript(tsFile: string): Promise<void> {
  const jsFile = path.parse(tsFile).name + '.js';
  const t = process.hrtime();
  // Our files are individual scripts, so importing already
  // has the side effect of running their contents.
  await import('./' + jsFile);
  const [s, ns] = process.hrtime(t);
  runtime[jsFile] = s + ns / 1e9;
}

// Separate prioritized scripts from the rest
const prioritizedFiles: string[] = [];
const parallelFiles: string[] = [];

for (const tsFile of tsFiles) {
  const match = tsFile.match(scriptRegex);
  if (match && prioritizedScripts.includes(match[1])) {
    prioritizedFiles.push(tsFile);
  } else {
    parallelFiles.push(tsFile);
  }
}

// Track wall-clock time for actual execution duration
let sequentialWallTime = 0;
let parallelWallTime = 0;

// Run prioritized scripts sequentially (they have dependencies on each other)
infoLog(TAG, `Running ${prioritizedFiles.length} prioritized scripts sequentially...`);
const seqStart = process.hrtime();
for (const tsFile of prioritizedFiles) {
  await runScript(tsFile);
}
const [seqS, seqNs] = process.hrtime(seqStart);
sequentialWallTime = seqS + seqNs / 1e9;

// Run remaining scripts in parallel for better performance
if (parallelFiles.length > 0) {
  infoLog(TAG, `Running ${parallelFiles.length} scripts in parallel...`);
  const startTime = process.hrtime();
  await Promise.all(parallelFiles.map(runScript));
  const [s, ns] = process.hrtime(startTime);
  parallelWallTime = s + ns / 1e9;
  infoLog(TAG, `Parallel execution completed in ${parallelWallTime.toFixed(2)}s`);
}

// Calculate cumulative JS runtime (sum of all script times)
for (const time of Object.values(runtime)) {
  totalJsRunTime += time;
}

for (const toCopyFile of copyDataToOutput) {
  copyFileSync(`./data/${toCopyFile}`, `./output/${toCopyFile}`);
}

const runtimes = Object.entries(runtime).sort((a, b) => b[1] - a[1]);
infoTable(runtimes);
infoLog(TAG, 'total tsc runtime', totalTscRuntime);
infoLog(TAG, 'total js runtime (cumulative)', totalJsRunTime);
infoLog(TAG, 'total js runtime (wall-clock)', sequentialWallTime + parallelWallTime);
