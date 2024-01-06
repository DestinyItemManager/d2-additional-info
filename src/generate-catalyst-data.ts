import { getAllDefs, getDef } from '@d2api/manifest-node';
import { TierType } from 'bungie-api-ts/destiny2/interfaces.js';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { annotate, uniqAndSortArray, writeFile } from './helpers.js';

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

getDef('PresentationNode', catalystPresentationNodeHash)?.children.presentationNodes.forEach(
  (p) =>
    getDef('PresentationNode', p.presentationNodeHash)?.children.records.forEach((r) => {
      const recordName = getDef('Record', r.recordHash)?.displayProperties.name;
      catalystRecordNames.push(recordName ?? '');
    }),
);

// loop the catalyst section of triumphs
getDef('PresentationNode', catalystPresentationNodeHash)?.children.presentationNodes.forEach(
  (p) =>
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

      // Work around for weirdly named catalysts && craftable exotics from quests
      // still no good picture for osteo striga catalyst
      if (recordName === 'Two-Tailed Fox Catalyst') {
        itemWithSameName = inventoryItems.find(
          (i) => i.displayProperties.name === 'Third Tail' && i.plug?.plugStyle === 1,
        );
      } else if (recordName === 'Revision Zero Catalyst') {
        // rev0
        itemWithSameName = inventoryItemsWithDummies.find(
          (i) =>
            i.displayProperties.name === '4-Timer Refit' &&
            i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies),
        );
      } else if (recordName === 'Immovable Refit') {
        // vexcalibur
        itemWithSameName = inventoryItemsWithDummies.find(
          (i) =>
            i.displayProperties.name === 'Immovable Refit' &&
            i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies),
        );
      } else if (recordName === 'Wish-Keeper Catalyst') {
        // wish-keeper
        itemWithSameName = inventoryItemsWithDummies.find(
          (i) =>
            i.displayProperties.name === 'Hatchling Refit' &&
            i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies),
        );
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
          console.log(`no catalyst image found for ${r.recordHash} ${recordName}`);
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
  return inventoryItems.find(
    (item) =>
      item.sockets?.socketEntries.find(
        (socket) => socket.reusablePlugItems[0]?.plugItemHash === catalystPlugHash,
      ),
  );
}

function findWeaponViaCatalystPCH(catalystPCH: number | undefined) {
  const socketTypeHash = allsockets.find(
    (sockets) => sockets.plugWhitelist?.find((plug) => plug.categoryHash === catalystPCH),
  )?.hash;

  return inventoryItems.find(
    (item) =>
      item.sockets?.socketEntries.find((socket) => socket.socketTypeHash === socketTypeHash),
  );
}
