import { getDef } from '@d2api/manifest-node';
import { DestinyItemType } from 'bungie-api-ts/destiny2';
import { uniqAndSortArray, writeFile } from './helpers.js';
import { BucketHashes } from '../data/generated-enums.js';

const SAINT_14_VENDOR_HASH = 765357505;
const SAINT_14 = getDef('Vendor', SAINT_14_VENDOR_HASH);

const trialsObjectives: Record<number, string> = {};
const trialsPassages = new Set<number>();

SAINT_14?.itemList.forEach((i) => {
  if (i.inventoryBucketHash === BucketHashes.Quests) {
    const item = getDef('InventoryItem', i.itemHash);
    if (
      item?.displayProperties.name.includes('Passage') &&
      item.itemType !== DestinyItemType.Dummy
    ) {
      trialsPassages.add(i.itemHash);
      item.objectives?.objectiveHashes.forEach((o) => {
        const obj = getDef('Objective', o);
        if (obj) {
          if (obj.progressDescription === 'Flawless') {
            if (obj.completedValueStyle === 10) {
              trialsObjectives[obj?.hash] = obj.displayProperties?.name || obj.progressDescription;
            }
          } else {
            trialsObjectives[obj?.hash] = obj.displayProperties?.name || obj.progressDescription;
          }
        }
      });
    }
  }
});

const trialsMetadata = {
  passages: uniqAndSortArray(Array.from(trialsPassages)),
  objectives: trialsObjectives,
};

writeFile('./output/d2-trials-objectives.json', trialsMetadata);
