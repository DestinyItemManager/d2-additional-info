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

const allExoticWeaponNames = inventoryItems
  .filter(
    (i) =>
      i.equippingBlock?.uniqueLabel === 'exotic_weapon' &&
      !i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies)
  )
  .map((i) => i.displayProperties.name);

const exoticWeaponHashesWithCatalyst: Number[] = [];
const exoticWeaponHashToCatalystRecord: Record<string, number> = {};

const catalystRecordNames: string[] = [];
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

const exoticNameRemovalRegex = makeRegexFromUnduplicateNames(
  deduplicateNames(allExoticWeaponNames).concat(deduplicateNames(catalystRecordNames))
);
console.log(exoticNameRemovalRegex);

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
            noCatalystOverride(i.displayProperties.name) &&
            fuzzyNameMatcher(i.displayProperties.name, recordName)
        );
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

// Generate List of Exotic Weapons without Catalysts
const noCatalysts = diffArrays(allExoticWeaponHashes, exoticWeaponHashesWithCatalyst);

writeFile('./output/catalyst-triumph-icons.json', triumphData);
writeFile('./output/exotics-without-catalysts.json', noCatalysts);
writeFile('./output/exotic-to-catalyst-record.json', exoticWeaponHashToCatalystRecord);

function getCatalystPresentationNodeHash(): number | undefined {
  const presentationNodes = getAll('DestinyPresentationNodeDefinition');
  const catNodeHash = presentationNodes.find(
    (p) =>
      p.displayProperties.name === 'Exotic Catalysts' && p.children.presentationNodes.length > 1
  )?.hash;
  return catNodeHash;
}

function fuzzyNameMatcher(itemName: string, recordName: string) {
  const minRatio = 50;
  const itemNameWords = scrubWords(itemName);
  const recordNameWords = scrubWords(recordName);
  const matchedWords = itemNameWords.filter((word) => recordNameWords.includes(word));
  const ratio = +((100 * matchedWords.length) / itemNameWords.length).toPrecision(2);
  if (ratio >= minRatio && ratio < 100) {
    // Log the fuzzy results
    console.log(itemNameWords, recordNameWords, ratio);
  }
  return ratio >= minRatio;
}

function scrubWords(itemName: string) {
  return itemName
    .replace(exoticNameRemovalRegex, '') // Duplicate words [Catalyst, Lance, of, Dead]
    .split(' ')
    .filter(Boolean);
}

function noCatalystOverride(itemName: string) {
  // TODO: Need a better way to exclude these
  switch (itemName) {
    case 'Bastion':
    case "Devil's Ruin":
      return false;
    default:
      return true;
  }
}

function deduplicateNames(stringArray: string[]) {
  const arr = stringArray.join(' ').split(' ');
  const duplicateElements = arr.filter((item, index) => arr.indexOf(item) !== index);
  duplicateElements.push("'s"); // Skyburner's Oath
  duplicateElements.splice(duplicateElements.indexOf('Acrius'), 1);
  return duplicateElements;
}

function makeRegexFromUnduplicateNames(stringArray: string[]) {
  const readyForRegex = [...new Set(stringArray)]; // Good to go until we get a "Lance of the Dead Catalyst"
  return new RegExp(readyForRegex.join('\\b|'), 'gi');
}
