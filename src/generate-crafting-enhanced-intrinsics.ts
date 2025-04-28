/**
 * Collect enhanced intrinsics for craftable weapons so that we can treat
 * their bonus stats correctly.
 */
import { getAllDefs } from '@d2api/manifest-node';
import { annotate, writeFile } from './helpers.js';
import { DestinyDisplayPropertiesDefinition } from 'bungie-api-ts/destiny2/interfaces.js';

const compareIntrinsicDisplayProps = (
  a: DestinyDisplayPropertiesDefinition,
  b: DestinyDisplayPropertiesDefinition,
): number => {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  if (a.description < b.description) {
    return -1;
  }
  if (a.description > b.description) {
    return 1;
  }
  return 0;
};

const allEnhancedIntrinsics = new Set<number>(
  getAllDefs('InventoryItem')
    .filter(
      (i) =>
        i.uiItemDisplayStyle === 'ui_display_style_intrinsic_plug' &&
        i.investmentStats.some((s) => s.isConditionallyActive),
    )
    .sort((a, b) => compareIntrinsicDisplayProps(a.displayProperties, b.displayProperties))
    .map((intrinsic) => intrinsic.hash),
);

const pretty = `const enhancedIntrinsics = new Set<number>([\n${[...allEnhancedIntrinsics]
  .map((h) => `${h},\n`)
  .join('')}]);\n\nexport default enhancedIntrinsics;`;

const annotated = annotate(pretty);

writeFile('./output/crafting-enhanced-intrinsics.ts', annotated);
