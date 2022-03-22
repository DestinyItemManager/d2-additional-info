import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { DestinyRecordDefinition } from 'bungie-api-ts/destiny2';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { annotate, uniqAndSortArray, writeFile } from './helpers.js';

loadLocal();

const exoticWeaponHashesWithCatalyst: Number[] = [];
const exoticWeaponHashToCatalystRecord: Record<string, number> = {};
const catalystRecordNames: string[] = [];

const catalystPresentationNodeHash = getCatalystPresentationNodeHash();

const allsockets = getAll('DestinySocketTypeDefinition');
const inventoryItems = getAll('DestinyInventoryItemDefinition').filter(
  (i) => !i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies) && !i.crafting
);

// this is keyed with record hashes, and the values are catalyst inventoryItem icons
// (more interesting than the all-identical icons on catalyst triumphs)
const triumphData: any = { icon: String, source: String };

get(
  'DestinyPresentationNodeDefinition',
  catalystPresentationNodeHash
)?.children.presentationNodes.forEach((p) =>
  get('DestinyPresentationNodeDefinition', p.presentationNodeHash)?.children.records.forEach(
    (r) => {
      const recordName = get('DestinyRecordDefinition', r.recordHash)?.displayProperties.name;
      catalystRecordNames.push(recordName ?? '');
    }
  )
);

// loop the catalyst section of triumphs
get(
  'DestinyPresentationNodeDefinition',
  catalystPresentationNodeHash
)?.children.presentationNodes.forEach((p) =>
  get('DestinyPresentationNodeDefinition', p.presentationNodeHash)?.children.records.forEach(
    (r) => {
      const recordInfo = get('DestinyRecordDefinition', r.recordHash);
      const recordName = recordInfo?.displayProperties.name;

      // look for an inventoryItem with the same name, and tierType 6 (should find the catalyst for that gun)
      const itemWithSameName = inventoryItems.find(
        (i) => i.displayProperties.name === recordName && i.plug?.plugStyle === 1 // Masterwork Plug style for exotics are catalysts
      );

      if (recordName && itemWithSameName) {
        // Generate List of Exotic Weapons with Catalysts
        const exoticWithCatalyst =
          findCatalystSocketHash(itemWithSameName.hash, recordInfo) ||
          findCatalystSocketTypeHash(itemWithSameName.plug?.plugCategoryHash, recordInfo);

        if (exoticWithCatalyst) {
          exoticWeaponHashToCatalystRecord[exoticWithCatalyst.hash] = r.recordHash;
          exoticWeaponHashesWithCatalyst.push(exoticWithCatalyst.hash);
        }
      }

      // and get its icon image
      const icon = itemWithSameName?.displayProperties?.icon;

      // this "if" check is because of classified data situations
      if (icon) {
        triumphData[r.recordHash] = icon;
      } else {
        console.log(`no catalyst image found for ${r.recordHash} ${recordName}`);
      }
    }
  )
);

// Generate List of Sorted Exotic Weapons Hashes with Catalysts
const pretty = `const exoticWeaponHashesWithCatalyst: Set<number> = new Set([\n${uniqAndSortArray(
  exoticWeaponHashesWithCatalyst
)
  .map((h) => `${h},\n`)
  .join('')}]);\n\nexport default exoticWeaponHashesWithCatalyst;`;
const annotatedExoticHashes = annotate(pretty);

writeFile('./output/catalyst-triumph-icons.json', triumphData);
writeFile('./output/exotics-with-catalysts.ts', annotatedExoticHashes);
writeFile('./output/exotic-to-catalyst-record.json', exoticWeaponHashToCatalystRecord);

function getCatalystPresentationNodeHash(): number | undefined {
  const presentationNodes = getAll('DestinyPresentationNodeDefinition');
  const catNodeHash = presentationNodes.find(
    (p) =>
      p.displayProperties.name === 'Exotic Catalysts' && p.children.presentationNodes.length > 1
  )?.hash;
  return catNodeHash;
}

function noCatalystOverride(itemName: string, recordInfo: DestinyRecordDefinition) {
  switch (itemName) {
    case "Leviathan's Breath":
      return true;
    default:
      switch (recordInfo.scope) {
        case 1: // Should filter out Bastion and Devil's Ruin
          return false;
        default:
          return true;
      }
  }
}

function findCatalystSocketHash(catalystSocketHash: number, recordInfo: DestinyRecordDefinition) {
  return inventoryItems.find(
    (item) =>
      noCatalystOverride(item.displayProperties.name, recordInfo) &&
      item.sockets?.socketEntries.find(
        (socket) => socket.reusablePlugItems[0]?.plugItemHash === catalystSocketHash
      )
  );
}

function findCatalystSocketTypeHash(
  catalystPCH: number | undefined,
  recordInfo: DestinyRecordDefinition
) {
  let item = undefined;
  let count = 0;
  let notallsockets = allsockets;
  do {
    // some sockettypes only exist on crafting versions... Osteo Striga
    // This attempts to locate the correct socketType 3x then skips
    let sockettypehash = allsockets.find((sockets) =>
      sockets.plugWhitelist.find((plug) => plug.categoryHash === catalystPCH)
    )?.hash;

    item = inventoryItems.find(
      (item) =>
        noCatalystOverride(item.displayProperties.name, recordInfo) &&
        item.sockets?.socketEntries.find((socket) => socket.socketTypeHash === sockettypehash)
    );

    count++;
    if (!item) {
      notallsockets = notallsockets.filter((sockets) => sockets.hash !== sockettypehash);

      sockettypehash = notallsockets.find((sockets) =>
        sockets.plugWhitelist.find((plug) => plug.categoryHash === catalystPCH)
      )?.hash;

      item = inventoryItems.find(
        (item) =>
          noCatalystOverride(item.displayProperties.name, recordInfo) &&
          item.sockets?.socketEntries.find((socket) => socket.socketTypeHash === sockettypehash)
      );
    }
  } while (!item && count < 3);

  return item;
}
