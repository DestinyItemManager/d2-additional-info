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
