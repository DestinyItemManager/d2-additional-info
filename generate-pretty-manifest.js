const { getMostRecentManifest, writeFilePretty } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const tables = [
  'Activity',
  'ActivityMode',
  'ActivityModifier',
  'ActivityType',
  'Class',
  'Collectible',
  'Destination',
  'Faction',
  'Gender',
  'InventoryBucket',
  'InventoryItem',
  'ItemCategory',
  'ItemTierType',
  'Milestone',
  'Objective',
  'Place',
  'PlugSet',
  'PresentationNode',
  'Progression',
  'Race',
  'Record',
  'SandboxPerk',
  'SocketCategory',
  'SocketType',
  'Stat',
  'TalentGrid',
  'Vendor',
  'VendorGroup'
];

for (var i = 0; i < tables.length; i++) {
  writeFilePretty(
    `./manifest_tables/${tables[i]}.json`,
    mostRecentManifestLoaded[`Destiny${tables[i]}Definition`]
  );
}

writeFilePretty('./manifest_tables/all.json', mostRecentManifestLoaded);
