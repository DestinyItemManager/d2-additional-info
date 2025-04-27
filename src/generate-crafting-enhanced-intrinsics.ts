/**
 * Collect enhanced intrinsics for craftable weapons so that we can treat
 * their bonus stats correctly.
 */
import { getAllDefs } from '@d2api/manifest-node';
import { annotate, writeFile } from './helpers.js';

const allEnhancedIntrinsics = new Set<number>(
  getAllDefs('InventoryItem')
    .filter(
      (i) =>
        i.uiItemDisplayStyle === 'ui_display_style_intrinsic_plug' &&
        i.investmentStats.some((s) => s.isConditionallyActive),
    )
    .sort((a, b) => (a.displayProperties.name >= b.displayProperties.name ? 1 : -1))
    .map((intrinsic) => intrinsic.hash),
);

const pretty = `const enhancedIntrinsics = new Set<number>([\n${[...allEnhancedIntrinsics]
  .map((h) => `${h},\n`)
  .join('')}]);\n\nexport default enhancedIntrinsics;`;

const annotated = annotate(pretty);

writeFile('./output/crafting-enhanced-intrinsics.ts', annotated);
