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
  /You are at or near maximum capacity for .+!\s+Capacity: \{var:(?<currentCountHash>\d+)\}\/\{var:(?<maxCapacityHash>\d+)\}/;

const craftingMaterialCounts: Record<
  string,
  {
    label: string;
    currentCountHash: string;
    maxCapacityHash: string;
  }
> = {};

for (const item of resonanceExtractionPlugs) {
  if (item.tooltipNotifications) {
    // excluding Neutral Element right now, which is always tooltip index 1.
    // using only tip[0] allows me to look up the real name (Adroit Elements) using the parent item.
    // otherwise you need to do weirder matching with the tool tip string (Adroit Elements)
    // in order to get the currency/dummy's icon. why the pluralization in the tooltip?? ugh.
    const match = item.tooltipNotifications[0].displayString.match(capacityMatcher);
    if (match) {
      const { currentCountHash, maxCapacityHash } = match.groups!;
      craftingMaterialCounts[item.displayProperties.name] = {
        label: item.displayProperties.name,
        currentCountHash,
        maxCapacityHash,
      };
    }
  }
}

// const craftingMatsTable: [lookupHash: number, countHash: number][] = [
//   [163842161, 2829303739],
//   [163842163, 1238436609],
//   [163842162, 1178490630],
//   [163842160, 2653558736],
//   [3491404510, 2747150405],
// ];

const outString = `
export const resonantElementTagsByObjectiveHash: Record<number, string> = {
${allResonantElements.map((e) => `  ${e.objectiveHash}: '${e.tag}', // ${e.name}`).join('\n')}
} as const;

export const resonantMaterialStringVarHashes: { currentCountHash: number; maxCapacityHash: number; materialHash:number }[] = [
  ${Object.values(craftingMaterialCounts)
    .map(({ label, currentCountHash, maxCapacityHash }) => {
      const matchingDummyItem = inventoryItems.find(
        (i) => i.itemType === DestinyItemType.Dummy && i.displayProperties.name === label
      );
      return `  {currentCountHash: ${currentCountHash}, maxCapacityHash: ${maxCapacityHash}, materialHash: ${matchingDummyItem?.hash}}, // ${label}`;
    })
    .join('\n')}
];`;

writeFile('./output/crafting-resonant-elements.ts', outString);
craftingMaterialCounts;
