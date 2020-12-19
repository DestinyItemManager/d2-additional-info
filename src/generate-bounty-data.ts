import { get, getAll, loadLocal } from '@d2api/manifest/node';
import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2';
import { matchTable } from '../data/bounties/bounty-config';
import { ItemCategoryHashes } from '../data/generated-enums';
import { writeFile } from './helpers';

type Ruleset = typeof matchTable[number];
type BountyMetadata = Ruleset['assign'];
type AssignmentCategory = keyof BountyMetadata;

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const debug = false;

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
        const obj = get('DestinyObjectiveDefinition', o);
        return obj?.displayProperties?.name || obj?.progressDescription;
      })
      .join(),
  type: (item: DestinyInventoryItemDefinition) => item.itemTypeAndTierDisplayName,
  label: (item: DestinyInventoryItemDefinition) => item.inventory?.stackUniqueLabel,
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
        const obj = get('DestinyObjectiveDefinition', o);
        obj?.displayProperties.name || obj?.progressDescription;
      }),
      type: inventoryItem.itemTypeAndTierDisplayName,
      label: inventoryItem.inventory?.stackUniqueLabel,
      places: thisBounty.Destination?.map((p) => {
        get('DestinyDestinationDefinition', p)?.displayProperties.name;
      }),
      activities: thisBounty.ActivityMode?.map((a) => {
        get('DestinyActivityModeDefinition', a)?.displayProperties.name;
      }),
      dmg: thisBounty.DamageType?.map((a) => {
        get('DestinyDamageTypeDefinition', a)?.displayProperties.name;
      }),
      item: thisBounty.ItemCategory?.map((a) => {
        get('DestinyItemCategoryDefinition', a)?.displayProperties.name;
      }),
    });
  }
});

writeFile('./output/pursuits.json', bounties);
