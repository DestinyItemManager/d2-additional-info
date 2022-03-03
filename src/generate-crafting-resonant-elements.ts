/**
 * Collect extractable Resonant Elements so that we can filter Deepsight
 * weapons by the materials that can be extracted from them.
 */
import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { PlugCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

loadLocal();

const allResonantElements: {
  objectiveHash: number;
  tag: string;
  name: string;
}[] = [];

const inventoryItems = getAll('DestinyInventoryItemDefinition');
const resonanceExtractionPlugs = inventoryItems.filter(
  (i) =>
    i.plug?.plugCategoryHash === PlugCategoryHashes.CraftingPlugsWeaponsModsExtractors &&
    i.displayProperties.name
);
for (const plug of resonanceExtractionPlugs) {
  const objectiveDef = get('DestinyObjectiveDefinition', plug.hash);
  if (objectiveDef) {
    // Ruinous Element -> ruinous
    const tag = objectiveDef.progressDescription
      .toLowerCase()
      .replace(' ', '')
      .replace(/element$/, '');
    if (tag) {
      allResonantElements.push({
        objectiveHash: objectiveDef.hash,
        tag,
        name: objectiveDef.progressDescription,
      });
    }
  }
}

const outString = `
export const resonantElementTagsByObjectiveHash: Record<number, string> = {
${allResonantElements.map((e) => `  ${e.objectiveHash}: '${e.tag}', // ${e.name}`).join('\n')}
} as const;`;
writeFile('./output/crafting-resonant-elements.ts', outString);
