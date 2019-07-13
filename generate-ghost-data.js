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
    ghostPerks[hash] = {
      location: getLocation(description),
      range: getRange(description),
      type: getType(description),
      improved: getImproved(name, description),
      telemetryType: getTelemetryType(description),
      boost: getBoost(description)
    };
  }
});

writeFilePretty('output/ghost-perks.json', ghostPerks);

function getLocation(description) {
  if (description.includes('EDZ')) {
    return 'edz';
  } else if (description.includes('Titan')) {
    return 'titan';
  } else if (description.includes('Nessus')) {
    return 'nessus';
  } else if (description.includes('Io')) {
    return 'io';
  } else if (description.includes('Mercury')) {
    return 'mercury';
  } else if (description.includes('Hellas Basin')) {
    return 'mars';
  } else if (description.includes('Tangled Shore')) {
    return 'tangled';
  } else if (description.includes('Dreaming City')) {
    return 'dreaming';
  } else if (description.includes('Vanguard') || description.includes('Strike')) {
    return 'strikes';
  } else if (description.includes('Crucible')) {
    return 'crucible';
  } else if (description.includes('Gambit')) {
    return 'gambit';
  } else if (description.includes('in the raids "Leviathan"')) {
    return 'raid';
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
    return 'xp';
  } else if (description.includes('caches') && description.includes('resources')) {
    return 'combo';
  } else if (description.includes('Detect resources')) {
    return 'resource';
  } else if (description.includes('Detect caches') || description.includes('Detects caches')) {
    return 'cache';
  } else if (description.includes('hance to obtain additional')) {
    return 'scanner';
  } else if (description.includes('Increase Glimmer gains')) {
    return 'glimmer';
  } else if (description.includes('Generate Gunsmith telemetry')) {
    return 'telemetry';
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
