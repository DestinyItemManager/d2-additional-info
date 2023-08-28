import { getAllDefs } from '@d2api/manifest-node';
import seasons from '../data/seasons/seasons_unfiltered.json' assert { type: 'json' };
import watermarkToSeason from '../output/watermark-to-season.json' assert { type: 'json' };
import { writeFile } from './helpers.js';

const inventoryItems = getAllDefs('InventoryItem');
const backupData: Record<string, number> = {};

inventoryItems.forEach((inventoryItem) => {
  const hash = inventoryItem.hash;
  const watermark = inventoryItem.iconWatermark;
  const shelved = inventoryItem.iconWatermarkShelved;
  const ich = inventoryItem.itemCategoryHashes;
  const test =
    Object.prototype.hasOwnProperty.call(watermarkToSeason, watermark) ||
    Object.prototype.hasOwnProperty.call(watermarkToSeason, shelved);
  if (!test && watermark && !ich?.includes(59)) {
    backupData[hash] = (seasons as Record<string, number>)[hash];
  }
});

writeFile('./output/seasons_backup.json', backupData);
