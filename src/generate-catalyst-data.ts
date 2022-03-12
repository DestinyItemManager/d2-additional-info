import { get, getAll, loadLocal } from '@d2api/manifest-node';
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
        (i) => i.displayProperties.name === recordName && i.plug?.plugStyle === 1 // Masterwork Plug style for exotics are catalysts
      );

      if (recordName) {
        // Generate List of Exotic Weapons with Catalysts
        const exoticWithCatalyst = inventoryItems.find(
          (i) =>
            i.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) &&
            i.inventory?.tierType === 6 &&
            i.collectibleHash &&
            !i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies) &&
            nameMatcher(i.displayProperties.name, recordName, 66)
        );
        if (exoticWithCatalyst) {
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

function nameMatcher(itemName: string, recordName: string, minRatio: number) {
  const itemNameWords = scrubWords(itemName).split(' ').filter(Boolean);
  const recordNameWords = scrubWords(recordName.replace(/Catalyst/, ''))
    .split(' ')
    .filter(Boolean);

  const matchedWords = itemNameWords.filter((word) => recordNameWords.includes(word));

  const ratio = +((100 * matchedWords.length) / itemNameWords.length).toPrecision(2);
  if (itemName === 'Prometheus Lens') {
    console.log(itemNameWords, recordNameWords, ratio);
  }
  return ratio >= minRatio && noCatalystOverride(itemName);
}

function scrubWords(str: string) {
  return str
    .replace(/of /, '')
    .replace(/the /i, '')
    .replace(/Lance/, '') // Graviton Lance && Polaris
    .replace(/Dead/, '') // Dead Messenger && Dead Man's Tale
    .replace(/Worm/, '') // Whisper of the Worm
    .replace(/\'s Oath/, '') // Skyburner's Oath
    .replace(/Legend/, '') // Legend of Acrius
    .replace(/Lens/, '') // Prometheus Lens
    .replace(/Zero/, ''); // Worldline Zero
}

function noCatalystOverride(str: string) {
  switch (str) {
    case 'Bastion':
    case "Devil's Ruin":
      return false;
  }
  return true;
}
