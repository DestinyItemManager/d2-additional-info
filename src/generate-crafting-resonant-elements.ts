/**
 * Collect extractable Resonant Elements so that we can filter Deepsight
 * weapons by the materials that can be extracted from them.
 */
import { getAll, loadLocal } from '@d2api/manifest-node';
import { DestinyItemType } from 'bungie-api-ts/destiny2';
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

const capacityMatcher =
  /You are at or near maximum capacity for (?<matMatchedName>.+)!\s+Capacity: \{var:(?<currentCountHash>\d+)\}\/\{var:(?<maxCapacityHash>\d+)\}/;

const craftingMaterialCounts: Record<
  string,
  {
    label: string;
    currentCountHash: string;
    maxCapacityHash: string;
    plugHash: number;
  }
> = {};

for (const item of resonanceExtractionPlugs) {
  if (item.tooltipNotifications) {
    for (const tooltip of item.tooltipNotifications) {
      const match = tooltip.displayString.match(capacityMatcher);
      if (match) {
        const { currentCountHash, maxCapacityHash, matMatchedName } = match.groups!;
        craftingMaterialCounts[matMatchedName] = {
          label: matMatchedName,
          currentCountHash,
          maxCapacityHash,
          plugHash: item.hash,
        };
      }
    }
  }
}

const craftingMatsMetadataList = Object.values(craftingMaterialCounts).map(
  ({ label, currentCountHash, maxCapacityHash, plugHash }) => {
    const matchingDummyItem = inventoryItems.find(
      (i) =>
        i.itemType === DestinyItemType.Dummy &&
        (i.displayProperties.name === label ||
          // try removing the trailing "s"
          i.displayProperties.name === label.replace(/s$/, ''))
    );
    const materialName = matchingDummyItem?.displayProperties.name ?? label;
    const materialHash = matchingDummyItem?.hash ?? plugHash;
    return { currentCountHash, maxCapacityHash, materialName, materialHash };
  }
);

craftingMatsMetadataList
  // sort alphabetically
  .sort((m1, m2) => (m1.materialName < m2.materialName ? -1 : 1))
  // then force neutral to the end
  .sort((m1, m2) =>
    m1.materialName.includes('Neutral') ? 1 : m2.materialName.includes('Neutral') ? -1 : 0
  );

const outString = `
export const resonantElementTagsByObjectiveHash: Record<number, string> = {
${allResonantElements.map((e) => `  ${e.objectiveHash}: '${e.tag}', // ${e.name}`).join('\n')}
} as const;

export const resonantMaterialStringVarHashes: { currentCountHash: number; maxCapacityHash: number; materialHash:number }[] = [
  ${craftingMatsMetadataList
    .map(
      ({ materialName, currentCountHash, maxCapacityHash, materialHash }) =>
        `{currentCountHash: ${currentCountHash}, maxCapacityHash: ${maxCapacityHash}, materialHash: ${materialHash}}, // ${materialName}`
    )
    .join('\n')}
];`;

writeFile('./output/crafting-resonant-elements.ts', outString);
