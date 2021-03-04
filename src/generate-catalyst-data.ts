import { get, getAll, loadLocal } from '@d2api/manifest/node';
import { writeFile } from './helpers';

loadLocal();

const catalystPresentationNodeHash = 1984921914;

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

      const itemWithSameName_Source = OtherSourceFromName(recordName);

      const source = itemWithSameName_Source?.hash ?? NoSourceToSource(recordName);

      const key = !source ? SourceI18nKeyName(recordName) : null;

      const questHash = findQuestLine(recordName)?.hash;

      const missionHash = findMission(recordName)?.hash;

      // this "if" check is because of classified data situations
      if (icon) {
        triumphData[r.recordHash] = {};
        triumphData[r.recordHash].icon = icon;
        triumphData[r.recordHash].source = source;
        triumphData[r.recordHash].key = key;
        triumphData[r.recordHash].questHash = questHash;
        triumphData[r.recordHash].missionHash = missionHash;
      } else {
        console.log(`no catalyst image found for ${r.recordHash} ${recordName}`);
      }
    }
  )
);

writeFile('./output/catalyst-triumph-info.json', triumphData);

function NoSourceToSource(name: string | undefined) {
  switch (name?.replace(' Catalyst', '')) {
    // Found in strikes and the Crucible.
    case 'Ace of Spades':
      return OtherSourceFromName('Sunshot Catalyst')?.hash;

    // Found by defeating the enemies of Humanity wherever they lurk.
    case 'Cerberus+1':
      return OtherSourceFromName('Crimson Catalyst')?.hash;

    // Found by completing playlist activities.
    case 'Bad Juju':
    case "Izanagi's Burden":
    case 'Lumina':
    case 'Lord of Wolves':
    case 'Trinity Ghoul':
    case 'Black Talon':
      return OtherSourceFromName('Skyburner Catalyst')?.hash;
    default:
      return null;
  }
}

function OtherSourceFromName(name: string | undefined) {
  return inventoryItems.find(
    (i) =>
      i.displayProperties.name === name &&
      i.itemType === 20 &&
      i.displayProperties.iconSequences &&
      i.displayProperties.iconSequences.length > 0
  );
}

function SourceI18nKeyName(name: string | undefined) {
  switch (name?.replace(' Catalyst', '')) {
    case "Dead Man's Tale":
    case "Eriana's Vow":
    case "Tommy's Matchbook":
    case "Ticuu's Divination":
    case 'Duality':
    case 'No Time to Explain':
    case 'Witherhoard':
    case 'Symmetry':
      return 'Quest';
    case 'Hawkmoon':
    case 'Outbreak Perfected':
      return 'Mission';
    case 'The Fourth Horseman':
    case 'Ruinous Effigy':
    case "Leviathan's Breath":
      return name?.replace('Catalyst', '').replace(/'/g, '').replace(/ /g, '');
    default:
      return null;
  }
}

function findQuestLineName(name: string) {
  return inventoryItems.find((i) => i.setData?.questLineName === name);
}

function findQuestLine(name: string | undefined) {
  switch (name?.replace(' Catalyst', '')) {
    case "Dead Man's Tale":
      return findQuestLineName('At Your Fingertips');
    case "Eriana's Vow":
      return findQuestLineName('The Vow');
    case "Tommy's Matchbook":
      return findQuestLineName('A Good Match');
    case "Ticuu's Divination":
      return findQuestLineName('Points Piercing Forever');
    case 'Duality':
      return findQuestLineName('Walk the Line');
    case 'No Time to Explain':
      return findQuestLineName('Soon');
    case 'Witherhoard':
      return findQuestLineName('The Bank Job');
    case 'Symmetry':
      return findQuestLineName('Symmetry Remastered');
    default:
      return null;
  }
}

function findMissionName(name: string) {
  return activity.find((a) => a.displayProperties.name === name);
}

function findMission(name: string | undefined) {
  switch (name?.replace(' Catalyst', '')) {
    case 'Hawkmoon':
      return findMissionName('Harbinger');
    case 'Outbreak Perfected':
      return findMissionName('Zero Hour (Heroic)');
    default:
      return null;
  }
}
