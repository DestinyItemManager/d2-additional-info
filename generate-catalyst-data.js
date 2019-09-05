const { writeFile, getMostRecentManifest } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const presentationNode = mostRecentManifestLoaded.DestinyPresentationNodeDefinition;
const record = mostRecentManifestLoaded.DestinyRecordDefinition;

const triumphIcons = {};

presentationNode[1111248994].children.presentationNodes.forEach((p) =>
  presentationNode[p.presentationNodeHash].children.records.forEach((r) => {
    triumphIcons[r.recordHash] = Object.values(inventoryItem).find(
      (i) =>
        i.displayProperties.name === record[r.recordHash].displayProperties.name &&
        i.inventory.tierType === 6
    ).displayProperties.icon;
  })
);

writeFile('./output/catalyst-triumph-icons.json', triumphIcons);
