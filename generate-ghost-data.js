const { writeFilePretty, getMostRecentManifest } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItem = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const ghostPerks = {};
const ghostPerkCategoryHash = 4176831154;
const ghostPerkHashBlacklist = [2328497849]; // "Random Mod"

Object.keys(inventoryItem).forEach(function(key) {
  const hash = inventoryItem[key].hash;
  const categoryHashes = inventoryItem[key].itemCategoryHashes || [];
  const description = inventoryItem[key].displayProperties.description;
  const name = inventoryItem[key].displayProperties.name;
  if (categoryHashes.includes(ghostPerkCategoryHash) && !ghostPerkHashBlacklist.includes[hash]) {
    ghostPerks[hash] = {
      location: getLocation(description),
      type: getType(description, name)
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
  } else if (
    description.includes('Vanguard') ||
    description.includes('Strike') ||
    description.includes('strikes')
  ) {
    return 'strikes';
  } else if (description.includes('Crucible')) {
    return 'crucible';
  } else if (description.includes('Gambit')) {
    return 'gambit';
  } else if (description.includes('in the raids "Leviathan"')) {
    return 'leviathan';
  } else {
    return false;
  }
}

function getType(description, name) {
  type = {
    xp: false,
    resource: false,
    cache: false,
    scanner: false,
    glimmer: false,
    telemetry: {
      arc: false,
      void: false,
      solar: false
    },
    improved: false
  };

  if (description.includes('XP')) {
    type.xp = true;
  }
  if (description.includes('caches')) {
    type.cache = true;
  }
  if (description.includes('resources')) {
    type.resource = true;
  }
  if (description.includes('hance to obtain additional')) {
    type.scanner = true;
  }
  if (description.includes('Glimmer')) {
    type.glimmer = true;
  }
  if (description.includes('Generate Gunsmith telemetry')) {
    if (description.includes('Arc weapon kills')) {
      type.telemetry.arc = true;
    } else if (description.includes('Void weapon kills')) {
      type.telemetry.void = true;
    } else if (description.includes('Solar weapon kills')) {
      type.telemetry.solar = true;
    } else if (description.includes('any elemental weapon kills')) {
      type.telemetry.arc = true;
      type.telemetry.void = true;
      type.telemetry.solar = true;
    }
    type.improved = getImproved(description, name);
  }
  return type;
}

function getImproved(description, name) {
  if (name.includes('Improved') || description.includes('at an increased rate')) {
    return true;
  }
  return false;
}
