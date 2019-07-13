const { writeFilePretty, getMostRecentManifest } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const ghostPerks = {};
const ghostPerkCategoryHash = 4176831154;

Object.keys(inventoryItem).forEach(function(key) {
  const hash = inventoryItem[key].hash;
  const categoryHashes = inventoryItem[key].itemCategoryHashes || [];
  const description = inventoryItem[key].displayProperties.description;
  const name = inventoryItem[key].displayProperties.name;
  if (categoryHashes.includes(ghostPerkCategoryHash)) {
    ghostPerks[hash] = {};
    ghostPerks[hash].location = getLocation(description);
    ghostPerks[hash].range = getRange(description);
    ghostPerks[hash].type = getType(description);
    ghostPerks[hash].improved = getImproved(name, description);
    ghostPerks[hash].telemetryType = getTelemetryType(description);
    ghostPerks[hash].boost = getBoost(description);
  }
});

writeFilePretty('output/ghost-perks.json', ghostPerks);

function getLocation(description) {
  if (description.includes('EDZ')) {
    return 'EDZ';
  } else if (description.includes('Titan')) {
    return 'Titan';
  } else if (description.includes('Nessus')) {
    return 'Nessus';
  } else if (description.includes('Io')) {
    return 'Io';
  } else if (description.includes('Mercury')) {
    return 'Mercury';
  } else if (description.includes('Hellas Basin')) {
    return 'Mars';
  } else if (description.includes('Tangled Shore')) {
    return 'Tangled Shore';
  } else if (description.includes('Dreaming City')) {
    return 'Dreaming City';
  } else if (description.includes('Vanguard') || description.includes('Strike')) {
    return 'Strikes';
  } else if (description.includes('Crucible')) {
    return 'Crucible';
  } else if (description.includes('Gambit')) {
    return 'Gambit';
  } else {
    return false;
  }
}

function getRange(description) {
  if (description.includes('30-meter range')) {
    return 30;
  } else if (description.includes('40-meter range')) {
    return 40;
  } else if (description.includes('50-meter range')) {
    return 50;
  } else if (description.includes('75-meter range')) {
    return 75;
  } else {
    return false;
  }
}

function getType(description) {
  if (description.includes('XP')) {
    return 'XP';
  } else if (
    description.includes('Detect caches or resources') ||
    description.includes('Detects caches and resources')
  ) {
    return 'Combo';
  } else if (description.includes('Detect resources')) {
    return 'Resource';
  } else if (description.includes('Detect caches') || description.includes('Detects caches')) {
    return 'Cache';
  } else if (description.includes('hance to obtain additional')) {
    return 'Scanner';
  } else if (description.includes('Increase Glimmer gains')) {
    return 'Glimmer';
  } else if (description.includes('Generate Gunsmith telemetry')) {
    return 'Telemetry';
  } else {
    return false;
  }
}

function getImproved(name, description) {
  if (name.includes('Improved')) {
    return true;
  } else if (description.includes('at an increased rate')) {
    return true;
  } else {
    return false;
  }
}

function getTelemetryType(description) {
  if (description.includes('Arc weapon kills')) {
    return 'arc';
  } else if (description.includes('Void weapon kills')) {
    // Void weapon kills
    return 'void';
  } else if (description.includes('Solar weapon kills')) {
    return 'solar';
  } else if (description.includes('any elemental weapon kills')) {
    return 'all';
  } else {
    return false;
  }
}

function getBoost(description) {
  if (description.includes('10%')) {
    return 10;
  } else {
    return false;
  }
}
