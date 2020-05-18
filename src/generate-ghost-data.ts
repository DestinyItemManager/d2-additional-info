const { writeFile, getMostRecentManifest } = require('./helpers.js');

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
      type: getType(description.toLowerCase(), name.toLowerCase())
    };
  }
});

writeFile('./output/ghost-perks.json', ghostPerks);

function getLocation(description) {
  const lc_description = description.toLowerCase();
  if (lc_description.includes('edz')) {
    return 'edz';
  } else if (lc_description.includes('titan')) {
    return 'titan';
  } else if (lc_description.includes('nessus')) {
    return 'nessus';
  } else if (description.includes('Io')) {
    return 'io';
  } else if (lc_description.includes('mercury')) {
    return 'mercury';
  } else if (lc_description.includes('hellas basin')) {
    return 'mars';
  } else if (lc_description.includes('tangled shore')) {
    return 'tangled';
  } else if (lc_description.includes('dreaming city')) {
    return 'dreaming';
  } else if (lc_description.includes('vanguard') || lc_description.includes('strike')) {
    return 'strikes';
  } else if (lc_description.includes('crucible')) {
    return 'crucible';
  } else if (lc_description.includes('gambit')) {
    return 'gambit';
  } else if (lc_description.includes('leviathan')) {
    return 'leviathan';
  } else if (lc_description.includes('moon')) {
    return 'moon';
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
    improved: getImproved(description, name)
  };

  if (description.includes('xp')) {
    type.xp = true;
  }
  if (description.includes('caches')) {
    type.cache = true;
  }
  if (description.includes('resources')) {
    type.resource = true;
  }
  if (description.includes('chance to obtain additional')) {
    type.scanner = true;
  }
  if (description.includes('glimmer')) {
    type.glimmer = true;
  }
  if (description.includes('generate gunsmith telemetry')) {
    if (description.includes('arc weapon kills')) {
      type.telemetry.arc = true;
    } else if (description.includes('void weapon kills')) {
      type.telemetry.void = true;
    } else if (description.includes('solar weapon kills')) {
      type.telemetry.solar = true;
    } else if (description.includes('any elemental weapon kills')) {
      type.telemetry.arc = true;
      type.telemetry.void = true;
      type.telemetry.solar = true;
    }
  }
  return type;
}

function getImproved(description, name) {
  if (name.includes('improved') || description.includes('at an increased rate')) {
    return true;
  }
  return false;
}
