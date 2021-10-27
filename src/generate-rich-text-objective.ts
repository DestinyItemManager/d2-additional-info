import { getAll, loadLocal } from '@d2api/manifest-node';
import stringifyObject from 'stringify-object';
import { sortObject, writeFile } from './helpers.js';

loadLocal();

const objectives = getAll('DestinyObjectiveDefinition');
const perks = getAll('DestinySandboxPerkDefinition');

const iconFinder = /(\[[^\]]+\]|[\uE000-\uF8FF])/g;

type RichTextManifestSourceData = Record<string, [string, number]>;
const richTexts: RichTextManifestSourceData = {};

objectives.forEach((objective) => {
  const match = objective.progressDescription?.match(iconFinder);
  if (match?.length === 1 && !richTexts[match[0]]) {
    richTexts[match[0]] = ['Objective', objective.hash];
  }
});

perks.forEach((perk) => {
  const match = perk.displayProperties.description?.match(iconFinder);
  if (match?.length === 1 && !richTexts[match[0]]) {
    richTexts[match[0]] = ['SandboxPerk', perk.hash];
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
