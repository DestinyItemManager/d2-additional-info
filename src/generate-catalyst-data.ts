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
    key?: string;
  }
> = {
  'Hawkmoon Catalyst': { missionName: 'Harbinger', key: 'Mission' },
  'Outbreak Perfected Catalyst': { missionName: 'Zero Hour (Heroic)', key: 'Mission' },
  "Dead Man's Tale Catalyst": { questName: 'At Your Fingertips', key: 'Quest' },
  "Eriana's Vow Catalyst": { questName: 'The Vow', key: 'Quest' },
  "Tommy's Matchbook Catalyst": { questName: 'A Good Match', key: 'Quest' },
  "Ticuu's Divination Catalyst": { questName: 'Points Piercing Forever', key: 'Quest' },
  'Duality Catalyst': { questName: 'Walk the Line', key: 'Quest' },
  'No Time to Explain Catalyst': { questName: 'Soon', key: 'Quest' },
  'Witherhoard Catalyst': { questName: 'The Bank Job', key: 'Quest' },
  'Symmetry Catalyst': { questName: 'Symmetry Remastered', key: 'Quest' },
  'Ace of Spades Catalyst': { sameAs: 'Sunshot Catalyst' },
  'Cerberus+1 Catalyst': { sameAs: 'Crimson Catalyst' },
  'Bad Juju Catalyst': { sameAs: 'Skyburner Catalyst' },
  "Izanagi's Burden Catalyst": { sameAs: 'Skyburner Catalyst' },
  'Lumina Catalyst': { sameAs: 'Skyburner Catalyst' },
  'Lord of Wolves Catalyst': { sameAs: 'Skyburner Catalyst' },
  'Trinity Ghoul Catalyst': { sameAs: 'Skyburner Catalyst' },
  'Black Talon Catalyst': { sameAs: 'Skyburner Catalyst' },
  'The Fourth Horseman Catalyst': { key: 'TheFourthHorseman' },
  'Ruinous Effigy Catalyst': { key: 'RuinousEffigy' },
  "Leviathan's Breath Catalyst": { key: 'LeviathansBreath' },
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

      // and get its icon image, source, key, and/or titleHash
      const icon = itemWithSameName_Icon?.displayProperties?.icon;
      const source = recordName
        ? OtherSourceFromName(recordName)?.hash ??
          OtherSourceFromName(catalystInfo[recordName]?.sameAs ?? undefined)?.hash
        : null;
      const key = recordName ? catalystInfo[recordName]?.key ?? null : null;
      const titleHash = recordName
        ? key === 'Quest'
          ? findQuestLineName(catalystInfo[recordName].questName)?.hash
          : key === 'Mission'
          ? findMissionName(catalystInfo[recordName].missionName)?.hash
          : undefined
        : undefined;

      // this "if" check is because of classified data situations
      if (icon) {
        triumphData[r.recordHash] = {};
        triumphData[r.recordHash].icon = icon;
        triumphData[r.recordHash].source = source;
        triumphData[r.recordHash].key = key;
        triumphData[r.recordHash].titleHash = titleHash;
      } else {
        console.log(`no catalyst image found for ${r.recordHash} ${recordName}`);
      }
    }
  )
);

writeFile('./output/catalyst-triumph-info.json', triumphData);

function OtherSourceFromName(name: string | undefined) {
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

function findQuestLineName(name: string | undefined) {
  return inventoryItems.find((i) => i.setData?.questLineName === name);
}

function findMissionName(name: string | undefined) {
  return activity.find((a) => a.displayProperties.name === name);
}
