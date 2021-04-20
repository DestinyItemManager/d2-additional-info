import { get, getAll, loadLocal } from '@d2api/manifest/node';
import { writeFile } from './helpers';

loadLocal();

const catalystPresentationNodeHash = 1984921914;

const catalystInfo: Record<
  string,
  {
    missionName?: string;
    questName?: string;
    sameAs?: string;
    key?: boolean;
    collectibleName?: string;
  }
> = {
  'Hawkmoon Catalyst': { missionName: 'Harbinger' },
  'Outbreak Perfected Catalyst': { missionName: 'Zero Hour (Heroic)' },
  "Dead Man's Tale Catalyst": { questName: 'At Your Fingertips' },
  "Eriana's Vow Catalyst": { questName: 'The Vow' },
  "Tommy's Matchbook Catalyst": { questName: 'A Good Match' },
  "Ticuu's Divination Catalyst": { questName: 'Points Piercing Forever' },
  'Duality Catalyst': { questName: 'Walk the Line' },
  'No Time to Explain Catalyst': { questName: 'Soon' },
  'Witherhoard Catalyst': { questName: 'The Bank Job' },
  'Symmetry Catalyst': { questName: 'Symmetry Remastered' },
  'Ace of Spades Catalyst': { sameAs: 'Sunshot Catalyst' },
  'Cerberus+1 Catalyst': { sameAs: 'Crimson Catalyst' },
  'Bad Juju Catalyst': { sameAs: 'Skyburner Catalyst' },
  "Izanagi's Burden Catalyst": { sameAs: 'Skyburner Catalyst' },
  'Lumina Catalyst': { sameAs: 'Skyburner Catalyst' },
  'Lord of Wolves Catalyst': { sameAs: 'Skyburner Catalyst' },
  'Trinity Ghoul Catalyst': { sameAs: 'Skyburner Catalyst' },
  'Black Talon Catalyst': { sameAs: 'Skyburner Catalyst' },
  'The Fourth Horseman Catalyst': { key: true },
  'Ruinous Effigy Catalyst': { key: true },
  "Leviathan's Breath Catalyst": { key: true },
  'Heir Apparent Catalyst': { key: true },
};

const inventoryItems = getAll('DestinyInventoryItemDefinition');
const activity = getAll('DestinyActivityDefinition');

// this is keyed with record hashes, and the values are catalyst inventoryItem icons
// (more interesting than the all-identical icons on catalyst triumphs)
const triumphData: any = { icon: String, source: String };

// loop the catalyst section of triumphs
get(
  'DestinyPresentationNodeDefinition',
  catalystPresentationNodeHash
)?.children.presentationNodes.forEach((p) =>
  get('DestinyPresentationNodeDefinition', p.presentationNodeHash)?.children.records.forEach(
    (r) => {
      const recordName = get('DestinyRecordDefinition', r.recordHash)?.displayProperties.name;

      // look for an inventoryItem with the same name, and tierType 6 (should find the catalyst for that gun)
      const itemWithSameName_Icon = inventoryItems.find(
        (i) => i.displayProperties.name === recordName && i.inventory!.tierType === 6
      );

      // and get its icon image
      const icon = itemWithSameName_Icon?.displayProperties?.icon;

      // this "if" check is because of classified data situations
      if (icon) {
        triumphData[r.recordHash] = {};
        triumphData[r.recordHash].icon = icon;
        triumphData[r.recordHash].source = generateSource(recordName);
        triumphData[r.recordHash].key = generateI18nKey(recordName);
        triumphData[r.recordHash].titleHash = generateTitleHash(recordName);
      } else {
        console.log(`no catalyst image found for ${r.recordHash} ${recordName}`);
      }
    }
  )
);

writeFile('./output/catalyst-triumph-info.json', triumphData);

function generateSource(name: string | undefined) {
  if (name) {
    return (
      otherSourceFromName(name)?.hash ??
      otherSourceFromName(catalystInfo[name]?.sameAs ?? undefined)?.hash
    );
  }
  return null;
}

function otherSourceFromName(name: string | undefined) {
  return name
    ? inventoryItems.find(
        (i) =>
          i.displayProperties.name === name &&
          i.itemType === 20 &&
          i.displayProperties.iconSequences &&
          i.displayProperties.iconSequences.length > 0
      )
    : { hash: null };
}

function generateI18nKey(name: string | undefined) {
  if (name) {
    if (catalystInfo[name]?.questName) {
      return 'Quest';
    }
    if (catalystInfo[name]?.missionName) {
      return 'Mission';
    }
    if (catalystInfo[name]?.key) {
      return name.replace('Catalyst', '').replace(/'/g, '').replace(/ /g, '');
    }
  }
  return null;
}

function generateTitleHash(name: string | undefined) {
  if (name) {
    if (catalystInfo[name]?.questName) {
      return inventoryItems.find((i) => i.setData?.questLineName === catalystInfo[name].questName)
        ?.hash;
    }
    if (catalystInfo[name]?.missionName) {
      return activity.find((a) => a.displayProperties.name === catalystInfo[name].missionName)
        ?.hash;
    }
  }
  return null;
}
