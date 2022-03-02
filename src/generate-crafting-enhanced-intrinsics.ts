/**
 * Collect enhanced intrinsics for craftable weapons so that we can treat
 * their bonus stats correctly.
 */
import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { PlugCategoryHashes } from '../data/generated-enums.js';
import { annotate, writeFile } from './helpers.js';

loadLocal();
const allEnhancedIntrinsics: number[] = [];

const inventoryItems = getAll('DestinyInventoryItemDefinition');

for (const pattern of inventoryItems.filter((i) => i.crafting)) {
  const frameSocket = pattern.sockets?.socketEntries.find((s) =>
    get('DestinySocketTypeDefinition', s.socketTypeHash)?.plugWhitelist.some(
      (w) => w.categoryHash === PlugCategoryHashes.Intrinsics
    )
  );
  if (frameSocket && frameSocket.reusablePlugSetHash) {
    const plugSet = get('DestinyPlugSetDefinition', frameSocket.reusablePlugSetHash);
    const enhancedIntrinsics = plugSet?.reusablePlugItems
      .filter((p) =>
        get('DestinyInventoryItemDefinition', p.plugItemHash)?.investmentStats.some(
          (s) => s.isConditionallyActive
        )
      )
      .map((p) => p.plugItemHash);
    if (enhancedIntrinsics?.length) {
      allEnhancedIntrinsics.push(...enhancedIntrinsics);
    }
  }
}

const pretty = `const enhancedIntrinsics: Set<number> = new Set([\n${allEnhancedIntrinsics
  .map((h) => `${h},\n`)
  .join('')}]);\n\nexport default enhancedIntrinsics;`;

const annotated = annotate(pretty);

writeFile('./output/crafting-enhanced-intrinsics.ts', annotated);
