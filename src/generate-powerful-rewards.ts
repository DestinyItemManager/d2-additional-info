import { getAllDefs, loadLocal } from '@d2api/manifest-node';
import { uniqAndSortArray, writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAllDefs('InventoryItem');
const milestones = getAllDefs('Milestone');

const rewards: number[] = [];
const rewardHash = 326786556;

const debug = false;

milestones.forEach((milestone) => {
  const reward =
    milestone.rewards?.[rewardHash]?.rewardEntries[rewardHash].items[0].itemHash || null;
  if (reward && reward !== 3853748946) {
    // not enhancement cores
    if (debug) {
      console.log(milestone.rewards[rewardHash].rewardEntries[rewardHash]);
    }
    rewards.push(reward);
  }
  // check for quest rewards
  const questHash = Number(Object.keys(milestone.quests || [])[0] || 0);
  inventoryItems.filter((item) => {
    let questReward = null;
    if (item.hash === questHash) {
      if (!item.setData?.setIsFeatured) {
        questReward = item.value?.itemValue[0].itemHash || null;
      }
    }
    if (questReward) {
      rewards.push(questReward);
    }
  });
});

inventoryItems.forEach((item) => {
  const hash = item.hash;
  const powerfulEquipment =
    'A Cryptarch should be able to decode this into a piece of powerful equipment.';
  if (item.displayProperties.description.includes(powerfulEquipment)) {
    if (debug) {
      console.log(item.displayProperties.name);
    }
    rewards.push(hash);
  }
});

const cleanedRewards = uniqAndSortArray(rewards);

if (debug) {
  console.log(cleanedRewards);
}

writeFile('./output/powerful-rewards.json', cleanedRewards);
