const { writeFile, getMostRecentManifest, uniqAndSortArray } = require('./helpers.js');
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);
const idx = require('idx');

const milestones = mostRecentManifestLoaded.DestinyMilestoneDefinition;
const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;

const rewards = [];
const rewardHash = 326786556;

const debug = false;

Object.keys(milestones).forEach(function(key) {
  const reward =
    idx(
      milestones[key],
      (milestone) => milestone.rewards[rewardHash].rewardEntries[rewardHash].items[0].itemHash
    ) || null;
  if (reward && reward !== 3853748946) {
    // not enhancement cores
    if (debug) {
      console.log(milestones[key].rewards[rewardHash].rewardEntries[rewardHash]);
    }
    rewards.push(reward);
  }
  // check for quest rewards
  const questHash = Number(
    idx(milestones[key], (milestone) => Object.keys(milestone.quests)[0]) || 0
  );
  Object.values(inventoryItem).filter(function(item) {
    let questReward = null;
    if (item.hash === questHash) {
      if (!item.setData.setIsFeatured) {
        questReward = idx(item, (i) => i.value.itemValue[0].itemHash) || null;
      }
    }
    if (questReward) {
      rewards.push(questReward);
    }
  });
});

Object.keys(inventoryItem).forEach(function(key) {
  const item = inventoryItem[key];
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
