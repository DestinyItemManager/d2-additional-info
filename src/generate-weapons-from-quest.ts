import { getAllDefs, getDef } from '@d2api/manifest-node';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { uniqAndSortArray, writeFile } from './helpers.js';

const inventoryItems = getAllDefs('InventoryItem');

const weaponHashToQuestHash: any = { weaponHash: Number, questHash: Number };

const allWeaponsHashes = inventoryItems
  .filter(
    (i) =>
      i.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) &&
      !i.itemCategoryHashes.includes(ItemCategoryHashes.Dummies),
  )
  .map((i) => i.hash);

const allWeaponQuests = uniqAndSortArray(
  inventoryItems
    .filter(
      (q) =>
        q.itemCategoryHashes?.includes(ItemCategoryHashes.QuestStep) &&
        q.value?.itemValue.filter((rewards) => allWeaponsHashes.includes(rewards.itemHash)),
    )
    .map((q) => q.setData?.itemList[0].itemHash),
);

allWeaponQuests.forEach((qHash) => {
  const questInfo = getDef('InventoryItem', qHash);
  const weaponRewardHash = questInfo?.value?.itemValue.filter((rewards) =>
    allWeaponsHashes.includes(rewards.itemHash),
  )[0]?.itemHash;

  if (weaponRewardHash) {
    weaponHashToQuestHash[weaponRewardHash] = questInfo?.setData?.itemList[0].itemHash;
  }
});

writeFile('./output/weapon-from-quest.json', weaponHashToQuestHash);
