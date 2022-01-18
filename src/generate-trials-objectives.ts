import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { DestinyItemType } from 'bungie-api-ts/destiny2';
import { writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const trialsObjectives = {} as Record<number, string>;
const trialsPassages = new Set<number>();

inventoryItems.forEach((inventoryItem) => {
  if (
    inventoryItem.itemTypeDisplayName === 'Trials Passage' &&
    inventoryItem.displayProperties.name.startsWith('Passage of') &&
    inventoryItem.itemType !== DestinyItemType.Dummy
  ) {
    //Save the quest hash
    trialsPassages.add(inventoryItem.hash);
    //Now pull out each objective if we have any
    inventoryItem.objectives?.objectiveHashes.forEach((o) => {
      const obj = get('DestinyObjectiveDefinition', o);
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
});

const trialsMetadata = {
  passages: Array.from(trialsPassages),
  objectives: trialsObjectives,
};

writeFile('./output/d2-trials-objectives.json', trialsMetadata);
