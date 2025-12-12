import { getAllDefs, getDef } from '@d2api/manifest-node';
import stringifyObject from 'stringify-object';
import { readExistingFile, sortObject, writeFile } from './helpers.js';

const objectives = getAllDefs('Objective');
const perks = getAllDefs('SandboxPerk');

const iconFinder = /(\[[^\]]+\]|[\uE000-\uF8FF])/g;

type RichTextManifestSourceData = Record<string, [string, number]>;

const existingRichTexts = readExistingFile('./output/objective-richTexts.ts', parseRichTexts, {});
const richTexts: RichTextManifestSourceData = {};

objectives.forEach((objective) => {
  const match = objective.progressDescription?.match(iconFinder);
  if (match?.length === 1 && !richTexts[match[0]]) {
    addRichText(match[0], 'Objective', objective.hash);
  }
});

perks.forEach((perk) => {
  const match = perk.displayProperties.description?.match(iconFinder);
  if (match?.length === 1 && !richTexts[match[0]]) {
    addRichText(match[0], 'SandboxPerk', perk.hash);
  }
});

const pretty = `
const richTextManifestSourceData = ${stringifyObject(sortObject(richTexts), {
  indent: '  ',
})} as const;

export type StringsNeedingReplacement = keyof typeof richTextManifestSourceData;

const richTextManifestExamples: Record<
  StringsNeedingReplacement,
  readonly [tableName: 'Objective' | 'SandboxPerk', hash: number]
> = richTextManifestSourceData;

export default richTextManifestExamples;
`;

writeFile('./output/objective-richTexts.ts', pretty);

function parseRichTexts(fileContent: string): RichTextManifestSourceData {
  const existing: RichTextManifestSourceData = {};

  // Extract entries like: '[Auto Rifle]': ['Objective', 49530695],
  const entryRegex = /['"](.+?)['"]: \[['"](\w+)['"], (\d+)\]/g;
  let match;

  while ((match = entryRegex.exec(fileContent)) !== null) {
    const [, key, tableName, hash] = match;
    existing[key] = [tableName, Number(hash)];
  }

  return existing;
}

function addRichText<T extends 'Objective' | 'SandboxPerk'>(
  key: string,
  tableName: T,
  currentHash: number,
): void {
  const existing = existingRichTexts[key];

  // Preserve previous hash if it's still valid
  if (existing?.[0] === tableName && getDef(tableName, existing[1])) {
    richTexts[key] = existing;
  } else {
    richTexts[key] = [tableName, currentHash];
  }
}
