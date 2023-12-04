/**
 * Collect enhanced intrinsics for craftable weapons so that we can treat
 * their bonus stats correctly.
 */
import { getAllDefs, getDef } from '@d2api/manifest-node';
import { PlugCategoryHashes } from '../data/generated-enums.js';
import { annotate, writeFile } from './helpers.js';

const allEnhancedIntrinsics = new Set<number>();

const inventoryItems = getAllDefs('InventoryItem');

for (const pattern of inventoryItems.filter((i) => i.crafting)) {
  const frameSocket = pattern.sockets?.socketEntries.find(
    (s) =>
      getDef('SocketType', s.socketTypeHash)?.plugWhitelist.some(
        (w) => w.categoryHash === PlugCategoryHashes.Intrinsics,
      ),
  );
  if (frameSocket?.reusablePlugSetHash) {
    const plugSet = getDef('PlugSet', frameSocket.reusablePlugSetHash);
    const enhancedIntrinsics = plugSet?.reusablePlugItems
      .filter(
        (p) =>
          getDef('InventoryItem', p.plugItemHash)?.investmentStats.some(
            (s) => s.isConditionallyActive,
          ),
      )
      .map((p) => p.plugItemHash);
    if (enhancedIntrinsics?.length) {
      for (const intrinsic of enhancedIntrinsics) {
        allEnhancedIntrinsics.add(intrinsic);
      }
    }
  }
}

const pretty = `const enhancedIntrinsics = new Set<number>([\n${[...allEnhancedIntrinsics]
  .map((h) => `${h},\n`)
  .join('')}]);\n\nexport default enhancedIntrinsics;`;

const annotated = annotate(pretty);

writeFile('./output/crafting-enhanced-intrinsics.ts', annotated);
