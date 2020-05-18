'use strict';
exports.__esModule = true;
var node_1 = require('destiny2-manifest/node');
var helpers_1 = require('./helpers');
node_1.loadLocal();
var inventoryItems = node_1.getAll('DestinyInventoryItemDefinition');
var milestones = node_1.getAll('DestinyMilestoneDefinition');
var rewards = [];
var rewardHash = 326786556;
var debug = false;
milestones.forEach(function (milestone) {
  var _a;
  var reward =
    ((_a = milestone.rewards) === null || _a === void 0
      ? void 0
      : _a[rewardHash].rewardEntries[rewardHash].items[0].itemHash) || null;
  if (reward && reward !== 3853748946) {
    // not enhancement cores
    if (debug) {
      console.log(milestone.rewards[rewardHash].rewardEntries[rewardHash]);
    }
    rewards.push(reward);
  }
  // check for quest rewards
  var questHash = Number(Object.keys(milestone.quests)[0] || 0);
  inventoryItems.filter(function (item) {
    var questReward = null;
    if (item.hash === questHash) {
      if (!item.setData.setIsFeatured) {
        questReward = item.value.itemValue[0].itemHash || null;
      }
    }
    if (questReward) {
      rewards.push(questReward);
    }
  });
});
inventoryItems.forEach(function (item) {
  var hash = item.hash;
  var powerfulEquipment =
    'A Cryptarch should be able to decode this into a piece of powerful equipment.';
  if (item.displayProperties.description.includes(powerfulEquipment)) {
    if (debug) {
      console.log(item.displayProperties.name);
    }
    rewards.push(hash);
  }
});
var cleanedRewards = helpers_1.uniqAndSortArray(rewards);
if (debug) {
  console.log(cleanedRewards);
}
helpers_1.writeFile('./output/powerful-rewards.json', cleanedRewards);
