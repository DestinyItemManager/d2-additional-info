import { getAllDefs, getDef, loadLocal } from '@d2api/manifest-node';
import { DestinyInventoryItemDefinition, DestinyRecordDefinition } from 'bungie-api-ts/destiny2';
import { KillType, matchTable } from '../data/bounties/bounty-config.js';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

type Ruleset = typeof matchTable[number];
type BountyMetadata = Ruleset['assign'];
type AssignmentCategory = keyof BountyMetadata;

loadLocal();

const inventoryItems = getAllDefs('InventoryItem');

const debug = false;
const debugRecords = false;

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// acceptable item categories
const categoryAllowList = [ItemCategoryHashes.QuestStep, ItemCategoryHashes.Bounties];

// collects definition->bounty associations
// const toBounty:{[key:string]:{}} = {};

// collects bounty->definition associations
const bounties: Record<string, BountyMetadata> = {};

const accessors = {
  name: (item: DestinyInventoryItemDefinition) => item.displayProperties.name,
  desc: (item: DestinyInventoryItemDefinition) => item.displayProperties.description,
  obj: (item: DestinyInventoryItemDefinition) =>
    item.objectives?.objectiveHashes
      .map((o) => {
        const obj = getDef('Objective', o);
        return obj?.displayProperties?.name || obj?.progressDescription;
      })
      .join(),
  type: (item: DestinyInventoryItemDefinition) => item.itemTypeAndTierDisplayName,
  label: (item: DestinyInventoryItemDefinition) => item.inventory?.stackUniqueLabel,
};

const recordAccessors = {
  name: (item: DestinyRecordDefinition) => item.displayProperties.name,
  desc: (item: DestinyRecordDefinition) => item.displayProperties.description,
  obj: (item: DestinyRecordDefinition) =>
    item.objectiveHashes
      ?.map((o) => {
        const obj = getDef('Objective', o);
        return obj?.displayProperties?.name || obj?.progressDescription;
      })
      .join(),
  type: () => undefined,
  label: () => undefined,
};

const matchTypes = ['name', 'desc', 'obj', 'type', 'label'] as const;

function assign(ruleset: Ruleset, bounty: BountyMetadata) {
  Object.entries(ruleset.assign).forEach(([assignTo, assignValues]) => {
    //:[keyof typeof ruleset,number[]]
    // add these values to the bounty's attributes
    const assignTo_ = assignTo as AssignmentCategory;
    bounty[assignTo_] = [...new Set([...(bounty[assignTo_] ?? []), ...(assignValues ?? [])])];
  });
}

// loop through the manifest's bounties
inventoryItems.forEach((inventoryItem) => {
  // filter loops through acceptable categories -- includes loops through item's hashes
  if (
    !categoryAllowList.some((findHash) => inventoryItem.itemCategoryHashes?.includes(findHash)) &&
    !inventoryItem.inventory?.stackUniqueLabel?.includes('bounties')
  ) {
    return;
  }

  // normalize bounty's available data

  const thisBounty: BountyMetadata = {};
  // loop through matching conditions
  matchTable.forEach((ruleset) => {
    // match against strings or regexen
    matchTypes.forEach((matchType) => {
      ruleset[matchType]?.forEach((match) => {
        // convert regex||string to regex
        match = match instanceof RegExp ? match : new RegExp(escapeRegExp(match));

        // and run the regex
        const stringToTest = accessors[matchType](inventoryItem);
        if (stringToTest && match.test(stringToTest)) {
          assign(ruleset, thisBounty);
        }
      });
    });
  });

  if (Object.keys(thisBounty).length > 0) {
    bounties[inventoryItem.hash] = thisBounty;
  } else {
    // These bounties won't show up in pursuits.json
    if (debug) {
      console.log(inventoryItem.displayProperties.name);
    }
  }

  if (debug) {
    console.log({
      ...thisBounty,
      hash: inventoryItem.hash,
      name: inventoryItem.displayProperties.name,
      description: inventoryItem.displayProperties.description,
      objectives: inventoryItem.objectives?.objectiveHashes.map((o) => {
        const obj = getDef('Objective', o);
        return obj?.displayProperties.name || obj?.progressDescription;
      }),
      type: inventoryItem.itemTypeAndTierDisplayName,
      label: inventoryItem.inventory?.stackUniqueLabel,
      places: thisBounty.Destination?.map((p) => getDef('Destination', p)?.displayProperties.name),
      activities: thisBounty.ActivityMode?.map(
        (a) => getDef('ActivityMode', a)?.displayProperties.name
      ),
      dmg: thisBounty.DamageType?.map((a) => getDef('DamageType', a)?.displayProperties.name),
      item: thisBounty.ItemCategory?.map((a) => getDef('ItemCategory', a)?.displayProperties.name),
      kill: thisBounty.KillType?.map((k) => KillType[k]),
    });
  }
});

writeFile('./output/pursuits.json', bounties, true);

function flattenRecords(hash: number): number[] {
  const node = getDef('PresentationNode', hash);

  let records = node?.children.records.map((r) => r.recordHash) || [];

  if (node?.children.presentationNodes) {
    records = [
      ...records,
      ...(node?.children.presentationNodes.flatMap((n) => flattenRecords(n.presentationNodeHash)) ??
        []),
    ];
  }

  return records;
}

// TODO: call the settings API to get this.
const recordHashes = flattenRecords(3443694067);

const recordInfo: Record<string, BountyMetadata> = {};
for (const recordHash of recordHashes) {
  const record = getDef('Record', recordHash);

  if (!record) {
    continue;
  }

  const thisBounty: BountyMetadata = {};
  // loop through matching conditions
  matchTable.forEach((ruleset) => {
    // match against strings or regexen
    matchTypes.forEach((matchType) => {
      ruleset[matchType]?.forEach((match) => {
        // convert regex||string to regex
        match = match instanceof RegExp ? match : new RegExp(escapeRegExp(match));

        // and run the regex
        const stringToTest = recordAccessors[matchType](record);
        if (stringToTest && match.test(stringToTest)) {
          assign(ruleset, thisBounty);
        }
      });
    });
  });

  if (Object.keys(thisBounty).length > 0) {
    recordInfo[record.hash] = thisBounty;
  } else {
    // These bounties won't show up in pursuits.json
    if (debugRecords) {
      console.log(record.displayProperties.name);
    }
  }

  if (debugRecords) {
    console.log({
      ...thisBounty,
      hash: record.hash,
      name: record.displayProperties.name,
      description: record.displayProperties.description,
      objectives: record.objectiveHashes?.map((o) => {
        const obj = getDef('Objective', o);
        return obj?.displayProperties.name || obj?.progressDescription;
      }),
      places: thisBounty.Destination?.map((p) => getDef('Destination', p)?.displayProperties.name),
      activities: thisBounty.ActivityMode?.map(
        (a) => getDef('ActivityMode', a)?.displayProperties.name
      ),
      dmg: thisBounty.DamageType?.map((a) => getDef('DamageType', a)?.displayProperties.name),
      item: thisBounty.ItemCategory?.map((a) => getDef('ItemCategory', a)?.displayProperties.name),
      kill: thisBounty.KillType?.map((k) => KillType[k]),
    });
  }
}

writeFile('./output/seasonal-challenges.json', recordInfo, true);
