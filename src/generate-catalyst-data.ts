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

const allRefits = uniqAndSortArray(
  inventoryItemsWithDummies
    .filter(
      (i) =>
        i.displayProperties.name.includes('Refit') &&
        i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies),
    )
    .map((i) => i.displayProperties.icon),
);

const refitIconAndNames = {};

for (const refitIcon of allRefits) {
  const refitNames = inventoryItemsWithDummies
    .filter((i) => i.displayProperties?.icon?.includes(refitIcon))
    .map((i) => i.displayProperties.name)
    .join(' ');
  Object.assign(refitIconAndNames, { [refitIcon]: refitNames });
}

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
    // For all crafted exotics, catalysts images are defined as refits see below
    switch (recordName) {
      case 'Revision Zero Catalyst':
        itemWithSameName = findMatchingRefitIcon(getCatalystPlugNamesForWeapon('Revision Zero'));
        break;
      case 'Immovable Refit': // Vexcalibur
        itemWithSameName = findMatchingRefitIcon(getCatalystPlugNamesForWeapon('Vexcalibur'));
        break;
      case 'Wish-Keeper Catalyst':
        itemWithSameName = findMatchingRefitIcon(getCatalystPlugNamesForWeapon('Wish-Keeper'));
        break;
      case 'Choir of One Catalyst':
        itemWithSameName = findMatchingRefitIcon(getCatalystPlugNamesForWeapon('Choir of One'));
        break;
      case 'Barrow-Dyad Catalyst':
        itemWithSameName = findMatchingRefitIcon(getCatalystPlugNamesForWeapon('Barrow-Dyad'));
        break;
      case "Slayer's Fang Catalyst":
        itemWithSameName = findMatchingRefitIcon(getCatalystPlugNamesForWeapon("Slayer's Fang"));
        break;
      case 'Graviton Spike Catalyst':
        itemWithSameName = findMatchingRefitIcon(getCatalystPlugNamesForWeapon('Graviton Spike'));
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

function findDummyItemWithSpecificIcon(DummyItemIcon: string) {
  return inventoryItemsWithDummies.find(
    (i) =>
      i.displayProperties.icon === DummyItemIcon &&
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
  for (const [icon, value] of Object.entries(refitIconAndNames)) {
    const refitNames = value?.toString() ?? '';
    // Check if ALL icon names match
    const allMatch = iconNames.every((name) => refitNames.includes(name));
    if (allMatch) {
      return findDummyItemWithSpecificIcon(icon);
    }
  }
  // No match found
  return findDummyItemWithSpecificIcon('');
}

function getCatalystPlugNamesForWeapon(weaponName: string): string[] {
  const EMPTY_CATALYST_SOCKET = 1649663920;
  const CATALYST_PLUGSET = 1210761952;
  const weapon = inventoryItems
    .find((i) => i.displayProperties.name === weaponName)
    ?.sockets?.socketEntries.find(
      (i) => i.socketTypeHash === CATALYST_PLUGSET,
    )?.randomizedPlugSetHash;
  const catalysts: string[] = [];
  const plugSet = getDef('PlugSet', weapon);
  if (plugSet) {
    for (const plug of plugSet.reusablePlugItems) {
      if (plug.plugItemHash != EMPTY_CATALYST_SOCKET) {
        catalysts.push(
          inventoryItems.find((i) => i.hash === plug.plugItemHash)?.displayProperties.name ?? '',
        );
      }
    }
  }
  return catalysts;
}
