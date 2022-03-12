import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { diffArrays, writeFile } from './helpers.js';

loadLocal();

const catalystPresentationNodeHash = getCatalystPresentationNodeHash();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

// this is keyed with record hashes, and the values are catalyst inventoryItem icons
// (more interesting than the all-identical icons on catalyst triumphs)
const triumphData: any = { icon: String, source: String };

// // Generate List of Exotic Weapons
const allExoticWeaponHashes = inventoryItems
  .filter(
    (i) =>
      i.equippingBlock?.uniqueLabel === 'exotic_weapon' &&
      !i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies)
  )
  .map((i) => i.hash);

const exoticWeaponHashesWithCatalyst: Number[] = [];
// loop the catalyst section of triumphs
get(
  'DestinyPresentationNodeDefinition',
  catalystPresentationNodeHash
)?.children.presentationNodes.forEach((p) =>
  get('DestinyPresentationNodeDefinition', p.presentationNodeHash)?.children.records.forEach(
    (r) => {
      const recordName = get('DestinyRecordDefinition', r.recordHash)?.displayProperties.name;

      // look for an inventoryItem with the same name, and tierType 6 (should find the catalyst for that gun)
      const itemWithSameName = inventoryItems.find(
        (i) => i.displayProperties.name === recordName && i.inventory!.tierType === 6
      );

      if (recordName) {
        // Generate List of Exotic Weapons with Catalysts
        inventoryItems.find(
          (i) =>
            i.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) &&
            i.inventory?.tierType === 6 &&
            !i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies) &&
            nameMatcher(i) === recordName &&
            exoticWeaponHashesWithCatalyst.push(i.hash)
        );
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

// Generate List of Exotic Weapons without Catalysts
const noCatalysts = diffArrays(allExoticWeaponHashes, exoticWeaponHashesWithCatalyst);

writeFile('./output/catalyst-triumph-icons.json', triumphData);
writeFile('./output/exotics-without-catalysts.json', noCatalysts);

function getCatalystPresentationNodeHash(): number | undefined {
  const presentationNodes = getAll('DestinyPresentationNodeDefinition');
  const catNodeHash = presentationNodes.find(
    (p) =>
      p.displayProperties.name === 'Exotic Catalysts' && p.children.presentationNodes.length > 1
  )?.hash;
  return catNodeHash;
}

function nameMatcher(item: DestinyInventoryItemDefinition) {
  const itemName =
    item.hash === 1744115122
      ? 'Acrius No Catalyst' // Non-Catalyst Version of Acrius
      : item.displayProperties.name
          .replace(/The /, '') // The Wardcliff Coil - Wardcliff Coil Catalyst
          .replace(/Lens/, '') // Prometheus Lens - Prometheus Catalyst
          .replace(/Legend of /, '') // Legend of Acrius - Acrius Catalyst
          .replace(/ Zero/, '') // Worldline Zero - Worldline Catalyst
          .replace(/ of the Worm/, '') // Whisper of the Worm - Whisper Catalyst
          .replace(/'s Oath/, '') // Skyburner's Oath - Skyburner Catalyst
          .replace(/Bastion/, 'Bastion No Catalyst') // no catalyst
          .replace(/Devil's Ruin/, "Devil's Ruin No Catalyst"); // no catalyst

  return item.displayProperties.name === 'Lorentz Driver' ? `${itemName}` : `${itemName} Catalyst`;
}
