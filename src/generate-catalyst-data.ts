import { get, getAll, loadLocal } from 'destiny2-manifest/node';

import { writeFile } from './helpers';

loadLocal();
const inventoryItems = getAll('DestinyInventoryItemDefinition');

// this is keyed with record hashes, and the values are catalyst inventoryItem icons
// (more interesting than the all-identical icons on catalyst triumphs)
const triumphData: any = { icon: String, source: String, name: String };

// loop the catalyst section of triumphs
get('DestinyPresentationNodeDefinition', 1111248994)?.children.presentationNodes.forEach((p) =>
  get('DestinyPresentationNodeDefinition', p.presentationNodeHash)?.children.records.forEach(
    (r) => {
      const recordName = get('DestinyRecordDefinition', r.recordHash)?.displayProperties.name;

      // look for an inventoryItem with the same name, and tierType 6 (should find the catalyst for that gun)
      const itemWithSameName = inventoryItems.find(
        (i) => i.displayProperties.name === recordName && i.inventory.tierType === 6
      );

      const item2WithSameName = inventoryItems.find(
        (i) =>
          i.displayProperties.name === recordName &&
          i.itemType === 20 &&
          i.displayProperties.iconSequences &&
          i.displayProperties.iconSequences.length > 0
      );

      const name = itemWithSameName?.displayProperties?.name;
      // and get its source
      const source = `Source: ${
        item2WithSameName?.displayProperties?.description
          ? item2WithSameName?.displayProperties?.description
          : NoSourceToSource(name)
      }`;

      // this "if" check is because of classified data situations
      if (source) {
        triumphData[r.recordHash] = {};
        triumphData[r.recordHash].name = name;
        triumphData[r.recordHash].icon = itemWithSameName?.displayProperties?.icon;
        triumphData[r.recordHash].source = source;
      } else {
        console.log(`no catalyst image found for ${r.recordHash} ${recordName}`);
      }
    }
  )
);

writeFile('./output/catalyst-triumph-icons.json', triumphData);

function NoSourceToSource(name: string | undefined) {
  switch (name) {
    case 'Symmetry Catalyst':
      return 'Complete the "Symmetry Remastered" quest from Banshee-44.';
    case 'Outbreak Perfected Catalyst':
      return 'Found in the Heroic version of Zero Hour';
    case 'Cerberus+1 Catalyst':
      return 'Found by defeating the enemies of humanity wherever they lurk.';
    case 'Bad Juju Catalyst':
      return 'Found in The Tribute Hall';
    case 'SUROS Regime Catalyst':
      return 'Found by earning victory in the Crucible.';
    case "Izanagi's Burden Catalyst":
      return 'Found in the heroic version of the Menagerie';
    case 'Ace of Spades Catalyst':
      return 'Found in strikes against the most challenging opponents.';
    case 'The Fourth Horseman Catalyst':
      return 'Found in Seraph Tower Public Events or Legendary Lost Sectors';

    case 'Lumina Catalyst':
    case 'Black Talon Catalyst':
    case 'Lord of Wolves Catalyst':
      return 'Found in strikes and the Crucible.';

    case "Eriana's Vow Catalyst":
    case "Tommy's Matchbook Catalyst":
      return 'Found in Season Pass';

    case 'Bastion Catalyst':
    case "Devil's Ruin Catalyst":
    default:
      return 'Not currently available.';
  }
}
