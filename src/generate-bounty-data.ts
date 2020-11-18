import { get, getAll, loadLocal } from '@d2api/manifest/node';
import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2';
import { matchTable } from '../data/bounties/bounty-config';
import { writeFile } from './helpers';

type Ruleset = typeof matchTable[number];
type BountyMetadata = Ruleset['assign'];
type AssignmentCategory = keyof BountyMetadata;

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const debug = true;

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// acceptable item categories
const categoryAllowList = [
  16, // Quest Steps
  //53, // Quests
  27, // More bounties??
  1784235469, // Bounties
];

// const definitionTypes = ['Place', 'ActivityMode', 'DamageType', 'ItemCategory']; //, 'Activity'];

// collects definition->bounty associations
// const toBounty:{[key:string]:{}} = {};

// collects bounty->definition associations
const bounties: Record<string, BountyMetadata> = {};

// definitionTypes.forEach((definitionType) => {
//   toBounty[definitionType] = {};
// });

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
};

const matchTypes = ['name', 'desc', 'obj', 'type'] as const;

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

    // TODO: go through vendor defs and see who sells what??
    // match against vendorHashes
    //if (ruleset.vendorHashes)
    //  ruleset.vendorHashes.forEach((findHash) => {
    //    if (inventoryItem.sourceData.vendorSources[0] && inventoryItem.sourceData.vendorSources[0].vendorHash == findHash)
    //      Object.entries(ruleset.assign).forEach(([assignTo, assignValue]) => {
    //        thisBounty[assignTo][assignValue] = true;
    //      });
    //  });

    // match against categoryHashes
    // if (ruleset.categoryHashes) {
    //   ruleset.categoryHashes.forEach((findHash) => {
    //     if (inventoryItem.itemCategoryHashes?.includes(findHash)) {
    //       assign(ruleset, thisBounty);
    //     }
    //   });
    // }

    // convert objects to arrays
    //  Object.entries(thisBounty).forEach(([key, value]) => {
    //    if (typeof value == 'object') thisBounty[key] = Object.keys(value);
    //  });

    // add debug string

    // inject requiredItems array. unsure why do instead of leaving a reference string
    //  if (!debug && thisBounty.requiredItems[0])
    //    thisBounty.requiredItems = requirements[thisBounty.requiredItems[0]];
    //console.log(inventoryItem.hash);
    if (Object.keys(thisBounty).length > 0) {
      bounties[inventoryItem.hash] = thisBounty;
    }
  });

  // Manually fix up some crucible bounties
  if (
    !thisBounty.ActivityMode &&
    inventoryItem.inventory?.stackUniqueLabel?.includes('crucible.daily')
  ) {
    thisBounty.ActivityMode = [1164760504];
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
      places: thisBounty.Destination?.map((p) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return get('DestinyDestinationDefinition', p)?.displayProperties.name;
      }),
      activities: thisBounty.ActivityMode?.map((a) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return get('DestinyActivityModeDefinition', a)?.displayProperties.name;
      }),
      dmg: thisBounty.DamageType?.map((a) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return get('DestinyDamageTypeDefinition', a)?.displayProperties.name;
      }),
      item: thisBounty.ItemCategory?.map((a) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return get('DestinyItemCategoryDefinition', a)?.displayProperties.name;
      }),
    });
  }
});

const allFile = bounties;

/*
//writeFile('./output/relationships-by-inventoryItem.json', bounties);
definitionTypes.forEach((definitionType) => {
  //writeFile(`./output/inventoryItems-by-${definitionType.toLowerCase()}.json`, toBounty[definitionType]);
  allFile[definitionType] = toBounty[definitionType];
});
*/

writeFile('./output/pursuits.json', allFile);
