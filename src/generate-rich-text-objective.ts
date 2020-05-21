import { getAll, loadLocal } from 'destiny2-manifest/node';
import { sortObject, writeFile } from './helpers';

loadLocal();
const objectives = getAll('DestinyObjectiveDefinition');
const perks = getAll('DestinySandboxPerkDefinition');

const iconFinder = /(\[[^\]]+\]|[\uE000-\uF8FF])/g;

const richTexts: Record<string, number> = {};

objectives.forEach((objective) => {
  const match = objective.progressDescription && objective.progressDescription.match(iconFinder);
  if (match?.length === 1 && !richTexts[match[0]]) {
    richTexts[match[0]] = objective.hash;
  }
});

perks.forEach((perk) => {
  const match =
    perk.displayProperties.description && perk.displayProperties.description.match(iconFinder);
  if (match?.length === 1 && !richTexts[match[0]]) {
    richTexts[match[0]] = perk.hash;
  }
});

writeFile('./output/objective-richTexts.json', sortObject(richTexts));
