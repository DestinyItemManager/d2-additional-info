const { writeFile, getMostRecentManifest, uniqAndSortArray } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const presentationNode = mostRecentManifestLoaded.DestinyPresentationNodeDefinition;
const record = mostRecentManifestLoaded.DestinyRecordDefinition;

// this is keyed with record hashes, and the values are catalyst inventoryItem icons
// (more interesting than the all-identical icons on catalyst triumphs)
const triumphIcons = {};
const sources = [];
// loop the catalyst section of triumphs
presentationNode[1111248994].children.presentationNodes.forEach((p) =>
  presentationNode[p.presentationNodeHash].children.records.forEach((r) => {
    // look for an inventoryItem with the same name, and tierType 6 (should find the catalyst for that gun)
    const itemWithSameName = Object.values(inventoryItem).find(
      (i) =>
        i.displayProperties.name === record[r.recordHash].displayProperties.name &&
        i.inventory.tierType === 6
    );
    const item2WithSameName = Object.values(inventoryItem).find(
      (i) =>
        i.displayProperties.name === record[r.recordHash].displayProperties.name &&
        i.itemType === 20 &&
        i.displayProperties.iconSequences &&
        i.displayProperties.iconSequences.length > 0
    );
    // and get its source
    const source =
      item2WithSameName &&
      item2WithSameName.displayProperties &&
      item2WithSameName.displayProperties.description;
    sources.push(source);
    // and get its icon image
    const icon =
      itemWithSameName &&
      itemWithSameName.displayProperties &&
      itemWithSameName.displayProperties.icon;
    // this if check is because of classified data situations
    if (icon) triumphIcons[r.recordHash] = itemWithSameName.displayProperties.icon;
    else console.log(`${r.recordHash} ${record[r.recordHash].displayProperties.name}`);
  })
);

console.table(uniqAndSortArray(sources));

writeFile('./output/catalyst-triumph-icons.json', triumphIcons);
