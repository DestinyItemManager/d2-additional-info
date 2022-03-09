/**
 * Collect extractable Resonant Elements so that we can filter Deepsight
 * weapons by the materials that can be extracted from them.
 */
import { getAll, loadLocal } from '@d2api/manifest-node';
import { PlugCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

loadLocal();

const allResonantElements: {
  objectiveHash: number;
  tag: string;
  name: string;
}[] = [];

const objectives = getAll('DestinyObjectiveDefinition');
const inventoryItems = getAll('DestinyInventoryItemDefinition');

const resonanceExtractionPlugs = inventoryItems.filter(
  (i) =>
    i.plug?.plugCategoryHash === PlugCategoryHashes.CraftingPlugsWeaponsModsExtractors &&
    i.displayProperties.name
);
for (const plug of resonanceExtractionPlugs) {
  const materialName = plug.displayProperties.name;
  const objectiveDef = objectives.find((o) => o.progressDescription === materialName);
  if (objectiveDef) {
    // Ruinous Element -> ruinous
    const tag = materialName
      .toLowerCase()
      .replace(' ', '')
      .replace(/element$/, '');
    if (tag) {
      allResonantElements.push({
        objectiveHash: objectiveDef.hash,
        tag,
        name: materialName,
      });
      console.log(`'${materialName}' -> '${tag}' (hash: ${objectiveDef.hash})`);
    } else {
      console.log(`Unable to map '${materialName}' to tag.`);
    }
  } else {
    console.log(`No objective found for '${materialName}'`);
  }
}

const outString = `
export const resonantElementTagsByObjectiveHash: Record<number, string> = {
${allResonantElements.map((e) => `  ${e.objectiveHash}: '${e.tag}', // ${e.name}`).join('\n')}
} as const;`;
writeFile('./output/crafting-resonant-elements.ts', outString);
