import { getAllDefs, getDef } from '@d2api/manifest-node';
import { TierType } from 'bungie-api-ts/destiny2/interfaces.js';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { annotate, uniqAndSortArray, writeFile } from './helpers.js';
import { infoLog } from './log.js';

const TAG = 'CATALYST-DATA';

const exoticWeaponHashesWithCatalyst: number[] = [];
const exoticWeaponHashToCatalystRecord: Record<string, number> = {};
const catalystRecordNames: string[] = [];

const catalystPresentationNodeHash = getCatalystPresentationNodeHash();

// These catalysts are not available in-game.
const IGNORED_CATALYSTS = [
  4273298922, // Bastion
  2732252706, // Devil's Ruin
];

const IGNORED_CATALYSTS_NAMES: string[] = []; // Filled in below with names via hashes from above

IGNORED_CATALYSTS.forEach((hash) =>
  IGNORED_CATALYSTS_NAMES.push(getDef('InventoryItem', hash)?.displayProperties.name ?? ''),
);

const allsockets = getAllDefs('SocketType');
const inventoryItemsWithDummies = getAllDefs('InventoryItem').filter(
  (i) => !i.crafting && !IGNORED_CATALYSTS.includes(i.hash),
);
const inventoryItems = inventoryItemsWithDummies.filter(
  (i) => !i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies),
);
const craftableExotics = getAllDefs('InventoryItem')
  .filter((i) => i.crafting)
  .map((i) => getDef('InventoryItem', i.crafting.outputItemHash))
  .filter((i) => i?.inventory?.tierType === TierType.Exotic);

// this is keyed with record hashes, and the values are catalyst inventoryItem icons
// (more interesting than the all-identical icons on catalyst triumphs)
const triumphData: any = { icon: String, source: String };

getDef('PresentationNode', catalystPresentationNodeHash)?.children.presentationNodes.forEach((p) =>
  getDef('PresentationNode', p.presentationNodeHash)?.children.records.forEach((r) => {
    const recordName = getDef('Record', r.recordHash)?.displayProperties.name;
    catalystRecordNames.push(recordName ?? '');
  }),
);

// loop the catalyst section of triumphs
getDef('PresentationNode', catalystPresentationNodeHash)?.children.presentationNodes.forEach((p) =>
  getDef('PresentationNode', p.presentationNodeHash)?.children.records.forEach((r) => {
    const record = getDef('Record', r.recordHash);
    const recordName = record?.displayProperties.name;
    if (!record || !recordName) {
      return;
    }

    // look for an inventoryItem with the same name, and plugStyle 1 (should find the catalyst for that gun)
    let itemWithSameName = inventoryItems.find(
      (i) => i.displayProperties.name === recordName && i.plug?.plugStyle === 1,
    );

    // Work around for weirdly named catalysts
    if (recordName === 'Two-Tailed Fox Catalyst') {
      itemWithSameName = inventoryItems.find(
        (i) => i.displayProperties.name === 'Third Tail' && i.plug?.plugStyle === 1,
      );
    }

    // Work around for exotic quest craftables
    // still no good icon for osteo striga catalyst
    switch (recordName) {
      case 'Revision Zero Catalyst':
        itemWithSameName = findMatchingRefitIcon([
          '4-Timer Refit',
          'Frenzy Refit',
          'Outlaw Refit',
          'Pressurized Refit',
        ]);
        break;
      case 'Immovable Refit': // Vexcalibur
        itemWithSameName = findMatchingRefitIcon([
          'Immovable Refit',
          'Robber Refit',
          'Feedback Refit',
        ]);
        break;
      case 'Wish-Keeper Catalyst': // Hatchling Refit is also on Barrow-Dyad
        itemWithSameName = findMatchingRefitIcon([
          'Hatchling Refit',
          'Multi-Threaded Snare Refit',
          'Enduring Snare Refit',
          'Vorpal Weapon Refit',
        ]);
        break;
      case 'Choir of One Catalyst': // Subsistence Refit is also on Gravition Spike
        itemWithSameName = findMatchingRefitIcon([
          'Onslaught Refit',
          'Subsistence Refit',
          'Destablizing Rounds Refit',
        ]);
        break;
      case 'Barrow-Dyad Catalyst':
        itemWithSameName = findMatchingRefitIcon([
          'Target Lock Refit',
          'High Impact Reserves Refit',
          'One for All Refit',
          'Hatchling Refit',
        ]);
        break;
      case "Slayer's Fang Catalyst":
        itemWithSameName = findMatchingRefitIcon([
          'Loose Change Refit',
          'Stats for All Refit',
          'Cascade Point Refit',
          'Repulsor Brace Refit',
        ]);
        break;
      case 'Graviton Spike Catalyst':
        itemWithSameName = findMatchingRefitIcon([
          'Rapid Hit Refit',
          'Subsistence Refit',
          'Rapid Hit Refit',
          'Temporal Alignment Refit',
          'Transcendent Zen Refit',
        ]);
        break;
    }

    const matchingExotic =
      (itemWithSameName &&
        (findWeaponViaCatalystPlug(itemWithSameName.hash) ??
          findWeaponViaCatalystPCH(itemWithSameName.plug?.plugCategoryHash))) ??
      craftableExotics.find((i) =>
        record.displayProperties.description.includes(i!.displayProperties.name),
      );

    if (matchingExotic) {
      exoticWeaponHashToCatalystRecord[matchingExotic.hash] = r.recordHash;
      exoticWeaponHashesWithCatalyst.push(matchingExotic.hash);
    }

    // and get its icon image
    const icon = itemWithSameName?.displayProperties?.icon;

    // this "if" check is because of classified data situations
    if (icon) {
      triumphData[r.recordHash] = icon;
    } else {
      if (!IGNORED_CATALYSTS_NAMES.some((term) => recordName?.includes(term))) {
        infoLog(TAG, `no catalyst image found for ${r.recordHash} ${recordName}`);
      }
    }
  }),
);

// Generate List of Sorted Exotic Weapons Hashes with Catalysts
const pretty = `const exoticWeaponHashesWithCatalyst = new Set<number>([\n${uniqAndSortArray(
  exoticWeaponHashesWithCatalyst,
)
  .map((h) => `${h},\n`)
  .join('')}]);\n\nexport default exoticWeaponHashesWithCatalyst;`;
const annotatedExoticHashes = annotate(pretty);

// Get all Dummy Catalyst items, figure out their PCHs, and map them to the reinitializationPossiblePlugHashes items if available
// This will create a mapping of dummy catalyst -> actual catalyst for all guns that 'auto-apply' catalyst when pulled from collections
const dummyCatalystMapping = Object.fromEntries(
  getAllDefs('InventoryItem')
    .filter((i) => i.itemType === 20 && i.plug?.uiPlugLabel === 'masterwork_interactable')
    .filter((i) => i.plug?.plugCategoryHash && i.hash)
    .map((i) => [i.hash, findAutoAppliedCatalystForCatalystPCH(i.plug!.plugCategoryHash)])
    .filter(([hash, catalyst]) => hash && catalyst)
    .map(([hash, catalyst]) => [hash, catalyst!]),
);

writeFile('./output/dummy-catalyst-mapping.json', dummyCatalystMapping);
writeFile('./output/catalyst-triumph-icons.json', triumphData);
writeFile('./output/exotics-with-catalysts.ts', annotatedExoticHashes);
writeFile('./output/exotic-to-catalyst-record.json', exoticWeaponHashToCatalystRecord);

function getCatalystPresentationNodeHash(): number | undefined {
  const presentationNodes = getAllDefs('PresentationNode');
  const catNodeHash = presentationNodes.find(
    (p) =>
      p.displayProperties.name === 'Exotic Catalysts' && p.children.presentationNodes.length > 1,
  )?.hash;
  return catNodeHash;
}

function findWeaponViaCatalystPlug(catalystPlugHash: number) {
  return inventoryItems.find((item) =>
    item.sockets?.socketEntries.find(
      (socket) => socket.reusablePlugItems[0]?.plugItemHash === catalystPlugHash,
    ),
  );
}

function findWeaponViaCatalystPCH(catalystPCH: number | undefined) {
  const socketTypeHash = allsockets.find((sockets) =>
    sockets.plugWhitelist?.find((plug) => plug.categoryHash === catalystPCH),
  )?.hash;

  return inventoryItems.find((item) =>
    item.sockets?.socketEntries.find((socket) => socket.socketTypeHash === socketTypeHash),
  );
}

function findDummyItemWithSpecificName(DummyItemName: string) {
  return inventoryItemsWithDummies.find(
    (i) =>
      i.displayProperties.name === DummyItemName &&
      i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies),
  );
}

function findAutoAppliedCatalystForCatalystPCH(catalystPCH: number) {
  const plug = allsockets
    .flatMap((socket) => socket.plugWhitelist || [])
    .find((plug) => plug.categoryHash === catalystPCH);

  return plug?.reinitializationPossiblePlugHashes?.[0];
}

function findMatchingRefitIcon(iconNames: string[]) {
  const count: string[] = [];
  let duplicates = [];
  for (const iconName of iconNames) {
    count.push(findDummyItemWithSpecificName(iconName)?.displayProperties.icon ?? '');
  }

  duplicates = [...new Set(count)].map((value) => [
    value,
    count.filter((str) => str === value).length,
  ]);

  const [highestUrl] = duplicates.reduce((max, current) => (current[1] > max[1] ? current : max));

  return inventoryItemsWithDummies.find(
    (i) =>
      i.displayProperties.icon === highestUrl &&
      i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies),
  );
}
