import { getAll, loadLocal } from 'destiny2-manifest/node';
import stringifyObject from 'stringify-object';
import { sortObject, writeFile } from './helpers';

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
type RichTextManifestSourceData = Record<string, [string, number]>;

const richTextManifestSourceData: RichTextManifestSourceData = ${stringifyObject(
  sortObject(richTexts),
  {
    indent: '  ',
  }
)};\n\nexport default richTextManifestSourceData;`;

writeFile('./output/objective-richTexts.ts', pretty);
