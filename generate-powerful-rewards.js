const { writeFile, getMostRecentManifest } = require('./helpers.js');
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);
const idx = require('idx');

const milestones = mostRecentManifestLoaded.DestinyMilestoneDefinition;

const rewards = [];
const rewardHash = 326786556;
Object.keys(milestones).forEach(function(key) {
  const reward =
    idx(
      milestones[key],
      (milestone) => milestone.rewards[rewardHash].rewardEntries[rewardHash].items[0].itemHash
    ) || null;
  if (reward) rewards.push(reward);
});

const cleanedRewards = [...new Set(rewards)];
console.log(cleanedRewards);

writeFile('./output/powerful-rewards.json', cleanedRewards);
