import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { annotate, uniqAndSortArray, writeFile } from './helpers.js';

loadLocal();

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
  IGNORED_CATALYSTS_NAMES.push(
    get('DestinyInventoryItemDefinition', hash)?.displayProperties.name ?? ''
  )
);

const allsockets = getAll('DestinySocketTypeDefinition');
const inventoryItems = getAll('DestinyInventoryItemDefinition').filter(
  (i) =>
    !i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies) &&
    !i.crafting &&
    !IGNORED_CATALYSTS.includes(i.hash)
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
      const recordName = get('DestinyRecordDefinition', r.recordHash)?.displayProperties.name;

      // look for an inventoryItem with the same name, and plugStyle 1 (should find the catalyst for that gun)
      const itemWithSameName = inventoryItems.find(
        (i) => i.displayProperties.name === recordName && i.plug?.plugStyle === 1
      );

      if (recordName && itemWithSameName) {
        // Generate List of Exotic Weapons with Catalysts
        const exoticWithCatalyst =
          findCatalystSocketHash(itemWithSameName.hash) ||
          findCatalystSocketTypeHash(itemWithSameName.plug?.plugCategoryHash);

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
        if (!IGNORED_CATALYSTS_NAMES.some((term) => recordName?.includes(term))) {
          console.log(`no catalyst image found for ${r.recordHash} ${recordName}`);
        }
      }
    }
  )
);

// Generate List of Sorted Exotic Weapons Hashes with Catalysts
const pretty = `const exoticWeaponHashesWithCatalyst = new Set<number>([\n${uniqAndSortArray(
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

function findCatalystSocketHash(catalystSocketHash: number) {
  return inventoryItems.find((item) =>
    item.sockets?.socketEntries.find(
      (socket) => socket.reusablePlugItems[0]?.plugItemHash === catalystSocketHash
    )
  );
}

function findCatalystSocketTypeHash(catalystPCH: number | undefined) {
  let item = undefined;
  let count = 0;
  let notallsockets = allsockets;
  do {
    // some socketTypes only exist on crafting versions... Osteo Striga
    // This attempts to locate the correct socketType 3x then stops looking
    let socketTypeHash = allsockets.find((sockets) =>
      sockets.plugWhitelist?.find((plug) => plug.categoryHash === catalystPCH)
    )?.hash;

    item = inventoryItems.find((item) =>
      item.sockets?.socketEntries.find((socket) => socket.socketTypeHash === socketTypeHash)
    );

    count++;
    if (!item) {
      notallsockets = notallsockets.filter((sockets) => sockets.hash !== socketTypeHash);

      socketTypeHash = notallsockets.find((sockets) =>
        sockets.plugWhitelist?.find((plug) => plug.categoryHash === catalystPCH)
      )?.hash;

      item = inventoryItems.find((item) =>
        item.sockets?.socketEntries.find((socket) => socket.socketTypeHash === socketTypeHash)
      );
    }
  } while (!item && count < 3);

  return item;
}
