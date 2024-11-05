/**
 * Collect mementos by their source.
 */
import { getAllDefs } from '@d2api/manifest-node';
import { PlugCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

const mementosBySource: Record<string, number[]> = {};
const mementoRegex = /^([\w\s]+) Memento$/;

const inventoryItems = getAllDefs('InventoryItem');

for (const memento of inventoryItems.filter(
  (i) => i.plug?.plugCategoryHash === PlugCategoryHashes.Mementos,
)) {
  const match = memento.displayProperties.name.match(mementoRegex);
  const sourceName = match ? match[1].toLowerCase().replace(/\s/g, '') : 'other';

  (mementosBySource[sourceName] ??= []).push(memento.hash);
}

writeFile('./output/crafting-mementos.json', mementosBySource, true);
