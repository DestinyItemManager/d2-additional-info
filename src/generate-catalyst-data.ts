import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { DestinyRecordDefinition } from 'bungie-api-ts/destiny2';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { diffArrays, writeFile } from './helpers.js';

loadLocal();

const exoticWeaponHashesWithCatalyst: Number[] = [];
const exoticWeaponHashToCatalystRecord: Record<string, number> = {};
const catalystRecordNames: string[] = [];

const matchTracker: [{ itemName: string; catalystName: string; percentMatch: number }] = [
  { itemName: '', catalystName: '', percentMatch: 0 },
];

const catalystPresentationNodeHash = getCatalystPresentationNodeHash();

const inventoryItems = getAll('DestinyInventoryItemDefinition').filter(
  (i) => !i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies)
);

// this is keyed with record hashes, and the values are catalyst inventoryItem icons
// (more interesting than the all-identical icons on catalyst triumphs)
const triumphData: any = { icon: String, source: String };

// Generate List of Exotic Weapon Hashes
const allExoticWeaponHashes = inventoryItems
  .filter((i) => i.equippingBlock?.uniqueLabel === 'exotic_weapon')
  .map((i) => i.hash);

// Generate List of Exotic Weapon Names
const allExoticWeaponNames = inventoryItems
  .filter(
    (i) => i.equippingBlock?.uniqueLabel === 'exotic_weapon' && i.collectibleHash // Avoid non-upgraded Legend of Acrius
  )
  .map((i) => i.displayProperties.name);

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

const exoticNameRemovalRegex = makeRegexFromUnduplicatedNames(
  deduplicateNames(allExoticWeaponNames).concat(deduplicateNames(catalystRecordNames))
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
        const exoticWithCatalyst = inventoryItems.find(
          (i) =>
            i.equippingBlock?.uniqueLabel === 'exotic_weapon' &&
            i.collectibleHash && // Avoid non-upgraded Legend of Acrius
            fuzzyNameMatcher(i.displayProperties.name, recordName) &&
            noCatalystOverride(i.displayProperties.name, recordInfo)
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
console.table(matchTracker.shift() && matchTracker);
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
    matchTracker.push({
      itemName: itemNameWords.join(' '),
      catalystName: recordNameWords.join(' '),
      percentMatch: ratio,
    });
  }
  return ratio >= minRatio;
}

function scrubWords(itemName: string) {
  return itemName
    .replace(exoticNameRemovalRegex, '') // Duplicate words [Catalyst, Lance, of, Dead]
    .split(' ')
    .filter(Boolean);
}

function noCatalystOverride(itemName: string, recordInfo: DestinyRecordDefinition) {
  if (itemName === "Leviathan's Breath") {
    // Only actual catalyst with a record scope of 1 [Character]
    return true;
  }
  switch (recordInfo.scope) {
    case 1: // Should filter out Bastion and Devil's Ruin
      return false;
    default:
      return true;
  }
}

function deduplicateNames(stringArray: string[]) {
  const arr = stringArray.join(' ').split(' ');
  const duplicateElements = arr.filter((item, index) => arr.indexOf(item) !== index);
  duplicateElements.push("'s"); // Skyburner's Oath - Skyburner Catalyst
  return duplicateElements;
}

function makeRegexFromUnduplicatedNames(stringArray: string[]) {
  const readyForRegex = [...new Set(stringArray)]; // Good to go until we get a "Lance of the Dead Catalyst"
  const rgx = new RegExp(readyForRegex.join('\\b|'), 'gi');
  console.log(`Duplicate Word Regex:\n${rgx}`);
  return rgx;
}
