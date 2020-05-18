const { writeFile, getMostRecentManifest } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const vendor = mostRecentManifestLoaded.DestinyVendorDefinition;
const seasons = require('./data/seasons/seasons_master.json');
const brightEngramExclusions = [
  'Crimson',
  'the Revelry',
  'Dawning',
  'Festival of the Lost',
  'Solstice'
];
const brightEngrams = {};
const EngramCategoryHash = 34;
const hasTerm = (string, terms) => terms.map((term) => string.includes(term)).includes(true);

Object.keys(inventoryItem).forEach(function(key) {
  const hash = inventoryItem[key].hash;
  const categoryHashes = inventoryItem[key].itemCategoryHashes || [];
  const description = inventoryItem[key].displayProperties.description;
  const name = inventoryItem[key].displayProperties.name;
  const type = inventoryItem[key].itemTypeDisplayName;
  if (
    categoryHashes.includes(EngramCategoryHash) &&
    type.includes('Bright Engram') &&
    !hasTerm(description, brightEngramExclusions) &&
    !hasTerm(name, brightEngramExclusions)
  ) {
    const season = seasons[hash];
    if (vendor[hash]) {
      brightEngrams[season] = hash;
    }
  }
});

writeFile('./output/bright-engrams.json', brightEngrams);
